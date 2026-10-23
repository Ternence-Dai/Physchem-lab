function isValidSnapshotTimestamp(value) {
  if (typeof value !== "string") return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?(Z|([+-])(\d{2}):(\d{2}))$/.exec(value);
  if (!match) return false;
  const [, yearText, monthText, dayText, hourText, minuteText, secondText, , zone, , offsetHourText, offsetMinuteText] = match;
  const year = Number(yearText), month = Number(monthText), day = Number(dayText);
  const hour = Number(hourText), minute = Number(minuteText), second = Number(secondText);
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const monthDays = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const daysInMonth = monthDays[month - 1] || 0;
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth ||
      hour > 23 || minute > 59 || second > 59) return false;
  if (zone !== "Z") {
    const offsetHour = Number(offsetHourText), offsetMinute = Number(offsetMinuteText);
    if (offsetMinute > 59 || offsetHour > 14 || (offsetHour === 14 && offsetMinute !== 0)) return false;
  }
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return false;
  const normalizedYear = new Date(timestamp).getUTCFullYear();
  return normalizedYear >= 0 && normalizedYear <= 9999;
}

function snapshotDate(snapshot) {
  return snapshot.snapshotAt || snapshot.time || "时间未知";
}

function numericValueAndUnit(raw) {
  if (typeof raw !== "string") return null;
  const match = /^\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)\s*(.*?)\s*$/i.exec(raw);
  if (!match) return null;
  const value = Number(match[1]);
  if (!Number.isFinite(value)) return null;
  return { value, unit: match[2].trim() };
}

function frozen(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.keys(value).forEach(key => frozen(value[key]));
  }
  return value;
}

export function compareExperimentArchiveSnapshots(left, right) {
  const blocked = reason => Object.freeze({ compatible: false, reason, readouts: [], parameters: [] });
  if (!left || !right || typeof left !== "object" || typeof right !== "object") {
    return blocked("请选择两份有效的实验档案快照。");
  }
  if (left.experimentSnapshotVersion !== 1 || right.experimentSnapshotVersion !== 1 ||
      !isValidSnapshotTimestamp(left.snapshotAt) || !isValidSnapshotTimestamp(right.snapshotAt)) {
    return blocked("旧版档案缺少稳定的实验 ID 或结果时间戳，不能保证模型与结果口径一致。");
  }
  if (typeof left.experimentId !== "string" || !left.experimentId ||
      left.experimentId !== right.experimentId) {
    return blocked("两份档案不是同一个实验模型，已阻止跨实验比较。");
  }
  if (typeof left.modelVersion !== "string" || !left.modelVersion ||
      left.modelVersion !== right.modelVersion) {
    return blocked("两份档案的模型版本不同，不能直接比较计算结果。");
  }
  if (!left.params || !right.params || !Array.isArray(left.readouts) || !Array.isArray(right.readouts)) {
    return blocked("档案缺少参数或结果快照，无法完成对照。");
  }

  const leftParams = left.params;
  const rightParams = right.params;
  const parameterKeys = [...new Set([...Object.keys(leftParams), ...Object.keys(rightParams)])].sort();
  const parameters = parameterKeys.map(key => ({
    key,
    leftValue: Object.prototype.hasOwnProperty.call(leftParams, key) ? leftParams[key] : null,
    rightValue: Object.prototype.hasOwnProperty.call(rightParams, key) ? rightParams[key] : null,
    changed: !Object.prototype.hasOwnProperty.call(leftParams, key) ||
      !Object.prototype.hasOwnProperty.call(rightParams, key) || leftParams[key] !== rightParams[key]
  }));

  function readoutMap(rows) {
    const map = new Map();
    for (const row of rows) {
      if (!row || typeof row.label !== "string" || !row.label.trim() ||
          typeof row.value !== "string") continue;
      const key = row.label.trim();
      if (map.has(key)) return null;
      map.set(key, row.value);
    }
    return map;
  }
  const leftReadouts = readoutMap(left.readouts);
  const rightReadouts = readoutMap(right.readouts);
  if (!leftReadouts || !rightReadouts) return blocked("某份档案的结果标签重复，无法保证一一对应。");

  const labels = [...new Set([...leftReadouts.keys(), ...rightReadouts.keys()])].sort();
  const readouts = labels.map(label => {
    const hasLeft = leftReadouts.has(label);
    const hasRight = rightReadouts.has(label);
    const leftValue = hasLeft ? leftReadouts.get(label) : null;
    const rightValue = hasRight ? rightReadouts.get(label) : null;
    const leftParsed = hasLeft ? numericValueAndUnit(leftValue) : null;
    const rightParsed = hasRight ? numericValueAndUnit(rightValue) : null;
    const sameUnit = !!leftParsed && !!rightParsed && leftParsed.unit === rightParsed.unit;
    const candidateDelta = sameUnit ? rightParsed.value - leftParsed.value : null;
    const finiteDelta = sameUnit && Number.isFinite(candidateDelta);
    return {
      label,
      leftValue,
      rightValue,
      unit: finiteDelta ? leftParsed.unit : "",
      delta: finiteDelta ? candidateDelta : null,
      comparable: finiteDelta,
      reason: !hasLeft || !hasRight ? "仅一份档案记录此结果" :
        !leftParsed || !rightParsed ? "非纯数值结果，不计算差值" :
        !sameUnit ? "单位不同，不自动换算" :
        !finiteDelta ? "差值超出数值范围，无法可靠比较" : ""
    };
  });

  return frozen({
    compatible: true,
    experimentId: left.experimentId,
    modelVersion: left.modelVersion,
    left: { name: left.name, time: left.time, snapshotAt: snapshotDate(left) },
    right: { name: right.name, time: right.time, snapshotAt: snapshotDate(right) },
    parameters,
    readouts
  });
}
