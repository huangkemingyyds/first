# my-first-project

一个基于 **Harness + OpenSpec + Superpowers** 三大理念初始化的 AI coding 项目骨架。

## 这是什么

它不是一个业务项目，而是一套**给 AI 编码 agent 用的工作流脚手架**：

- **Harness**：双工具配置——Claude Code 用 `.claude/`，Codex 用 `.agents/`，共享规约在 `.agents/rules/`
- **OpenSpec**（[Fission-AI/OpenSpec](https://github.com/Fission-AI/OpenSpec)）：通过 `openspec init --tools claude,codex` **真实初始化**，CLI 由 `@fission-ai/openspec` 提供
- **Superpowers**（[obra/superpowers](https://github.com/obra/superpowers)）：8 个核心 skills 的本地化模板，与 OpenSpec 官方 skill 共存

## 目录速览

```
.
├── AGENTS.md              # AI agent 入口（先读这个，Claude Code / Codex 原生加载）
├── .claude/               # Harness 层（Claude Code：skills + commands）
├── .agents/               # Harness 层（Codex：skills）+ 双工具共享 rules
│   ├── rules/             # 编码 / 分域规约（共享）
│   └── skills/            # OpenSpec 官方 + superpowers skills（Codex 用）
├── openspec/              # Spec 层
│   ├── project.md         # 项目愿景与范围
│   ├── specs/             # 已稳定的能力 spec
│   └── changes/           # 进行中的变更提案
├── backend/                # Spring Boot 后端（0002 变更后）
└── frontend/               # Next.js + React 前端（migrate-frontend-to-nextjs 变更后）
```

## 怎么用

1. Claude Code 直接用 `/opsx:propose 加一个 hello world 命令行工具` 开局；Codex 用 `$openspec-propose <描述>`。
2. OpenSpec 会按流程生成 `openspec/changes/<name>/{proposal,design,tasks}.md`，等你签字。
3. 用 `/opsx:apply`（Codex：`$openspec-apply-change`）推进实现——superpowers 的 `test-driven-development` skill 会介入，强制 RED→GREEN→REFACTOR。
4. 完成后 `/opsx:archive`（Codex：`$openspec-archive-change`）归档。

## 依赖

- **Node.js ≥ 20.19**（OpenSpec CLI 要求，前端同样依赖）。本机用 nvm 管理。
- **JDK 17**（Corretto / Temurin 均可）。
- **Maven ≥ 3.6.1**（老版本本仓库已在 `backend/pom.xml` 中钉住了兼容插件版本；Maven 3.6.3+ 则可拆除那段 `pluginManagement`）。
- 仓库**未** `git init`，运行 `git init` 自行开始。

## 本地开发

> 后端跟前端要起两个终端；前端 Next.js Server Component 在服务端直接 fetch `BACKEND_URL`（无 CORS）。**先起后端再起前端**。

```bash
# 终端 A：后端（启动后监听 localhost:8080）
mvn -f backend/pom.xml spring-boot:run

# 终端 B：前端（启动后监听 localhost:3000，被占时自动 fallback）
cd frontend && npm install && npm run dev
```

首次启动前手动创建 `frontend/.env.local`（已在 `.gitignore`）：

```bash
# frontend/.env.local
BACKEND_URL=http://localhost:8080
```

打开浏览器访问 <http://localhost:3000/>，看到页面显示 `hello` 即代表前后端 SSR 联调通了。

### 跑测试

```bash
mvn -f backend/pom.xml test       # 后端
cd frontend && npm test           # 前端（Vitest）
```

### 端口约定

| 路径 | 运行位置 | 说明 |
|---|---|---|
| `http://localhost:8080/api/hello` | Spring Boot | 返回纯文本 `hello` |
| `http://localhost:3000/` | Next.js dev server | App Router 首页（SSR 预取 `/api/hello`） |
| `BACKEND_URL` | `frontend/.env.local`（不入仓） | Server Component 服务端 fetch 地址 |

## 升级 OpenSpec

```bash
npx @fission-ai/openspec@latest update
```
