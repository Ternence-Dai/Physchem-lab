# Changelog

本仓库的显著变更记录于此，版式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号与提交约定见《CHANGELOG 维护约定》。

> 首版生成说明（2026-11-26）：本机无 GitHub git 凭据、无法真克隆仓库，未能用 git-cliff；改由 GitHub 连接器取回 main 全量提交历史后，按提交信息语义分类生成。每条条目均对应一笔真实提交（条目末尾附短 SHA 可回查）；纯合并提交属结构性提交、其内容提交已逐条列入，故合并行本身略去（计数见各仓执行记录）。今后新变更先记入 Unreleased 节。

## [Unreleased]

<!-- 新变更先记到这里；发版/里程碑时把本节归档为日期节。 -->

## 2026-11-23 ~ 2026-11-29

### Added（新增）

- Compare experiment readouts with controlled SI conversions (#61) (`60b63ce`)
- Add item-level scientific evidence for mechanics m9-m15 (#60) (`03b76ad`)
- (migrations) archive migration registry with inspection pipeline and load trace (wave 4 #2 replication) (`59c5a8a`)
- (errors) local error event log for archive failure paths (wave 4 #4 replication) (`6d6f283`)
- (verify) add git provenance field to verify report (`19bb7bd`)
- (verify) unified verification gate with wiring guard and data-fault fixtures (`a24128e`)
- (charts) render curve-class experiments with vendored ECharts, keep canvas drawCurve fallback (`3ee6146`)
- (primary) add primary-school demo zone with 21 parent-led home demos (`d4fab6a`)
- Add Manim lecture videos for mechanics experiments (`2d83919`)
- (media) wire Manim explainer animations for kinematics/oscillation/collision experiments (`95a4499`)

### Fixed（修复）

- Invalidate stale PWA cache for attribution update (`91b3455`)
- Refresh attribution asset cache key (`26c5787`)
- Update visible developer attribution (`7cc2137`)
- Update visible developer attribution (`8166f98`)
- (evidence) re-sync catalogue hash after Manim video wiring and make evidence parser field-order tolerant (`b734fec`)

### Documentation（文档）

- Standardize developer attribution (#59) (`b18a579`)

### Tests（测试）

- Add Playwright browser smoke tests (`8f61f29`)

## 2026-11-16 ~ 2026-11-22

### Added（新增）

- (research) add 108-experiment evidence register (`ba36dc4`)

### Changed（变更）

- Research(evidence): cite kinematics models m1-m8 (`7e7863b`)
- Research(evidence): cite flagship model formulas (`f7119fb`)

### Fixed（修复）

- (archive) harden JSON parameter validation (`166d2d7`)

### Tests（测试）

- (science) add flagship analytic reference vectors (`3921c44`)

## 2026-11-09 ~ 2026-11-15

### Fixed（修复）

- (archive) bound sparse parameter array traversal (`0b37f9c`)

## 2026-11-02 ~ 2026-11-08

### Added（新增）

- Add PR-time Windows desktop validation for 物理化学实验室 桌面版 (#41) (`7263a63`)

### Changed（变更）

- Register Windows release workflow and correct gravity regression from main (#38) (`c91e33f`)

### Fixed（修复）

- Reject ideal-gas kinetic-energy underflow (#51) (`36c4cc1`)
- Bound experiment archive display metadata before comparison (#50) (`d11c76b`)
- (chemistry) disclose unrepresentable Arrhenius underflow (`de883b8`)
- (ui) make archive comparison tables accessible on narrow screens (`19501ea`)
- (archive) enforce readout comparison size limits (`c4aa22d`)
- Reject unsafe experiment archive parameter graphs (#45) (`c787e17`)
- Compare nested experiment archive parameters by value (#44) (`99d5f79`)
- Protect Physchem PWA cache data isolation (`f829683`)
- Reject malformed readouts in experiment archive comparisons (#35) (`bfe4091`)

### Security（安全）

- (ci) pin desktop workflow actions to verified commits (#43) (`0a31447`)

### Tests（测试）

- Execute all eight flagship experiment lifecycles (#46) (`2fee70e`)

### Maintenance（维护）

- (physchemlab) require explicit dispatch for desktop releases (#42) (`08c6327`)

## 2026-10-26 ~ 2026-11-01

### Added（新增）

- Add GitHub Actions workflow for Windows portable release (`a729b88`)
- (pwa) installable mobile home-screen app (manifest, offline cache, icons) (`e2e40cd`)
- (desktop) Electron shell for Windows desktop build (`8c0ef87`)

### Fixed（修复）

- (constants) CODATA-exact values across experiments (R, Nernst slope 0.05916, h, e, kB, c, g) and Wien constant alignment (`da1250e`)
- (experiments) Nernst plot uses true log-Q axis, de Broglie mass slider gets a real unit, particle radius range corrected, honesty notes for Arrhenius/Ksp (`346f1b2`)

## 2026-10-19 ~ 2026-10-25

### Added（新增）

- (ui) identify domain-specific final workspace shell (`216ed66`)
- (ui) expose domain-specific workflow controls in page shell (`f4ae024`)
- Integrate nonlinear pendulum with RK4 (`36eaa48`)
- Add reproducible read-only experiment archive comparison (#20) (`8ab1231`)
- Add source and data-integrity checks for NIST reference lookup (`2357ff2`)
- Add traceable NIST Chemistry WebBook reference search to PhysChem (`ec74732`)
- Add reference-template product shell v4 (`3c5e2c7`)
- Add PhysChem instrument workbench information architecture and responsive two-column controls (`225e363`)
- Add wide viewport shell geometry acceptance assertions (`d40bb71`)
- (ui) activate domain-specific reference workbench v2 (`0ddbb3b`)
- (ui) add domain-specific reference workbench v2 (`c0c3edf`)
- (ui) add live PhysChem experiment context metrics (`09c171c`)
- Respect reduced-motion preference in PhysChem Lab (#13) (`a7310b0`)
- Add keyboard skip navigation to PhysChem Lab (#12) (`22d43d6`)
- Establish readable accessible UI typography baseline (#5) (`1cb5c6a`)
- Add dilution concentration calculation (#3) (`a3996ef`)
- Add project-wide JavaScript syntax validation (`f883392`)
- Add dedicated PhysChem interactive laboratory workspace (`5b18d87`)
- Add validated loading of saved PhysChem experiment parameters (`c086f30`)
- Add shared V9 workspace visual system (`c57003a`)
- Enable contextual secondary module navigation (`5e75f72`)
- Add context-aware secondary module navigation and headers (`30c2b0c`)
- Enable Workspace V5 quick experiment search (`45b8940`)
- Add keyboard-accessible Workspace V5 experiment search launcher (`907814a`)
- Add overflow regression tests for titration mixing (`845ea88`)
- Add visible scientific workflow dashboard design system (`5c03c0b`)
- Add an experiment workflow command bar to the workspace (`18530d7`)
- Add Henry law and dynamic equilibrium marker regressions (`8a39b5f`)
- Support parameter-driven curve reference markers (`11383f3`)
- Add regression tests for third-order integrated kinetics (`cc10276`)

### Changed（变更）

- (ui) remove duplicate shortcut rail and restore domain navigation hierarchy (`fdce249`)
- Improve business-specific page landmarks and navigation semantics (#34) (`6520204`)
- Repaint PhysChem canvas after responsive layout changes (#33) (`c6ea934`)
- Make PhysChem instrument-room layout authoritative (#32) (`29d5bbb`)
- Make PhysChem experiment catalogue accessible (`67dcb17`)
- Style read-only reproducible experiment archive comparison (`296e736`)
- Improve command palette keyboard accessibility (#15) (`498516d`)
- Validate the shared PhysChem canvas runtime in its actual source file (`d6b5455`)
- Match NIST source validation to the URLSearchParams-safe search URL builder (`105c99c`)
- Run NIST source and 108-experiment integrity checks in the standard verification (`2ed894f`)
- Verify NIST reference search without altering the 108 experiment models (`1307020`)
- Connect NIST WebBook source lookup to the PhysChem reference workbench (`9d407eb`)
- Style NIST source lookup with provenance and uncertainty boundary (`ad842bf`)
- Make PhysChem canvas-first control-room reference layout (`14d548f`)
- Promote reference workspace to default shell and refresh browser cache (`8d91645`)
- Refresh the PhysChem reference shell asset after sidebar constraints repair (`3f2472d`)
- Bust PhysChem reference shell cache after rail override (`a344b96`)
- Align PhysChem browser assertions to 296px reference control room rail (`6df1ab2`)
- Override legacy experiment rail ID sizing in reference control room (`075db2a`)
- Refresh PhysChem reference shell asset version (`dc78ab2`)
- Restore valid readability stylesheet link for v4 shell (`4deee8e`)
- Point browser acceptance at reference-template v4 stylesheet (`2a08f86`)
- Validate reference-template v4 shell geometry and assets (`eab29cd`)
- Place reference product shell after accessibility cascade and fix stylesheet markup (`2b1af19`)
- Validate the actual instrument workbench and legacy product stylesheet paths (`78ec320`)
- Validate PhysChem instrument workbench panel geometry and layout (`2605be6`)
- Load PhysChem instrument workbench v3 design system (`76e5fa4`)
- Retire shared V9 CSS overlay after replacing it with product-native workspaces (`53ded63`)
- Verify live context script mount fix version (`d460f48`)
- Refresh live experiment context mount fix (`223541e`)
- Anchor PhysChem live experiment context to the canvas when the generic workflow shell is absent (`09ea2cb`)
- Verify PhysChem canvas-first workbench and scrollable control panels (`9bdaef1`)
- Load the full instrument workbench layout revision (`094d9bb`)
- Rebuild PhysChem as a scrollable canvas-first experiment workbench (`2c59eb0`)
- Replace generic intro and workflow shell with product-first workspace (`7c90c65`)
- Bust browser cache for corrected full-width workspace layout (`45fc645`)
- Restore accessibility stylesheet as final cascade layer (`1adf501`)
- PhysChem Lab: scientific workbench UI v2 (#9) (`95fb21d`)
- Stabilize dilution concentration at extreme scales (#4) (`93b9ac7`)
- Use explicit closures for archive deletion sandbox callbacks (`d627894`)
- Test explicit PhysChem archive capacity management (`66021ce`)
- Match titration validator to explicit Ka and Kb notation (`e91a1f3`)
- Align titration teaching formulas with water autoionization model (`4f3650d`)
- Cancel superseded standalone validation runs on the same ref (`f712ace`)
- Cancel superseded domain test runs on the same ref (`a0cf9c5`)
- Bust browser cache for current project UI and domain logic (`f8f5e45`)
- Clarify all damped-pendulum readouts as undamped approximations (`a442675`)
- Clarify damped pendulum period approximation in lab UI (`5f9732d`)
- Expand CI syntax checks to browser and test scripts (`ff38d04`)
- Connect PhysChem workspace theme to application (`34fc88d`)
- Make PhysChem note restoration regression deterministic (`28b0fa8`)
- Test observation note restoration from PhysChem archive (`9a39379`)
- Align PhysChem cache validation with latest V9.2 (`e46ae6a`)
- Bust stale PhysChem V9 stylesheet and workspace caches (`c416001`)
- Reflect full result snapshots in PhysChem workflow entry points (`c40d9ef`)
- Test bounded PhysChem result archive sizes (`037e6ac`)
- Mount PhysChem experiment observation notebook in the workspace (`7b66390`)
- Validate PhysChem reproducible experiment notebook surface (`7378cbb`)
- Test backwards-compatible scientific result archive snapshots (`e00c633`)
- Wire live experiment notebook note counter (`70ac512`)
- Load experiment notebook record surface and cache-bust PhysChem V9 (`c4fc6fa`)
- Style reproducible PhysChem experiment notebook (`c76940b`)
- Store reproducible PhysChem result and observation snapshots (`7c233f3`)
- Validate safe and version-aware experiment archive restore (`eaab183`)
- Refresh PhysChem archive interaction styles (`7fe67a4`)
- Style validated PhysChem archive restore controls (`a85badf`)
- Load shared V9 workspace visual system (`81babbc`)
- Initialize the PhysChem experiment context workspace (`97c94aa`)
- Clarify PhysChem simulation run-state labels (`72bced6`)
- Style contextual secondary module workspaces (`a13734c`)
- Style the Workspace V5 experiment search launcher (`cda71da`)
- Activate dedicated Workspace V5 interface (`02bec09`)
- Redesign interface with dedicated Workspace V5 system (`cd185d0`)
- Stabilize titration concentration mixing against overflow (`f60c906`)
- Validate PhysChem Lab V4 interface redesign (`f6fd441`)
- Activate PhysChem Lab V4 exploration console (`941afa3`)
- Redesign PhysChem Lab exploration console V4 (`7838b38`)
- Expand verified GitHub benchmark mapping and implementation roadmap (`d837707`)
- Update static UI validation to current V6 workflow stylesheet (`07f6f49`)
- Redesign scientific exploration workflow on homepage (`a45955e`)
- Record acid-base equilibrium benchmark refinement (`765eba4`)
- Update titration regression expectation for water equilibrium (`368ab19`)
- Document dilute strong electrolyte water autoionization limits (`5d1f6c4`)
- Test water autoionization in ultra-dilute titration limits (`f792f51`)
- Include water autoionization in dilute strong-acid/base titration (`573cbca`)
- Link open-source benchmark and architecture notes from README (`6678e99`)
- Document deep open-source product and architecture benchmarks (`06698c4`)
- Refresh product interface stylesheet cache for V5 workspace (`b6e536d`)
- Style core workspace actions and dashboard launch panels (`78be1e2`)
- Retain legacy validator hook and load cache-busted UI layer (`2e5c31e`)
- Bust browser cache for refreshed product UI (`8945541`)
- Polish responsive UI interactions and accessibility (`d454fd5`)
- Document strong-acid titration model assumptions and pH boundaries (`c893b7d`)
- Test unclamped concentrated acid and base pH results (`8aa3e61`)
- Preserve concentration-model pH outside arbitrary 0–14 clamp (`903c9af`)
- Bind equilibrium chart marker to live K parameter (`1736218`)
- Document integrated third-order kinetics equation (`653bc59`)
- Clarify strong acid-base titration model limitations (`2064082`)
- Validate titration model wiring and scope disclosure (`9c250cf`)
- Use shared titration pH model and clarify scope (`70f602f`)
- Test strong acid-base titration equivalence behavior (`b13d286`)
- Use explicit pH range clamp in domain model (`a017528`)
- Centralize strong acid-base titration pH calculation (`db56303`)
- Keep boolean friction state outside numeric validation (`87bd975`)
- Validate piecewise incline friction model (`76e0e1a`)
- Test static versus kinetic incline friction (`af047e3`)
- Model static and kinetic friction forces separately (`7082f8e`)
- Improve spring animation with velocity-Verlet integration (`75e2dbd`)
- Document exact vertical-plane model boundary (`b32eade`)
- Test friction-free vertical-plane acceleration (`390d24e`)
- Document relevant open-source architecture benchmarks and boundaries (`bbd0ac1`)
- Cover vertical launch and finite extreme-scale projectile trajectories (`7b0a427`)
- Stabilize projectile trajectory boundaries and extreme-scale calculations (`6fd09b4`)

### Removed（移除）

- Remove generic V9 shell layer; keep the domain-specific product workspace (`3d6e07b`)
- Remove legacy positioning and width constraints from reference UI (`21030f9`)
- Remove stale PhysChem sidebar width overrides from shared readability layer (`d0c8756`)

### Fixed（修复）

- (ui) align quick controls with real actions and mobile layout (`6723700`)
- Harden titration and archive comparison (`1c6ab2c`)
- Fix acid-base titration volume underflow (`8dd361b`)
- Reject unknown timezone offsets in archive snapshots (#25) (`db67d38`)
- Reject invalid experiment archive timestamps (#24) (`b9c8b89`)
- Reject overflowing experiment archive deltas (`848ff3e`)
- Resolve the remaining reference workspace acceptance conflicts (`1b9d023`)
- Fix v4 stylesheet selector in browser acceptance (`9e90961`)
- Fix v4 stylesheet markup and keep accessibility baseline final (`e759de7`)
- Fix PhysChem sidebar flex basis across responsive breakpoints (`633ef4a`)
- Fix Pages deploy job to check out the validated application (`3514ef1`)
- (ci) use the supported Pages artifact action without PAT-only enablement (`12526bf`)
- (ci) do not require a lockfile for ephemeral browser tooling (`7ab6948`)
- Fix runtime registration of all 108 PhysChem experiments (#8) (`7287d0a`)
- Derive visible experiment totals from the loaded catalogue (#7) (`2ea5ce4`)
- Restore full experiment catalogue and live simulation UI (`80f0f08`)
- Protect PhysChem archives from silent capacity eviction (`02e8aa4`)
- Protect PhysChem archives from silent capacity eviction (`3c0c212`)
- Protect PhysChem archives from silent capacity eviction (`5fce2be`)
- Protect PhysChem archives from silent capacity eviction (`5a1cd37`)
- Correct titration model explanation and equilibrium formula (`86d8d09`)
- Fix whitespace normalization in workspace command search (`d4a37c2`)
- Make workspace launcher resilient across page layouts (`bfa2106`)
- Bound PhysChem snapshot sizes for portable 30-record backups (`9d81807`)
- Fix canonical snapshot timestamp regex (`341262e`)
- Correct PhysChem snapshot metadata validation regexes (`49c3e95`)
- Correct PhysChem archive restore test function extraction (`d5e7039`)
- Correct Workspace V5 command launcher typography (`ec7f616`)
- Refresh product UI stylesheet cache (`98d1331`)
- Correct PhET repository maintenance status and link to current pH model docs (`f92f413`)
- Correct Henry law inverse formula (`c656dbd`)
- Fix integrated third-order reaction kinetics model (`63b5699`)
- Correct incline experiment friction force readouts (`a6555a2`)
- Fix velocity-Verlet validation assertion (`8689230`)
- Guard spring oscillator integration accuracy (`8424c98`)
- Handle the exact vertical inclined-plane limit (`f424aba`)

### Security（安全）

- (ci) scope Pages deployment permissions to deploy job (`ac536e4`)

### Documentation（文档）

- (physchem) align delivery status with current 108-experiment workspace (`9541dee`)

### Tests（测试）

- (ui) assert reference workspace stylesheet delivery and layout (`ab85c88`)
- Verify representative experiment animations advance over time (#11) (`037d400`)
- Verify all 108 PhysChem experiment drawings in Chromium (#10) (`512031d`)
- (archive) reject invalid saved experiment indexes (#2) (`9e49c70`)
- (physchem) fix archive delete markup assertion (`9d32dc8`)
- Accept refreshed product stylesheet version (`80f51f5`)

### Maintenance（维护）

- Deploy verified reference UI to GitHub Pages (`597c85f`)
- Add reference UI and domain regression workflow (`e941b18`)

## 2026-10-12 ~ 2026-10-18

### Added（新增）

- Add PhysChem V3 responsive workspace and mobile drawer checks (`ed42705`)
- Add Physchem mobile experiment drawer and V3 page metadata (`4c3bdba`)
- Add PhysChem archive backup and recovery controls (`7b661f0`)
- Add safe PhysChem archive export and recovery import (`2eac389`)
- Support signed voltage polarity in Ohm's law (`b477fed`)
- (physics) add shared spring oscillator solver (`186d2c7`)
- Centralize core mechanics experiment equations (`bd20084`)
- Connect gas law and Arrhenius experiments to domain core (`2524e53`)
- Load scientific domain core before experiment boot (`93bceac`)
- Establish platform v2 foundation (`8fdd810`)
- Add HTML-injection regression checks for experiment and saved-session rendering (`5190d95`)
- Add default-parameter smoke tests for experiment models (`a0d5c48`)
- Add blackbody spectrum numerical regression tests (`a80f6b5`)
- Add CI syntax validation for embedded JavaScript (`fe242ae`)
- Initial commit (`5043c81`)

### Changed（变更）

- Expose application source for mobile drawer assertions (`dd552f1`)
- Document PhysChem Lab V3 responsive interactive interface (`cd218f1`)
- Load PhysChem Lab V3 workspace styles without stale cache (`e640264`)
- Wire mobile experiment drawer and close after experiment selection (`3fb9b3a`)
- Redesign Physchem Lab as a responsive interactive engineering workspace (`5a14b3d`)
- Align README delivery status with verified implementation (`cd10eba`)
- Validate per-molecule kinetic energy label (`a8ea73e`)
- Clarify ideal-gas kinetic energy is per molecule (`ad3853f`)
- Validate schematic molecular animation disclosure (`25fd8da`)
- Disclose schematic speed scaling in gas particle animation (`a0d79e5`)
- Cover extreme ideal-gas particle property scales (`b69e054`)
- Document shared ideal-gas particle model and SI constants (`ed92b0a`)
- Route ideal-gas particle metrics through shared domain model (`39338a5`)
- Test ideal-gas particle properties and SI constants (`89260e6`)
- Centralize ideal-gas particle properties and constants (`8bdf2d2`)
- Link domain equations and unit contract from README (`7d8ebfa`)
- Tighten duplicate Ohm equation regression guard (`3e68bdb`)
- Clarify readable domain equations and unit notation (`b9f323e`)
- Document physical chemistry domain equations and units (`ea07dfa`)
- Test spring energy stability at subnormal parameters (`b56b725`)
- Preserve representable spring energy at numeric extremes (`bc2594d`)
- Validate charge-flow rate units in Ohm experiment (`8eaa036`)
- Route Ohm readouts through shared domain solver (`baf73e5`)
- Test stable Ohm heating at extreme finite values (`adc0517`)
- Test tiny-temperature Arrhenius stability (`28cb596`)
- Cover recoverable ideal-gas and Arrhenius underflow (`ca7b636`)
- Stabilize ideal-gas and Arrhenius calculations (`6c6a3f1`)
- Test PhysChem archive model version metadata (`d5222f2`)
- Version PhysChem experiment archives with model identity (`4c27d29`)
- Test raw PhysChem archive export and backup restore (`98d5f21`)
- Style PhysChem archive recovery controls (`7ea8bcb`)
- Exercise storage quota failure with a valid experiment record (`63022c1`)
- Use a valid archive fixture for quota-failure rollback test (`d0c2e59`)
- Test malformed experiment archive rows and parameters (`c43cf93`)
- Validate saved experiment records and parameter values (`1713162`)
- Assert restoring-force acceleration sign in extreme cases (`0c703a6`)
- Preserve positive zero for equilibrium acceleration (`8a0c0f8`)
- Cover spring acceleration ratio overflow and underflow (`167057e`)
- Stabilize spring acceleration across extreme finite ratios (`2cffc1a`)
- Test stable ideal gas pressure evaluation (`ff0bb4b`)
- Improve ideal gas calculation numerical stability (`89333f6`)
- Cover reverse polarity in Ohm's law tests (`154e2d2`)
- Test numeric overflow boundaries in domain calculations (`b9a74f2`)
- Distinguish ideal-gas animation from pressure calculation (`b9538a0`)
- Use consistent dry-air molar mass throughout gas experiment (`4a26741`)
- Clarify ideal-gas model and air RMS speed assumption (`8d8309b`)
- (physics) centralize spring and gas formulas (`f06846a`)
- Unify experiment outputs with physics domain core (`b123ad1`)
- Route mechanics experiments through domain core (`ff15091`)
- Load experiment catalogue before runtime engine (`4d91e42`)
- Separate experiment catalogue from runtime engine (`fac175f`)
- Extract experiment catalogue from application runtime (`8d1c3d8`)
- Load application logic from JavaScript module file (`c1bab47`)
- Extract application logic from HTML (`5c119c6`)
- Load legacy styles from stylesheet (`74138b2`)
- Extract legacy application styles (`4bf696e`)
- Design: refine product-specific layouts and components (`8866b86`)
- Design: apply refreshed product interface system (`a277d58`)
- Design: add responsive product interface system (`6b980ef`)
- Isolate experiment archive persistence for regression tests (`000f43d`)
- Validate unique experiment IDs and parameter bounds (`3816ffb`)
- Test offline tutor capability disclosure (`a7aa98f`)
- Label the offline formula tutor accurately (`a90bc67`)
- Verify equations in the three added chemistry models (`9dcfa1a`)
- Require all 100 experiment models to validate (`3782af2`)
- Complete the 100-experiment physical chemistry catalogue (`21f3448`)
- Keep the existing validation step without duplicate execution (`443e111`)
- Run experiment HTML-escaping regression checks in CI (`31bd37d`)
- Escape experiment catalog and saved-session values before HTML rendering (`bf1d393`)
- Include particle simulation models in experiment smoke tests (`db49af8`)
- Allow physical endpoint singularities in experiment smoke tests (`b5ef339`)
- Run experiment model smoke tests in CI (`e7d723d`)
- Test safe plotting across invalid curve domains (`1f92710`)
- Render disjoint curve domains without connecting invalid samples (`a6a0980`)
- Run blackbody numerical regression in CI (`f19e8f2`)
- Redesign product information architecture and workspace visual hierarchy (`8b28e93`)
- Persist experiment archives across browser sessions (`0eaa051`)
- Improve accessibility, reduced-motion support, and print layout (`72fcd3f`)
- Update index.html (`e5fac68`)
- Update fmt.Println message from 'Hello' to 'Goodbye' (`c43ea9a`)

### Removed（移除）

- Remove misleading fixed blackbody peak marker (`ba00d2b`)

### Fixed（修复）

- Enforce shared ideal-gas particle metrics in catalogue (`fc8785f`)
- Correct charge-flow rate unit in Ohm readout (`1aeb3b2`)
- Enforce shared Ohm power and heat calculations (`a3aa040`)
- Avoid intermediate overflow in Ohm heating calculation (`5d6c142`)
- Avoid intermediate underflow in Arrhenius exponent (`1591296`)
- Handle zero-displacement oscillator at extreme ratios (`297ba84`)
- Avoid intermediate overflow in oscillator ratios (`5491c62`)
- Guard physical chemistry calculations against numeric overflow (`01e74f9`)
- Route incline readout and tutor through domain solver (`1968cc9`)
- Keep pendulum demo within small-angle approximation (`1aa0709`)
- Prevent static inclined-plane friction accelerating uphill (`dfbe909`)
- Restore ESM domain tests and add mechanics regression coverage (`b5def88`)
- Initialize experiment catalogue before app boot (`f1a6f41`)
- Share experiment catalogue with runtime engine (`918b7bf`)
- Prevent overwriting experiment archives after storage errors (`87195e5`)
- Fix line breaks in new experiment tutor explanations (`9f3e426`)
- Correct source-level HTML escaping regression assertion (`048267b`)
- Fix numeric domain assertion in experiment smoke test (`b1d81d8`)
- Fix blackbody regression test extractor (`fe8a755`)
- Fix blackbody spectrum numerical stability (`2f1bb5e`)
- Include screen distance in single-slit diffraction calculations (`0aec4ec`)
- Fix inline JavaScript validation workflow (`e80b9f2`)

### Documentation（文档）

- Clarify main-branch modernization and delivery status (`51b6e55`)

### Tests（测试）

- Assert zero-displacement oscillator acceleration (`8968040`)
- Cover stable square-root ratio calculations (`b263abf`)
- (physics) correct shared solver regression assertions (`1d8b61f`)
- (physics) assert shared spring and gas solvers (`df2d1da`)
- (physics) cover spring oscillator domain (`93087e1`)
- Load catalogue source for formula consistency checks (`d6e6546`)
- Prevent duplicated experiment physics formulas (`574e6bb`)
- Fix pendulum small-angle assertion pattern (`4a8a2b8`)
- Verify pendulum demo starts within small-angle range (`5cf394e`)
- Cover inclined-plane static friction threshold (`622d0b8`)
- Cover mechanics domain calculations and boundaries (`a126439`)
- Include extracted experiment catalogue in regression checks (`ade84af`)
- Include extracted experiment catalogue in regression checks (`af9ca50`)
- Include extracted experiment catalogue in regression checks (`cde69fe`)
- Validate extracted JavaScript application entry (`348e5f5`)
- Inspect extracted application source in regression checks (`2469ffb`)
- Inspect extracted application source in regression checks (`5262910`)
- Inspect extracted application source in regression checks (`f585374`)
- Cover experiment archive recovery and write failures (`dd6dec2`)

### Maintenance（维护）

- Run experiment archive recovery regression tests (`f06b780`)
