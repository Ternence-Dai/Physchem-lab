function isValidSnapshotTimestamp(value) {
  if (typeof value !== "string") return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?(Z|([+-])(\d{2}):(\d{2}))$/.exec(value);
  if (!match) return false;
  const [, yearText, monthText, dayText, hourText, minuteText, secondText, , zone, sign, offsetHourText, offsetMinuteText] = match;
  const year = Number(yearText), month = Number(monthText), day = Number(dayText);
  const hour = Number(hourText), minute = Number(minuteText), second = Number(secondText);
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const monthDays = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const daysInMonth = monthDays[month - 1] || 0;
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth ||
      hour > 23 || minute > 59 || second > 59) return false;
  if (zone !== "Z") {
    const offsetHour = Number(offsetHourText), offsetMinute = Number(offsetMinuteText);
    if (offsetMinute > 59 || offsetHour > 14 || (offsetHour === 14 && offsetMinute !== 0) ||
        (sign === "-" && offsetHour === 0 && offsetMinute === 0)) return false;
  }
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return false;
  const normalizedYear = new Date(timestamp).getUTCFullYear();
  return normalizedYear >= 0 && normalizedYear <= 9999;
}


function sameSnapshotValue(left, right) {
  if (Object.is(left, right)) return true;
  if (!left || !right || typeof left !== "object" || typeof right !== "object") return false;
  if (Array.isArray(left) || Array.isArray(right)) {
    if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) return false;
    for (let index = 0; index < left.length; index += 1) {
      const leftHas = Object.prototype.hasOwnProperty.call(left, index);
      const rightHas = Object.prototype.hasOwnProperty.call(right, index);
      if (leftHas !== rightHas) return false;
      if (leftHas && !sameSnapshotValue(left[index], right[index])) return false;
    }
    return true;
  }
  const leftKeys = Object.keys(left).sort();
  const rightKeys = Object.keys(right).sort();
  return leftKeys.length === rightKeys.length &&
    leftKeys.every((key, index) =>
      key === rightKeys[index] && sameSnapshotValue(left[key], right[key]));
}

function snapshotDate(snapshot) {
  return snapshot.snapshotAt || snapshot.time || "时间未知";
}

function hasUnsafeControlCharacters(value) {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code < 32 || code === 127) return true;
  }
  return false;
}

const MAX_ARCHIVE_TEXT_LENGTH = 120;
function optionalArchiveDisplayText(value) {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string" || value.length > MAX_ARCHIVE_TEXT_LENGTH ||
      hasUnsafeControlCharacters(value)) return null;
  const normalized = value.trim();
  return normalized || undefined;
}

const MAX_ARCHIVE_READOUTS = 30;
const MAX_READOUT_LABEL_LENGTH = 120;
const MAX_READOUT_VALUE_LENGTH = 180;

function numericValueAndUnit(raw) {
  if (typeof raw !== "string") return null;
  const match = /^\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)\s*(.*?)\s*$/i.exec(raw);
  if (!match) return null;
  const value = Number(match[1]);
  if (!Number.isFinite(value)) return null;
  return { value, unit: match[2].trim() };
}

const SAFE_READOUT_UNITS = Object.freeze({
  Pa: Object.freeze({ dimension: "pressure", scale: 1, offset: 0 }),
  kPa: Object.freeze({ dimension: "pressure", scale: 1000, offset: 0 }),
  MPa: Object.freeze({ dimension: "pressure", scale: 1_000_000, offset: 0 }),
  bar: Object.freeze({ dimension: "pressure", scale: 100_000, offset: 0 }),
  K: Object.freeze({ dimension: "temperature", scale: 1, offset: 0 }),
  "°C": Object.freeze({ dimension: "temperature", scale: 1, offset: 273.15 }),
  V: Object.freeze({ dimension: "voltage", scale: 1, offset: 0 }),
  mV: Object.freeze({ dimension: "voltage", scale: 0.001, offset: 0 }),
  A: Object.freeze({ dimension: "current", scale: 1, offset: 0 }),
  mA: Object.freeze({ dimension: "current", scale: 0.001, offset: 0 }),
  W: Object.freeze({ dimension: "power", scale: 1, offset: 0 }),
  kW: Object.freeze({ dimension: "power", scale: 1000, offset: 0 }),
  s: Object.freeze({ dimension: "time", scale: 1, offset: 0 }),
  min: Object.freeze({ dimension: "time", scale: 60, offset: 0 }),
  h: Object.freeze({ dimension: "time", scale: 3600, offset: 0 })
});

function compareReadoutValues(left, right) {
  if (left.unit === right.unit) {
    const delta = right.value - left.value;
    if (!Number.isFinite(delta)) {
      return { comparable: false, delta: null, unit: "", converted: false, reason: "差值超出数值范围，无法可靠比较" };
    }
    return { comparable: true, delta, unit: left.unit, converted: false, reason: "" };
  }
  const leftDefinition = SAFE_READOUT_UNITS[left.unit];
  const rightDefinition = SAFE_READOUT_UNITS[right.unit];
  if (!leftDefinition || !rightDefinition || leftDefinition.dimension !== rightDefinition.dimension) {
    return { comparable: false, delta: null, unit: "", converted: false, reason: "单位不同且不在受控换算表内，不自动换算" };
  }
  const rightInLeftUnit = (
    right.value * rightDefinition.scale + rightDefinition.offset - leftDefinition.offset
  ) / leftDefinition.scale;
  const delta = rightInLeftUnit - left.value;
  if (!Number.isFinite(delta)) {
    return { comparable: false, delta: null, unit: "", converted: false, reason: "换算结果超出数值范围，无法可靠比较" };
  }
  return {
    comparable: true,
    delta,
    unit: left.unit,
    converted: true,
    reason: `右侧单位 ${right.unit} 已按受控换算表转换为左侧单位 ${left.unit}`
  };
}

function isSafeSnapshotObject(value, { maxDepth = 64, maxNodes = 10000 } = {}) {
  const active = new WeakSet();
  let nodes = 0;
  function visit(item, depth) {
    nodes += 1;
    if (nodes > maxNodes || depth > maxDepth) return false;
    if (item === null || typeof item === "string" || typeof item === "boolean") return true;
    if (typeof item === "number") return Number.isFinite(item);
    if (typeof item !== "object") return false;
    if (active.has(item)) return false;
    const prototype = Object.getPrototypeOf(item);
    if (Array.isArray(item)) {
      if (prototype !== Array.prototype) return false;
    } else if (prototype !== Object.prototype && prototype !== null) {
      return false;
    }
    active.add(item);
    let valid = true;
    if (Array.isArray(item)) {
      // JSON arrays may only carry dense enumerable data properties plus the
      // built-in non-enumerable length. Reject symbols, accessors and custom
      // properties rather than silently dropping them during archive cloning.
      const ownKeys = Reflect.ownKeys(item);
      valid = ownKeys.length === item.length + 1 &&
        item.length <= maxNodes - nodes;
      if (valid) {
        for (let index = 0; index < item.length; index += 1) {
          const descriptor = Object.getOwnPropertyDescriptor(item, String(index));
          if (!descriptor || !descriptor.enumerable ||
              !Object.prototype.hasOwnProperty.call(descriptor, "value") ||
              !visit(descriptor.value, depth + 1)) {
            valid = false;
            break;
          }
        }
      }
    } else {
      // Read descriptor values, never item[key]: an accessor on an imported
      // in-memory snapshot must not execute while the archive is being checked.
      const ownKeys = Reflect.ownKeys(item);
      for (const key of ownKeys) {
        if (typeof key !== "string") {
          valid = false;
          break;
        }
        const descriptor = Object.getOwnPropertyDescriptor(item, key);
        if (!descriptor || !descriptor.enumerable ||
            !Object.prototype.hasOwnProperty.call(descriptor, "value") ||
            !visit(descriptor.value, depth + 1)) {
          valid = false;
          break;
        }
      }
    }
    active.delete(item);
    return valid;
  }
  try {
    return !!value && typeof value === "object" && !Array.isArray(value) && visit(value, 0);
  } catch {
    // Proxies and revoked proxies can throw from reflection traps. Treat them
    // as unsafe input rather than allowing archive comparison to crash.
    return false;
  }
}

function frozen(value) {
  if (!value || typeof value !== "object") return value;
  if (Array.isArray(value)) {
    const copy = [];
    for (let index = 0; index < value.length; index += 1) {
      const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
      if (!descriptor || !Object.prototype.hasOwnProperty.call(descriptor, "value")) {
        throw new TypeError("Cannot freeze a non-JSON array entry");
      }
      copy.push(frozen(descriptor.value));
    }
    return Object.freeze(copy);
  }
  const entries = Object.keys(value).map(key => {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor || !Object.prototype.hasOwnProperty.call(descriptor, "value")) {
      throw new TypeError("Cannot freeze a non-JSON object property");
    }
    return [key, frozen(descriptor.value)];
  });
  return Object.freeze(Object.fromEntries(entries));
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
  if (typeof left.experimentId !== "string" || !left.experimentId.trim() ||
      left.experimentId.length > MAX_ARCHIVE_TEXT_LENGTH || hasUnsafeControlCharacters(left.experimentId) ||
      left.experimentId !== right.experimentId) {
    return blocked("两份档案不是同一个有效实验模型，已阻止跨实验比较。");
  }
  if (typeof left.modelVersion !== "string" || !left.modelVersion.trim() ||
      left.modelVersion.length > MAX_ARCHIVE_TEXT_LENGTH || hasUnsafeControlCharacters(left.modelVersion) ||
      left.modelVersion !== right.modelVersion) {
    return blocked("两份档案的模型版本无效或不同，不能直接比较计算结果。");
  }
  const leftName = optionalArchiveDisplayText(left.name);
  const rightName = optionalArchiveDisplayText(right.name);
  const leftTime = optionalArchiveDisplayText(left.time);
  const rightTime = optionalArchiveDisplayText(right.time);
  if ([leftName,rightName,leftTime,rightTime].includes(null)) {
    return blocked("档案名称或时间标签必须是长度不超过 120 个字符的纯文本。");
  }
  if (!isSafeSnapshotObject(left.params) || !isSafeSnapshotObject(right.params) ||
      !Array.isArray(left.readouts) || !Array.isArray(right.readouts)) {
    return blocked("档案缺少有效的参数对象（必须为安全的 JSON 参数对象）或结果快照，或参数结构超出安全边界，无法完成对照。");
  }
  if (left.readouts.length > MAX_ARCHIVE_READOUTS ||
      right.readouts.length > MAX_ARCHIVE_READOUTS) {
    return blocked("实验档案结果行数超出 30 条限制，无法安全完成对照。");
  }

  const leftParams = left.params;
  const rightParams = right.params;
  const parameterKeys = [...new Set([...Object.keys(leftParams), ...Object.keys(rightParams)])].sort();
  const parameters = parameterKeys.map(key => ({
    key,
    leftValue: Object.prototype.hasOwnProperty.call(leftParams, key) ? leftParams[key] : null,
    rightValue: Object.prototype.hasOwnProperty.call(rightParams, key) ? rightParams[key] : null,
    changed: !Object.prototype.hasOwnProperty.call(leftParams, key) ||
      !Object.prototype.hasOwnProperty.call(rightParams, key) || !sameSnapshotValue(leftParams[key], rightParams[key])
  }));

  function readoutMap(rows) {
    const map = new Map();
    for (const row of rows) {
      if (!row || typeof row !== "object" || Array.isArray(row) ||
          typeof row.label !== "string" || !row.label.trim() ||
          row.label.length > MAX_READOUT_LABEL_LENGTH ||
          typeof row.value !== "string" ||
          row.value.length > MAX_READOUT_VALUE_LENGTH) return null;
      const key = row.label.trim();
      if (map.has(key)) return null;
      map.set(key, row.value);
    }
    return map;
  }
  const leftReadouts = readoutMap(left.readouts);
  const rightReadouts = readoutMap(right.readouts);
  if (!leftReadouts || !rightReadouts) return blocked("某份档案包含缺失、无效或重复的结果记录，无法保证一一对应。");

  const labels = [...new Set([...leftReadouts.keys(), ...rightReadouts.keys()])].sort();
  const readouts = labels.map(label => {
    const hasLeft = leftReadouts.has(label);
    const hasRight = rightReadouts.has(label);
    const leftValue = hasLeft ? leftReadouts.get(label) : null;
    const rightValue = hasRight ? rightReadouts.get(label) : null;
    const leftParsed = hasLeft ? numericValueAndUnit(leftValue) : null;
    const rightParsed = hasRight ? numericValueAndUnit(rightValue) : null;
    const comparison = leftParsed && rightParsed
      ? compareReadoutValues(leftParsed, rightParsed)
      : { comparable: false, delta: null, unit: "", converted: false, reason: "" };
    return {
      label,
      leftValue,
      rightValue,
      unit: comparison.comparable ? comparison.unit : "",
      delta: comparison.comparable ? comparison.delta : null,
      comparable: comparison.comparable,
      converted: comparison.converted,
      reason: !hasLeft || !hasRight ? "仅一份档案记录此结果" :
        !leftParsed || !rightParsed ? "非纯数值结果，不计算差值" :
        comparison.reason
    };
  });

  return frozen({
    compatible: true,
    experimentId: left.experimentId,
    modelVersion: left.modelVersion,
    left: { name: leftName, time: leftTime, snapshotAt: snapshotDate(left) },
    right: { name: rightName, time: rightTime, snapshotAt: snapshotDate(right) },
    parameters,
    readouts
  });
}
