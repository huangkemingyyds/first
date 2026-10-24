---
name: subagent-driven-development
description: 主 agent 委派独立任务并协调 Spec 与代码质量两阶段评审
when-to-use: 存在明确任务边界且隔离上下文或并行处理有实际收益
---

# subagent-driven-development

由主 agent 读取 `.agents/rules/subagent-conventions.md` 并协调委派。专门角色只完成分配任务，不递归派发；短小或强依赖当前上下文的任务由主 agent 直接处理。

## 派发

```text
Task: <task-id / 当前任务>
Inputs: <change、相关 specs/design/tasks、必要用户决策与审批状态>
Ownership: <允许修改的文件；只读写“无”>
Dependencies: <已满足与待等待的依赖、API 契约>
Acceptance: <完成条件、验证方式>
Return: <状态、结果、验证、剩余事项>
```

- 优先并行探索、审查、日志与测试缺口分析；写任务仅在文件互不冲突且依赖已满足时并行。
- 功能实现者负责对应的 RED → GREEN 测试。`test-agent` 承担独立契约 / 集成 / E2E 与回归；共同编辑既有测试前先重新分配文件所有权。
- 委派之前核实角色存在、必要工具可用；不要静默替换为职责不同的角色。

## 两阶段评审

1. `spec-reviewer`：检查需求覆盖、design 偏差、未完成验收和超出范围的实现。
2. `code-reviewer`：检查稳定 diff 的正确性、安全、竞态、错误处理与回归风险，报告可行动发现。

两阶段须分别完成。主 agent 可在输入稳定时并行收集审查结果，再统一裁决；二者都不直接修复代码。不通过时将具体发现交回实现者，修复后复验，不把缺少证据标记成通过。

## 回传与收尾

- 默认只返回状态、重要结果及位置、实际验证摘要、未验证项和需决策事项。
- 全量日志和完整对账矩阵按需提供；需保存时由有写权限的主 agent 处理。
- 角色的局部完成不等于 change 完成；主 agent 继续核对回归、批次检查点、剩余任务与归档条件。
