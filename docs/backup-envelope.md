# 统一备份信封 + age 口令加密导出（第六波 #3 推广，Physchem-lab）

格式与 Health 试点（Human-Digital-Twin-Health `docs/backup-envelope.md`）同一规范，按本仓数据集形态适配：本仓的健康导出格式是裸记录数组本身，因此信封是**附加的包裹层、不是替代格式**——既有用户备份（裸数组、原始存档恢复包）继续走原有管线导入，行为零改动。

## 信封格式（明文层）

`buildUnifiedBackupEnvelope(rows, exportedAt)`（`src/domain/index.js`，与存档迁移登记制同层）产出：

```json
{
  "format": "physchem-backup-envelope",
  "manifest": {
    "schemaVersion": 1,
    "exportedBy": "Physchem-lab",
    "exportedAt": "<ISO 时间>",
    "datasets": [
      { "key": "archive", "schemaVersion": 1, "storage": "local-browser", "count": 2 }
    ]
  },
  "datasets": {
    "archive": [ /* 实验档案记录数组，与明文导出逐字节同形 */ ]
  }
}
```

- 数据集版本口径与登记制的 `loadedVersion` 一致：档案内最高记录代次（无 `experimentSnapshotVersion` 的旧记录计基线 0；空档案记当前版本 1）。
- 导入预检 `parseUnifiedBackupEnvelope`：信封 `schemaVersion` 不是 1 明确拒绝（版本过高不猜读）；清单列出的数据集缺失、未列出的数据集混入、数据集版本高于登记制当前版本、清单版本与数据自身代次不一致、清单计数与实际条数不一致——全部在记录进入既有 `inspectExperimentArchive` 检查管线之前整包拒绝。

## 导入导出通道（档案面板）

- 明文通道零改动：「导出档案备份」仍导出裸数组（恢复保护时仍导出原始恢复包）；导入仍接受裸数组与恢复包，走 `restoreExperimentArchive`。
- 新增「口令加密导出（.age）」：把信封加密导出。恢复保护状态下明确阻止——读不懂的原始字节走恢复包通道，不封进信封。
- 导入框现接受 `.age`：识别 age 密文后先在内存解密（错口令在任何解析/检查/写入之前拒绝），再走信封预检 → 既有检查管线 → 落盘，与明文导入完全同一条校验链。

## 加密层（age）

- 实现：FiloSottile/typage 官方 bundle `age-encryption` v0.3.1（BSD-3-Clause），单文件 vendor 于 `assets/js/vendor/age-encryption.js`（208,688 字节，SHA-256 `3199bdb6ae48d2efa6fa762c81d19f3f7362d2179b9d61b3ba642db8d092b93c`，与 Health 仓的同一份逐字节一致；许可证在同目录 `age-encryption.LICENSE.txt`）。
- 形态：经典脚本，仅在用户点击加密导出或导入 .age 时由 `loadPhyschemAgeEncryption()` 动态插入 `<script>` 按需加载；不进首屏、不在 service worker 预缓存清单中（测试钉住）。
- 模式：口令（scrypt）模式，导出文件名为 `physchem-archive-backup-<日期>.age`。口令只存在于调用期间的局部变量：不落盘、不进 localStorage、不进错误事件账（测试以源码正则钉住；错误事件只记阶段与错误类名 + 静态文案，沿用本仓既有隐私口径）。

## 风险提示（已写进导出 UI）

口令丢失 = 数据不可恢复。.age 文件不依赖本应用存续，任何标准 age 工具都能解。
