# AI Coding Harness 开发流程

> 适用项目：已有项目的持续迭代开发
>
> 组合方式：Codex + OpenSpec + Superpowers + Claude Acceptance
>
> 版本：v1.0 · 2026-09-05

## 1. 文档目的

本流程用于指导已有项目中的 AI 辅助开发，目标不是让多个智能体同时修改代码，而是让不同智能体围绕同一组可检查的工程证据协作：

```text
OpenSpec 说明应该做什么
Codex 负责把它实现出来
Superpowers 约束实现方法
测试提供运行证据
Claude 独立验收实现是否符合 Spec
人类做范围与最终业务决策
```

本仓库是父仓 + backend submodule + frontend submodule 的结构，因此流程还必须处理：

- 父仓只保存治理文件、OpenSpec 和 submodule 指针；
- backend / frontend 内的业务代码由各自子仓管理；
- 验收必须同时检查父仓、backend 子仓和 frontend 子仓；
- 代码提交不能只看父仓的 diff。

## 2. 核心原则

### 2.1 Codex 是生产者，Claude 是验收者

Codex 可以写 proposal、design、tasks、业务代码和测试，但不能批准自己的设计，也不能自己宣布最终业务验收通过。

Claude 读取同一份 OpenSpec、代码 diff 和测试证据，独立判断是否通过。Claude 不修改 backend / frontend 业务代码，发现问题后返回带路径、行号和复现证据的 Action Items。

### 2.2 OpenSpec 是共享契约

两个智能体之间不通过大段聊天上下文交接，而通过以下文件同步：

```text
openspec/changes/<change-name>/
├── proposal.md
├── specs/<capability>/spec.md
├── design.md
├── tasks.md
└── acceptance.md       # 验收证据，可在实现完成后生成
```

官方 `spec-driven` schema 的 artifact 顺序是：

```text
proposal → specs → design → tasks
```

本仓库的简化规则主要写成 `proposal → design → tasks`，但涉及用户可见行为、API、数据模型或业务边界时，应以 OpenSpec CLI 的实际状态图为准，并补充 `specs/` 下的能力变更。

### 2.3 Superpowers 是方法层，不是角色层

Superpowers 负责规定“如何工作”，不决定“谁拥有代码写权限”。本项目已有的主要方法包括：

- brainstorming：在已有代码上建立问题地图；
- writing-plans / OpenSpec：把需求转成可执行计划；
- test-driven-development：严格 RED → GREEN → REFACTOR；
- subagent-driven-development：把独立任务交给新上下文，并先做 Spec review 再做代码质量 review；
- verification-before-completion：没有命令和输出证据就不能宣布完成；
- requesting-code-review：批次完成后整理 diff、测试和风险。

### 2.4 人类必须掌握三个决策点

人类不需要手写每一行代码，但必须明确批准：

1. 本次变更做什么、不做什么；
2. design 是否符合现有架构和长期维护目标；
3. Claude 验收通过后是否接受发布或合并。

## 3. 角色与权限矩阵

| 行为 | 人类 | Codex 开发者 | Claude 验收者 | CI / 测试系统 |
|---|---:|---:|---:|---:|
| 读取项目、Spec、代码 | ✅ | ✅ | ✅ | 部分 |
| 创建 proposal / specs / design / tasks | ✅ | ✅ | ❌ | ❌ |
| 批准 proposal / design / tasks | ✅ | ❌ | ❌ | ❌ |
| 修改 backend 业务代码 | ✅ | ✅ | ❌ | ❌ |
| 修改 frontend 业务代码 | ✅ | ✅ | ❌ | ❌ |
| 新增或修改测试 | ✅ | ✅ | ❌ | ❌ |
| 运行测试、构建、lint | ✅ | ✅ | ✅ | ✅ |
| 写 acceptance.md | ✅ | ❌ | ✅ | ❌ |
| 宣布业务验收通过 | ✅ | ❌ | ❌ | ❌ |
| archive change | ✅ | ✅ | ❌ | ❌ |
| 更新 submodule 指针 | ✅ | ✅ | ❌ | ❌ |

Claude 的写权限最好限制为：

```text
openspec/changes/<change-name>/acceptance.md
```

不要给验收角色修改 `backend/`、`frontend/` 或其他业务源代码的权限。

## 4. 完整流程总览

```text
已有项目基线
    │
    ▼
Codex：Explore / Brainstorming
    │  只读理解现状，不写业务代码
    ▼
Codex：OpenSpec propose
    │  proposal → specs → design → tasks
    ▼
人类：范围与设计签字
    │
    ▼
Codex：OpenSpec apply
    │  每个 task 执行 TDD
    ▼
Codex：自检、全量测试、交接
    │  固定 base SHA 与 head SHA
    ▼
Claude：独立验收
    │  Spec → 代码、代码 → Spec、测试、回归、体验
    │
    ├── FAIL：Codex 根据 Action Items 修复，Claude 重验
    │
    ▼
人类：最终接受
    │
    ▼
Codex：archive + 子仓提交 + 父仓 bump 指针
```

## 5. 阶段 0：已有项目基线

任何新 change 开始前，Codex 先检查工作区，而不是直接生成代码。

### 5.1 必须执行的检查

```bash
git status --short
git rev-parse HEAD
npx @fission-ai/openspec@latest list --json
git -C backend status --short
git -C frontend status --short
```

然后读取：

```text
AGENTS.md
README.md
openspec/project.md
openspec/config.yaml
相关 openspec/specs/<capability>/spec.md
相关 backend / frontend 源码
相关测试
```

### 5.2 基线检查的退出条件

Codex 只有在能回答以下问题后，才能进入需求讨论：

- 这次需求影响父仓、backend、frontend，还是多个仓库？
- 当前能力的主 Spec 在哪里？
- 当前实现和 Spec 是否已经存在偏差？
- 当前工作区有哪些与本次 change 无关的未跟踪或未提交文件？
- 是否存在正在进行的 OpenSpec change？
- 现有测试命令是什么？

## 6. 阶段 1：探索与需求澄清

使用 `/opsx:explore` 或 brainstorming skill，先建立 brownfield 项目的现状地图。

这一阶段只做：

- 阅读现有代码和测试；
- 查找同类能力；
- 查找现有 API、数据模型和页面状态；
- 识别已有约束和边界；
- 讨论目标、非目标和验收标准。

这一阶段不做：

- 不直接修改 `backend/src/`；
- 不直接修改 `frontend/app/`、`frontend/components/` 或 `frontend/lib/`；
- 不因为“看起来很简单”而绕过 OpenSpec；
- 不提前引入未来可能会用到的抽象。

## 7. 阶段 2：OpenSpec 变更设计

Codex 运行：

```text
/opsx:propose <change-name>
```

### 7.1 proposal.md

必须说明：

- 当前问题和为什么现在处理；
- 本次新增、修改或删除的能力；
- 本次明确不做的事情；
- 受影响的 capability；
- 是否存在 breaking change。

### 7.2 specs/<capability>/spec.md

必须描述外部可观察行为：

- 输入；
- 输出；
- HTTP 状态码；
- 错误响应；
- 鉴权边界；
- 空状态、异常状态和边界值；
- 可被测试或手工验证的场景。

Spec 不应该绑定内部类名、函数名或具体实现步骤。

### 7.3 design.md

必须说明：

- 修改哪些模块；
- 数据如何流转；
- 前后端如何交接；
- API contract 如何变化；
- 是否涉及数据库、缓存、队列或外部服务；
- 哪些已有架构约束不能突破；
- 方案的取舍与风险。

### 7.4 tasks.md

每个 task 都应满足：

- 可以独立描述；
- 有明确文件范围；
- 有明确测试或验证方式；
- 完成后可以勾选；
- 不把多个无关能力揉成一个大任务。

### 7.5 人类签字

没有完成以下确认，不能进入代码实现：

```text
[ ] proposal 范围正确
[ ] specs 覆盖核心行为和异常行为
[ ] design 没有违反现有架构
[ ] tasks 可以被逐项执行和验收
[ ] 用户确认进入实现阶段
```

## 8. 阶段 3：Codex 使用 Superpowers 实现

Codex 运行：

```text
/opsx:apply <change-name>
```

实现每个 task 时遵循：

### RED

1. 先写一个针对新行为的测试；
2. 运行测试；
3. 亲眼看到与业务行为相关的失败；
4. 如果是 `ImportError`、`SyntaxError` 等基础错误，先修复测试环境，不算完成 RED。

### GREEN

1. 写让当前测试通过的最小实现；
2. 不在此阶段追求架构重构；
3. 运行目标测试并保存输出。

### REFACTOR

1. 在测试全绿的前提下整理结构；
2. 删除重复和临时实现；
3. 每次小改动后重新运行测试；
4. 如果重构改变行为，退回 RED。

每个 task 完成后立即更新：

```markdown
- [x] Task 1.1 ...
```

## 9. 阶段 4：Codex 自检与交接

Codex 在交给 Claude 之前，必须完成：

- tasks.md 中本批次任务已勾选；
- 目标测试通过；
- 全量回归测试通过；
- build / lint 通过；
- 没有未授权的新依赖、新 API 或新文件；
- diff 范围可以在合理时间内读完；
- 已记录所有偏离 design 的地方。

交接信息必须包含：

```markdown
# Codex → Claude Acceptance Handoff

## Change
<change-name>

## Base Commit
<实现前 SHA>

## Head Commit
<实现后 SHA>

## OpenSpec
- proposal: ...
- specs: ...
- design: ...
- tasks: ...

## Changed Repositories
- parent: <status / diff>
- backend: <status / diff>
- frontend: <status / diff>

## Tests Run
- <command>
- <result summary>

## Manual Checks
- <API / browser / UI evidence>

## Known Deviations
- none / explicit list
```

## 10. 阶段 5：Claude 独立验收

Claude 必须在 Codex 停止写入后的固定 commit 上工作。不能验收一个仍然会被 Codex 改动的工作区。

### 10.1 验收顺序

1. 检查 `git status` 和 `base SHA → head SHA` 的 diff；
2. 读取 proposal、specs、design、tasks；
3. 读取实际修改的源代码和测试；
4. 运行目标测试和全量测试；
5. 检查 API / UI / 架构边界；
6. 做 Spec → 代码的正向对账；
7. 做代码 → Spec 的反向对账；
8. 输出 PASS / FAIL 和证据。

### 10.2 正向对账

逐条检查：

```text
proposal 的需求是否覆盖？
spec 中的 MUST 是否实现？
design 中的边界是否遵守？
tasks 中的验证是否完成？
```

每个结论都必须包含具体路径，尽量包含行号或测试名称。

### 10.3 反向对账

重点检查：

- 是否出现 Spec 没有要求的功能；
- 是否新增未经批准的 API；
- 是否新增未经设计授权的依赖；
- 是否增加预防性抽象；
- 是否修改了不属于本 change 的文件；
- 是否越过 Next.js 薄 BFF 边界；
- 是否破坏父仓和 submodule 的提交边界。

### 10.4 验收等级

| 等级 | 含义 | 是否允许通过 |
|---|---|---:|
| Critical | 错误结果、数据丢失、安全问题、核心需求缺失 | ❌ |
| Major | 重要边界缺失、回归失败、API contract 偏差 | ❌ |
| Minor | 命名、可读性、非阻塞维护问题 | 可记录后通过 |
| Pass | Spec、测试和手工证据均满足 | ✅ |

### 10.5 acceptance.md 模板

```markdown
# Acceptance Report

## Change
<change-name>

## Commit
<head-sha>

## Decision
PASS / FAIL

## Spec Coverage
| 来源 | 总条目 | ✅ | ❌ | ⚠️ |
|---|---:|---:|---:|---:|
| proposal.md |  |  |  |  |
| specs |  |  |  |  |
| design.md |  |  |  |  |
| tasks.md |  |  |  |  |

## Test Evidence
| 命令 | 结果 | 输出摘要 |
|---|---|---|
| ... | PASS/FAIL | ... |

## Blocking Issues
- [Critical/Major] 文件路径 + 行号 + 复现方式

## Reverse Audit
- 是否存在超纲实现？
- 是否存在未授权依赖、API 或文件？

## Conclusion
PASS / FAIL
```

## 11. 后端案例：修改个人资料 API

本仓库已经存在 `user-profile` capability，可以作为 Codex + Claude 流程的后端演示案例。

### 11.1 当前已有契约

来源：`openspec/specs/user-profile/spec.md`

相关端点：

```text
GET /api/users/me/profile
PUT /api/users/me/profile
GET /api/users/{username}
GET /api/users/interest-tags
```

典型约束：

- 未认证访问自己的资料返回 401；
- username 格式错误返回 422；
- username 被占用返回 409，`error_code=username_taken`；
- nickname、bio、interest_tags 有长度和枚数限制；
- 公开资料不返回 email；
- 删除用户的公开资料对外表现为 404。

### 11.2 Codex 的实现路径

Codex 先读：

```text
openspec/specs/user-profile/spec.md
backend/.../controller/ProfileController.java
backend/.../service/ProfileService.java
backend/.../entity/UserEntity.java
backend/src/test/.../controller/ProfileControllerTest.java
```

如果需求是“新增 nickname 的最大长度限制”，Codex 应该：

1. 更新 `user-profile` 的 delta spec；
2. 在 `design.md` 中说明校验位置和错误格式；
3. 在 `tasks.md` 中加入后端测试任务；
4. 先写一个超长 nickname 的失败测试；
5. 运行 `mvn -f backend/pom.xml test` 确认 RED；
6. 写最小校验实现；
7. 再次运行测试确认 GREEN；
8. 检查已有 `username_taken`、未认证、资料为空等行为没有回归。

### 11.3 Claude 的验收点

Claude 需要独立验证：

```text
[ ] 422 状态码正确
[ ] error_code 为 validation_error
[ ] details.nickname 存在具体错误
[ ] 正常 nickname 仍然可以保存
[ ] 空字段的清空行为没有被破坏
[ ] 不同用户的 username 冲突仍然返回 409
[ ] 未认证请求仍然返回 401
[ ] GET 公共资料仍然不暴露 email
[ ] 全量 backend 测试通过
```

Claude 不应该直接修改 `ProfileController.java` 或 `ProfileService.java`。如果发现错误，应该在 `acceptance.md` 中报告：

```text
FAIL: ProfileService.java:xx
原因：nickname 超长时没有返回 validation_error
复现：运行 ProfileControllerTest.updateProfile_nicknameTooLong_returns422
建议：由 Codex 补充实现并重新提交验收
```

## 12. 前端案例：个人资料页的完整状态

本仓库已有前端页面：

```text
frontend/app/profile/page.tsx
frontend/app/profile/_components/ProfileView.tsx
frontend/lib/api/profile.ts
frontend/app/profile/page.test.tsx
frontend/lib/api/profile.test.ts
```

当前页面已经覆盖：

- 已填写资料时展示头像、昵称、username、bio、兴趣标签和账号信息；
- 资料为空时展示 `Complete Your Profile`；
- 没有头像时展示 fallback；
- 使用 Server Component 预取 `/api/users/me/profile`；
- 使用 `ProfileView` 负责客户端呈现；
- BFF 通过 `frontend/lib/backend.ts` 调用后端。

### 12.1 示例需求

示例需求：

> 当个人资料请求失败时，页面需要展示明确的错误状态，并提供重新加载入口；页面仍然遵守 Next.js 薄 BFF 边界。

### 12.2 Codex 的实现路径

Codex 先确认：

- 页面错误由 `error.tsx` 还是组件状态负责；
- `fetchFromBackend` 是否继续只负责 SSR 预取；
- 是否需要新增测试；
- 是否需要覆盖网络错误、后端 500、未认证和空资料。

然后执行：

1. 在 OpenSpec 中补充 Error 状态和重试行为；
2. 在 `design.md` 中说明 Server Component / Client Component 边界；
3. 在 `tasks.md` 中拆分页面、组件和测试任务；
4. 先写失败的 error-state 测试；
5. 运行 `cd frontend && npm test` 看到 RED；
6. 写最小实现；
7. 运行目标测试和完整前端测试；
8. 运行 `npm run build` 验证 Next.js 构建。

### 12.3 Claude 的验收点

```text
[ ] 正常资料状态没有回归
[ ] 空资料状态仍然提供 Edit Profile
[ ] 头像加载失败仍然有 fallback
[ ] 后端 500 不会显示空白页
[ ] Error 状态有可理解的文案
[ ] 重试行为有效或明确说明只能刷新页面
[ ] Server Component 仍然负责 SSR 预取
[ ] 没有新增 app/api/**/route.ts 业务后端
[ ] 没有把业务逻辑写入 Next.js BFF
[ ] 页面测试覆盖 Loading / Content / Empty / Error
[ ] npm test 和 npm run build 均通过
```

如果是视觉或交互变更，Claude 还应检查：

- mobile / tablet / desktop 响应式表现；
- keyboard focus 和 `aria` 属性；
- loading、empty、error、content 四态；
- 错误提示是否会泄漏后端内部信息；
- UI 是否仍然使用 Tailwind、shadcn/ui 和 lucide-react。

## 13. 阶段 6：失败后的修复循环

验收失败时，采用单向返工：

```text
Claude FAIL
    │
    ▼
acceptance.md 记录问题与证据
    │
    ▼
Codex 读取 Action Items
    │
    ▼
Codex 先补失败测试，再修实现
    │
    ▼
Codex 重新运行测试并生成新 head SHA
    │
    ▼
Claude 针对新 SHA 重新验收
```

如果发现 Spec 本身不合理：

1. Claude 只报告 Spec 冲突；
2. 人类决定是否修改需求；
3. Codex 更新 proposal / specs / design / tasks；
4. 人类重新签字；
5. Codex 再继续实现。

Claude 不能为了让代码通过而自行修改验收标准。

## 14. 阶段 7：归档与提交边界

只有在以下条件全部满足后，才能 archive：

```text
[ ] tasks.md 全部完成
[ ] Claude acceptance PASS
[ ] 目标测试通过
[ ] 全量测试通过
[ ] build / lint 通过
[ ] delta spec 已同步或明确跳过
[ ] backend 子仓已提交
[ ] frontend 子仓已提交
[ ] 父仓已更新对应 submodule 指针
```

典型提交顺序：

```bash
cd backend
git add .
git commit -m "feat: ..."

cd ../frontend
git add .
git commit -m "feat: ..."

cd ..
git add backend frontend openspec/changes
git commit -m "feat: ..."
```

最后执行：

```text
/opsx:archive <change-name>
```

归档结果应包含：

```text
openspec/changes/archive/YYYY-MM-DD-<change-name>/
├── proposal.md
├── specs/
├── design.md
├── tasks.md
└── acceptance.md
```

## 15. 本仓库的落地清单

要将这套流程真正接入 Codex + Claude，建议补充：

```text
CLAUDE.md
.claude/agents/acceptance-reviewer.md
.claude/agents/test-runner.md
.claude/settings.json
```

并调整：

```text
frontend/CLAUDE.md
```

建议的验收 agent 只具备：

- Read / Glob / Grep；
- Bash 或 PowerShell 测试执行能力；
- 只允许写 `acceptance.md` 的受控输出能力；
- 不允许写 backend / frontend 业务代码。

如果使用 Claude hooks，可以在 `PreToolUse` 阶段阻止对业务目录的 Write / Edit；如果暂时不配置 hooks，至少在验收 agent 的工具清单和系统提示中明确禁止修改源代码，并通过 git diff 检查验收前后工作区不能发生业务代码变化。

## 16. 完成标准

本流程真正运行成功，不是因为两个 AI 都说“完成了”，而是因为下面的证据都存在：

```text
proposal 说明范围
specs 说明行为
design 说明方案
tasks 说明执行顺序
RED 证明测试能捕获缺陷
GREEN 证明实现满足测试
回归测试证明已有功能没有被破坏
Claude acceptance 证明 Spec 与实现一致
archive 保存完整上下文
```

最终判断标准：

> Codex 负责把需求变成代码，Claude 负责证明代码没有偏离需求，人类负责决定这份证据是否足够。

