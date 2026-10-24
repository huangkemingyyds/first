# Claude Code / Codex 自定义 agent 使用指南

官方文档核对日期：2026-10-24。本文的本地 CLI 核对版本：Codex CLI `0.164.0`、Claude Code `2.1.299`；这些是本次验证环境，不代表声明上游最新发布版本。界面与可用字段以对应版本官方文档为准。

## 本项目的 8 个角色

| 名称 | 职责 | 允许的任务范围 |
|---|---|---|
| `product-manager` | 需求、proposal、业务规格与验收标准 | 任务授权的产品 / OpenSpec 文档；技术 design 与工程 tasks 由主 agent 整合 |
| `interaction-agent` | 用户流程、组件状态、交互规格 | 任务授权的交互文档 |
| `frontend-agent` | Next.js / React 实现 | 已确认规划中分配的前端代码与测试 |
| `backend-agent` | Spring Boot API 与业务实现 | 已确认规划中分配的后端代码与测试 |
| `test-agent` | 独立契约 / 集成 / E2E、边界遗漏与回归验证 | 任务授权的测试与测试配置；不抢占实现者的 TDD 测试文件 |
| `spec-reviewer` | 对照 Spec 检查遗漏、偏离与超纲 | 只阅读和报告 |
| `code-reviewer` | 检查 diff 的正确性、安全、竞态和回归风险 | 只阅读和报告可行动发现，不负责修复 |
| `experience-agent` | 视觉、交互与无障碍审查 | 只阅读和报告；证据不足时标注未验证 |

这些范围属于职责约束，不能替代客户端权限设置。角色不会绕过 OpenSpec 规划确认、TDD 与批次检查点。委派和交接统一遵循 [Subagent 协作规约](../.agents/rules/subagent-conventions.md)。

## 文件与模型配置

| 项目 | Claude Code | Codex |
|---|---|---|
| 项目角色 | `.claude/agents/<name>.md` | `.codex/agents/<name>.toml` |
| 个人角色 | `~/.claude/agents/` | `~/.codex/agents/` |
| 必需字段 | YAML 头的 `name`、`description` | TOML 的 `name`、`description`、`developer_instructions` |
| 角色正文 | YAML 头之后的 Markdown | `developer_instructions` 多行字符串 |
| 核心方法 | `skills` 预加载全文，按适用阶段执行 | 可用 Skills 继承父会话；正文按任务读取 `.agents/skills/` 中对应文件 |
| 模型 | 本项目显式 `model: inherit` | 本项目省略 `model` / `model_reasoning_effort`，沿用主会话或上层 agent 默认配置 |

Codex 当前支持发现 `.codex/agents/` 下的独立 TOML，不需要在 `.codex/config.toml` 逐个注册。角色身份以 `name` 字段为准，两边都保持文件名与名称一致。

Codex 的 Skills 继承指可用集合的继承，不等于 Claude frontmatter `skills` 的全文预加载。本项目仍要求角色按阶段读取实际使用的方法。

两边同步角色职责、规约引用、任务边界和验收标准；工具字段与 Skills 加载机制分别按客户端维护。Claude 的 `tools` 不能直接复制成 Codex 配置，Codex 的配置字段也不能原样放进 Claude 的 YAML 头。

## 从项目根目录启动

```powershell
codex
```

或：

```powershell
claude
```

Codex 原生读取 `AGENTS.md`。Claude Code v2.1.277+ 在没有工作目录 / 祖先目录 `CLAUDE.md`、`.claude/CLAUDE.md`、`CLAUDE.local.md` 时默认读取 `AGENTS.md`；个人设置或运行环境也可能改变加载方式。通过会话的指令加载提示确认本仓库入口已加载。

若需要兼容旧版，或现有 Claude 指令文件使 `AGENTS.md` 未加载，可在相应 `CLAUDE.md` 中按官方导入语法写 `@AGENTS.md`（相对路径基于该文件），或在个人 Project instructions 中选择同时加载。不要复制整份治理规则形成第二个维护源。

## 委派一个任务

两个工具都可以使用同一段明确的任务描述：

```text
请启动 spec-reviewer 子 agent。

任务：审查 <change-name> 的实现是否符合规划。
输入：openspec/changes/<change-name>/ 下的 proposal、design、tasks 和 specs，
      以及主 agent 提供的实现文件列表或 Git diff。
可修改范围：无，只阅读和报告。
验收：列出遗漏、偏离和超出范围的实现，给出文件位置；证据不足标注未验证。
请等待它完成，再由主 agent 汇总结果。
```

Codex 在用户明确要求委派或适用项目规则 / Skill 要求时启动子 agent；不要仅靠“以某角色角度分析”来确认是否产生了子线程。CLI 中用 `/subagents` 查看和切换子线程，也可以直接要求主 agent 继续指导或停止某个子 agent。

Claude Code 可以按任务与 `description` 自动委派；自然语言指定名称仍由模型决定是否委派。需要确定调用某个角色时，在输入框键入 `@` 并选择该 agent。当前文档也支持手工输入 `@agent-spec-reviewer`。

这些角色文件不创建同名的 `/backend-agent` 或 `$backend-agent` 命令。`$openspec-apply-change` 等是 Skill 入口，和自定义 agent 是两类机制。

## Claude 的整场角色会话

```powershell
claude --agent backend-agent
```

此时主线程采用该角色的指令、工具限制和模型配置，和“主线程派出一个后端子 agent”不同。自定义角色的非空正文会替换默认 Claude Code 系统提示词，项目指令仍按客户端规则加载。

本项目这 8 个角色的工具列表不包含 `Agent`，因此即使通过 `--agent` 启动，也不承担继续派发子 agent 的协调职责。需要多角色协作时，正常启动主会话，由主 agent 委派。

本次核对的 Codex CLI 没有对应的 `--agent` 启动参数；`codex -p` 选择的是配置 profile，不能用来选择自定义 agent。

Claude Code 的 `/agents` 行为存在版本差异：v2.1.197 及更早版本打开交互管理向导，当前文档中的版本提示通过对话或直接编辑角色文件管理。不要把旧教程的界面当作加载成功的前提。

## 权限边界

Claude 的 `tools` 是工具白名单。本项目三个审查角色只配置 `Read, Grep, Glob`，未提供写文件、Shell、Skill、MCP 或委派工具；`experience-agent` 所需的验证方法通过 `skills` 预加载。未配置 `memory`，避免给审查角色自动增加记忆写入工具。

产品 / 交互角色有 `Write`、`Edit`，用于授权范围内的文档维护；前端 / 后端 / 测试角色有 Shell 以执行验证。工具白名单不等于路径沙箱，具体写入范围仍受父会话权限与任务约束影响。本项目不为角色设置自动放行的 `permissionMode`。

Codex 子 agent 继承父会话的沙箱、审批、provider 与 MCP 配置；角色 TOML 中的 `sandbox_mode`、`approval_policy`、`model_provider`、`mcp_servers` 不能覆盖父会话。本项目移除了无效的角色级 `sandbox_mode`，也不宣称三个审查角色有独立只读沙箱。

需要严格只读的 Codex 学习 / 审查会话时，在启动时设置：

```powershell
codex --sandbox read-only
```

只读角色无法完成浏览器操作或实际测试时，返回所需证据，由主 agent 安排验证，再提供结果。不能凭静态源码把页面体验、测试或上线验收标记为通过。

## 多角色协作示例

```text
请对 <change-name> 的稳定实现并行安排 spec-reviewer 与 code-reviewer。
前者检查规格覆盖，后者检查实际 diff 的代码风险；两者只阅读和报告。
将发现按严重性汇总，保留文件位置、验证证据和未验证项。
需要测试缺口分析时再加入 test-agent，最终回归在代码稳定后执行。
```

优先并行探索、审查与日志分析。前后端并行写入前，先确认 API 契约与任务依赖，并分别指定可修改的文件；功能的 RED → GREEN 测试由实现者负责，独立测试角色不得同时编辑同一文件。

8 个专门角色默认不嵌套委派。主 agent 读取 `subagent-driven-development` Skill 来协调任务与两阶段 review；不要求每个执行角色再次派发它自己的工作。并行运行会增加模型调用和 token 用量，仅在任务能独立推进时使用。

默认回传状态、主要结果、验证和剩余事项；完整日志、评分表或双向对账矩阵仅在任务明确需要时输出。体验审查单独区分“已验证通过”“发现问题”“证据不足”，静态审查不能替代运行态验收。

角色正文只保留职责、输入、关键边界和必要引用；共享规则集中维护，完整方法按阶段读取。Claude 仅预加载角色核心 Skills，交互角色不加载用于生成工程 tasks 的 `writing-plans`。

模型与并发沿用当前环境。本次只读样例不足以支持为整个项目固定模型或并发数；角色文本缩短也不能直接换算成相同比例的 token、费用或耗时下降。当前测量与运行验证范围见 [Subagent 验证记录](subagent-validation.md)。

## 维护与核对

1. 修改角色时同步另一工具的职责正文，保留 `.agents/rules/` 的单一规约来源。
2. 检查 TOML / YAML 语法、必需字段、唯一名称、Skill 与规则引用路径，确认审查角色没有新增写入工具。
3. Claude 官方提供 `claude plugin validate <目录> --strict --json`。必须确认报告实际包含目标 agent 文件；空的 `contents` 不能证明 8 个角色都已校验。必要时检查 `claude --debug` 日志中的加载与未知字段警告。
4. 更新 Claude 现存角色文件后，当前版本通常会自动发现；首次创建此前不存在的 agents 目录等情况需重启。Codex 修改后建议在新会话中确认角色可用，避免当前线程继续使用旧指令。
5. 配置检查不等于实际委派测试。实际委派时确认角色名称、子线程、输入和返回结果，业务验证仍需真实测试与验收证据。

## 官方来源

- [ChatGPT / Codex Subagents（App 入口）](https://learn.chatgpt.com/docs/agent-configuration/subagents?surface=app)：上下文隔离、摘要回传、读任务并行、模型与能力配置原则。
- [Codex Subagents](https://developers.openai.com/codex/subagents)：独立 TOML、委派、线程控制、配置字段和权限继承。
- [Claude Code Subagents](https://code.claude.com/docs/en/sub-agents)：frontmatter、Skills 预加载、工具白名单、`@` 选择、`--agent` 与版本差异。
- [Claude Code 项目指令与 AGENTS.md](https://code.claude.com/docs/en/memory#agents-md)：原生读取条件、指令选择与导入机制。
