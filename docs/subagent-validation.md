# Subagent 配置与委派验证记录

验证日期：2026-10-24。本次仅修改父仓 Harness 与配套文档，未修改业务子模块；未修改模型、并发、全局设置或登录配置。

## 验证环境与结论范围

| 项目 | 本地环境 / 结果 |
|---|---|
| Codex CLI | `0.164.0` |
| Claude Code | `2.1.299` |
| Claude 本次实际模型 | 继承本地配置的 `glm-5`；不是本项目指定模型 |
| Python | `3.12.10`，使用 `tomllib`；PyYAML 仅安装在操作系统临时目录 |
| 静态配置检查 | 覆盖 8 个角色、16 份定义、共享规约与两份协调 Skill |
| Claude 首批真实委派 | 4 个精确角色调用与 4 个完成通知；职责核心行为符合预期，发现并修正 PM 范围补全风险 |
| Claude 精简后真实委派 | **4 个受测角色的真实委派与职责语义通过**；摘要限长目标未全部达到 |
| Codex 真实委派 | **阻塞，未通过**：修正调用后因刷新令牌撤销返回 401，未产生委派事件 |

这些版本是本次本地验证环境，不代表上游最新发布版本。只读合成样例不等于业务功能、真实页面或全部角色的端到端验收。

## 静态检查

使用临时 Python 检查脚本解析所有 Claude YAML 头与 Codex TOML，核对：

- 两侧恰好 8 个角色，名称与文件名一致，description 一致且非空。
- Claude 使用预期字段与精确工具白名单，模型为 `inherit`；Codex 只设置 `name`、`description`、`developer_instructions`，不设置无效的角色级权限字段。
- 将 Claude 正文中的 `.claude/skills/` 路径归一为 `.agents/skills/` 后，全部 8 对职责正文逐字一致。
- 显式规则 / Skill 引用均存在；Claude 预加载的每个 Skill 在两侧均存在，内容一致。
- 三个审查角色只有 `Read, Grep, Glob`，未通过 `Skill`、`Agent`、Shell、MCP、记忆配置扩展工具能力。
- PM 与交互角色不加载 `writing-plans`，两份 `subagent-driven-development` 内容一致。
- 入口文档包含 8 角色及独立代码审查职责，本次更新文档的相对链接可解析。
- `git diff --check` 无空白错误，`git diff --name-only -- backend frontend` 无输出。

另由独立只读审查检查精简是否丢失 OpenSpec 审批、TDD、薄 BFF、测试文件所有权与体验证据边界，未发现高 / 中影响问题。该审查属于静态检查，不冒充运行验证。

临时校验脚本和依赖未加入项目运行依赖。`claude plugin validate <目录> --strict --json` 即使返回 `success: true`，若 `contents` 为空，也不能证明目标角色文件已被检验。

## 角色正文精简测量

对新增 `code-reviewer` 后、精简前后的同一组 8 角色比较。统计每个 TOML 经 `tomllib` 解析后的 `developer_instructions`，按 Unicode 字符计数并统一换行；不含配置头、共享规则或 Skill 全文，也不把另一工具的镜像重复计入。

| 指标 | 精简前 | 精简后 | 减少 |
|---|---:|---:|---:|
| 角色数 | 8 | 8 | — |
| 正文字符总数 | 20,844 | 7,358 | 64.70% |
| 正文行数 | 945 | 331 | 64.97% |

精简保留任务输入、分域规则引用、TDD、审批、文件边界、证据要求与精简回传协议，移除了默认大模板和重复方法说明。字符减少不等于 token、费用或耗时按同样比例减少；Skills、项目指令、任务上下文、缓存和模型执行路径仍会影响实际开销。

以下示例可复测当前正文大小，无需第三方依赖：

```python
from pathlib import Path
import tomllib

bodies = [
    tomllib.loads(p.read_text(encoding="utf-8"))["developer_instructions"]
    for p in Path(".codex/agents").glob("*.toml")
]
print(len(bodies), sum(map(len, bodies)), sum(len(b.splitlines()) for b in bodies))
# 8 7358 331
```

## Claude 真实委派

使用新会话、继承模型和只读工具集合；父会话只提供 `Agent,Read,Grep,Glob`。每次运行只测试下面四个小任务，要求以精确 `subagent_type` 启动角色并等待原生完成通知：

| 角色 | 合成输入 | 行为核对 |
|---|---|---|
| `code-reviewer` | `sample.py` diff：`def mean(values): return sum(values) / len(values)` | 指出空列表导致除零；只读分析，未实际运行或修复 |
| `product-manager` | 唯一确认需求是添加 / 取消收藏城市 | 业务验收不把登录或跨会话持久化当成已确认需求；技术 design / 工程 tasks 由主 agent 整合 |
| `test-agent` | 只询问测试职责与文件分工 | 实现者负责功能 RED → GREEN；独立测试角色负责契约 / 集成 / E2E / 回归，编辑前须分配文件 |
| `experience-agent` | 仅有 `<button className="text-gray-400 bg-gray-100">Go</button>` 源码 | 区分静态线索和运行证据；缺少截图、交互和 a11y 输出时，运行态结论为证据不足 |

首批运行退出码 0，耗时 108.70 秒，捕获 4 次原生 `Agent` 调用和 4 次 `completed` 通知。代码 / 测试 / 体验的核心检查成立，PM 正确说明技术文档分工，但验收草案额外补充了未确认的登录和持久化行为；最终提示词已加入“未提供或未确认的行为只能列为待确认”。因此不能把首批结果解释为 PM 范围控制已充分验证。

精简后复验沿用四个任务并加强 PM 范围与精简回传检查，整体超时上限 180 秒。实际退出 0，耗时 **179.73 秒**，未触发超时；4 个精确角色调用均对应原生完成通知，主线程完成标记在全部完成通知之后。4 个受测角色的定义哈希在运行前后一致，实际工具调用只有 `Agent × 4`，没有写入工具调用。

- 代码审查指出 `sample.py:2` 的空列表除零，只声明静态分析结果。
- PM 的验收限定加入 / 移出收藏，持久化、登录与游客行为列为待确认，并正确说明技术文档所有权。
- 测试角色正确说明功能 TDD 与独立验证分工，未将本轮只读分析当成已执行测试。
- 体验角色将运行态视觉 / 交互 / 无障碍标为证据不足，列出缺少的运行证据。

全部角色采用“状态 / 结果 / 验证 / 剩余”结构。本轮额外请求每份摘要不超过 220 字符，实际为 **220 / 330 / 207 / 233** 字符；PM 与体验摘要超过目标，因此严格限长项未通过。项目默认规约要求精简并保留重要发现，没有把 220 字符设置为永久硬限制。

| CLI 累计指标 | 首批精简前 | 精简后复验 |
|---|---:|---:|
| 耗时（秒） | 108.70 | 179.73 |
| `inputTokens` | 55,599 | 41,993 |
| `cacheReadInputTokens` | 92,736 | 48,512 |
| `outputTokens` | 8,019 | 10,283 |
| `cacheCreationInputTokens` | 0 | 0 |
| CLI 估计费用（USD） | 0.524838 | 0.491296 |

累计 `modelUsage` 的重复快照只计一次。费用字段的 `costBasis` 为 `unknown`，不视为真实账单；两轮任务提示、缓存和执行路径有差异，只各运行一次。最终耗时更长，不能宣称优化提速或给出稳定节省比例。

复现时在根目录准备 UTF-8 提示文件，写入上述输入，并明确禁止修改文件、执行业务测试和自行继续委派。PowerShell 调用形式：

```powershell
$OutputEncoding = [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
Get-Content -LiteralPath <prompt.txt> -Encoding UTF8 -Raw | claude -p --output-format stream-json --verbose --forward-subagent-text --permission-mode plan --tools Agent,Read,Grep,Glob
```

运行器需另设总超时并在超时后终止进程树。验证以原生 `Agent` 事件的精确角色名、完成通知和各角色返回内容为准；主线程自述“已经委派”或进程退出 0 都不足以证明成功。通过标准也包括未调用写入工具、不将合成输入判断冒充实际执行结果。

## Codex 阻塞记录

最初连通性探针成功返回固定文本，仅证明当时可调用模型。第一次角色测试使用 `codex exec --ephemeral --sandbox read-only --json -`，虽退出 0，却没有委派事件，并出现 `invalid thread-store request: no rollout found for thread id`。`--ephemeral` 与子线程需要父 rollout 不兼容只是当时假设，未获验证。

随后移除 `--ephemeral`，以 `codex exec --sandbox read-only --json -` 在新会话复测：3.41 秒后退出 1，刷新令牌因撤销返回 **401 Unauthorized**，仍无委派事件。检测到认证失败后立即停止，未反复重试。用户选择先完成配置优化，真实委派保持待登录后验证。

因此本次只确认 Codex 静态配置一致，不能声称 8 个 Codex 角色已在原生会话中全部加载或成功委派。登录恢复后，应使用有超时的非 ephemeral 父会话，核对精确角色的原生委派 / 完成事件与同一组合成语义检查。

## 证据保存与后续调优

原始流日志只保存在操作系统临时目录，不复制到仓库，避免把会话上下文写入项目文档。本记录只保留必要的环境、输入、判据、结果和限制。

- 首批摘要：临时目录 `workspace-native-smoke-probe-rbf4tokv` 下的 `phase1-smoke-summary.json`；认证阻塞见 `codex.roles.corrected.result.json`。
- 最终 Claude 复验：临时目录 `workspace-native-final-smoke-pt774rot` 下的 `native-audit-summary.json`、`runner-result.json` 与 `invocation.json`。

继续沿用模型和并发继承，本次未添加 `.codex/config.toml`。先恢复 Codex 的真实委派验证，再选择重复可比的实际任务测量质量、耗时、输入 / 缓存 / 输出 token；现有合成样例不足以支持固定模型或并发数的结论。
