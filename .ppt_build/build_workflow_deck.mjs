import pptxgen from 'pptxgenjs';
import path from 'node:path';
import { mkdirSync } from 'node:fs';

const pptx = new pptxgen();
pptx.defineLayout({ name: 'WIDE', width: 13.333, height: 7.5 });
pptx.layout = 'WIDE';
pptx.author = 'Codex';
pptx.company = 'OpenAI';
pptx.subject = 'Codex + OpenSpec + Superpowers + Claude Acceptance';
pptx.title = 'AI Coding Harness：已有项目开发流程';
pptx.lang = 'zh-CN';
pptx.theme = { headFontFace: 'Microsoft YaHei', bodyFontFace: 'Microsoft YaHei', lang: 'zh-CN' };

const C = {
  bg: '0A1222', panel: '111F36', panel2: '162B4A', panel3: '1E3D63',
  text: 'F3F7FC', muted: 'B4C4D8', dim: '7D95B3', line: '2A4568',
  cyan: '5CE1E6', blue: '69A9FF', orange: 'FFB454', green: '76D8A4', red: 'FF7E8E',
};
const FONT = 'Microsoft YaHei';
const MONO = 'Cascadia Code';

function addShape(slide, type, x, y, w, h, fill, lineColor = fill, extra = {}) {
  slide.addShape(type, {
    x, y, w, h,
    fill: { color: fill, transparency: extra.fillTransparency ?? 0 },
    line: { color: lineColor, transparency: extra.lineTransparency ?? 0, width: extra.lineWidth ?? 1 },
    ...extra,
  });
}

function text(slide, value, x, y, w, h, options = {}) {
  slide.addText(value, {
    x, y, w, h,
    fontFace: options.fontFace || FONT,
    fontSize: options.fontSize ?? 16,
    color: options.color || C.text,
    bold: options.bold ?? false,
    italic: options.italic ?? false,
    align: options.align || 'left',
    valign: options.valign || 'mid',
    margin: options.margin ?? 0,
    fit: options.fit || 'shrink',
    breakLine: false,
    charSpacing: options.charSpacing,
  });
}

function rect(slide, x, y, w, h, fill = C.panel, stroke = C.line) {
  addShape(slide, pptx.ShapeType.roundRect, x, y, w, h, fill, stroke, { radius: 0.12, lineWidth: 1 });
}

function circle(slide, x, y, d, fill, stroke = fill, width = 1) {
  addShape(slide, pptx.ShapeType.ellipse, x, y, d, d, fill, stroke, { lineWidth: width });
}

function connector(slide, x1, y1, x2, y2, color = C.line, width = 1.5, dashType = 'solid') {
  slide.addShape(pptx.ShapeType.line, { x: x1, y: y1, w: x2 - x1, h: y2 - y1, line: { color, width, dashType } });
}

function chevron(slide, x, y, w = 0.27, h = 0.48, color = C.line) {
  addShape(slide, pptx.ShapeType.chevron, x, y, w, h, color, color, { lineWidth: 0 });
}

function arrow(slide, x, y, w, h, color = C.cyan) {
  addShape(slide, pptx.ShapeType.rightArrow, x, y, w, h, color, color, { lineWidth: 0 });
}

function header(slide, section, title, subtitle, page) {
  text(slide, section.toUpperCase(), 0.62, 0.30, 3.6, 0.22, { fontSize: 10, color: C.cyan, bold: true, charSpacing: 1.4 });
  text(slide, title, 0.62, 0.66, 11.4, 0.48, { fontSize: 27, bold: true });
  if (subtitle) text(slide, subtitle, 0.64, 1.24, 11.6, 0.28, { fontSize: 13, color: C.muted });
  connector(slide, 0.62, 1.72, 12.70, 1.72, C.line, 0.9);
  text(slide, page, 12.02, 0.30, 0.66, 0.22, { fontSize: 10, color: C.dim, align: 'right' });
}

function footer(slide, label = 'AI CODING HARNESS  /  BROWNFIELD DEVELOPMENT') {
  connector(slide, 0.62, 7.10, 12.70, 7.10, C.line, 0.8);
  text(slide, label, 0.62, 7.18, 8.6, 0.14, { fontSize: 8.5, color: C.dim, charSpacing: 0.7 });
}

function note(slide, body, sources) {
  slide.addNotes(`讲解提示：${body}\n\n来源：${sources}`);
}

// 01 Cover
{
  const s = pptx.addSlide();
  s.background = { color: C.bg };
  text(s, 'AI CODING × BROWNFIELD', 0.76, 0.76, 4.0, 0.24, { fontSize: 11, color: C.cyan, bold: true, charSpacing: 1.6 });
  text(s, '已有项目的\nAI 开发流程', 0.76, 1.32, 6.2, 1.36, { fontSize: 39, bold: true, valign: 'top' });
  text(s, 'Codex 实现 · OpenSpec 约束 · Superpowers 执行 · Claude 验收', 0.78, 3.14, 6.4, 0.34, { fontSize: 17, color: C.muted });
  text(s, '本项目案例：Spring Boot 后端 + Next.js 前端 + 独立验收', 0.78, 3.78, 5.9, 0.28, { fontSize: 13, color: C.dim });

  rect(s, 7.72, 0.88, 4.72, 5.76, C.panel, C.line);
  text(s, '一条变更如何走完？', 8.16, 1.30, 3.5, 0.28, { fontSize: 14, color: C.muted, bold: true });
  const flow = [
    { y: 2.06, color: C.cyan, title: 'Codex', sub: '理解与实现' },
    { y: 2.98, color: C.blue, title: 'OpenSpec', sub: '共享契约' },
    { y: 3.90, color: C.orange, title: 'Superpowers', sub: 'TDD 方法' },
    { y: 4.82, color: C.green, title: 'Claude', sub: '独立验收' },
  ];
  flow.forEach((n, i) => {
    circle(s, 8.22, n.y, 0.42, n.color, n.color, 0);
    text(s, String(i + 1), 8.22, n.y + 0.08, 0.42, 0.20, { fontSize: 11, color: C.bg, bold: true, align: 'center' });
    text(s, n.title, 8.92, n.y + 0.02, 1.36, 0.24, { fontSize: 15, color: n.color, bold: true });
    text(s, n.sub, 10.48, n.y + 0.03, 1.42, 0.22, { fontSize: 11, color: C.muted, align: 'right' });
    if (i < flow.length - 1) connector(s, 8.43, n.y + 0.42, 8.43, n.y + 0.92, C.line, 1.6);
  });
  text(s, '最终决定：人类是否接受证据', 8.16, 5.86, 3.76, 0.24, { fontSize: 13, color: C.orange, bold: true });
  text(s, '01', 12.04, 0.76, 0.54, 0.20, { fontSize: 10, color: C.dim, align: 'right' });
  footer(s, 'AI CODING HARNESS  /  CODEX + OPENSPEC + SUPERPOWERS + CLAUDE');
  note(s, '这一套流程针对已有项目，不把 AI 当作一次性代码生成器，而是把它放进可追踪、可测试、可验收的工程闭环。', 'docs/ai-coding-harness-development-workflow.md；README.md；AGENTS.md');
}

// 02 Roles
{
  const s = pptx.addSlide();
  s.background = { color: C.bg };
  header(s, '01 / ROLES', '四种角色，四种责任', '两个 AI 不应该同时拥有“生产 + 裁判”的完整闭环。', '02');

  const roles = [
    { x: 0.82, color: C.cyan, name: 'Codex', job: '生产者', bullets: '读现状\n写 OpenSpec\n写代码与测试', out: '代码 + 测试 + handoff' },
    { x: 3.88, color: C.blue, name: 'OpenSpec', job: '共享契约', bullets: '范围\n行为\n设计\n任务', out: 'proposal / specs / design / tasks' },
    { x: 6.94, color: C.orange, name: 'Superpowers', job: '方法层', bullets: 'RED\nGREEN\nREFACTOR\n验证', out: '过程纪律' },
    { x: 10.00, color: C.green, name: 'Claude', job: '独立验收', bullets: '读 diff\n跑测试\n双向对账', out: 'PASS / FAIL' },
  ];
  roles.forEach((r, i) => {
    rect(s, r.x, 2.20, 2.48, 3.84, C.panel, r.color);
    circle(s, r.x + 0.24, 2.54, 0.38, r.color, r.color, 0);
    text(s, String(i + 1), r.x + 0.24, 2.63, 0.38, 0.18, { fontSize: 10, color: C.bg, bold: true, align: 'center' });
    text(s, r.name, r.x + 0.76, 2.54, 1.42, 0.26, { fontSize: 16, color: r.color, bold: true });
    text(s, r.job, r.x + 0.24, 3.18, 1.72, 0.28, { fontSize: 21, bold: true });
    connector(s, r.x + 0.24, 3.78, r.x + 2.20, 3.78, C.line, 1);
    text(s, r.bullets, r.x + 0.24, 4.10, 1.72, 1.10, { fontSize: 14, color: C.muted, valign: 'top' });
    text(s, r.out, r.x + 0.24, 5.50, 1.96, 0.30, { fontSize: 10.5, color: r.color, bold: true, fit: 'shrink' });
    if (i < roles.length - 1) chevron(s, r.x + 2.64, 3.62, 0.30, 0.54, C.line);
  });
  rect(s, 0.88, 6.34, 11.54, 0.44, C.panel2, C.orange);
  text(s, '人类只保留三个决定：范围批准、设计批准、最终业务接受。', 1.20, 6.45, 10.92, 0.18, { fontSize: 13.5, color: C.orange, bold: true, align: 'center' });
  footer(s);
  note(s, '用角色而不是模型品牌来定义流程。Codex 拥有业务代码写权限，Claude 的默认职责是独立验收。', 'docs/ai-coding-harness-development-workflow.md；.qoder/agents/spec-reviewer.md');
}

// 03 Brownfield baseline
{
  const s = pptx.addSlide();
  s.background = { color: C.bg };
  header(s, '02 / BROWNFIELD', '已有项目的第一步是建立基线', '先知道仓库当前是什么状态，再决定这次变更应该落在哪里。', '03');

  rect(s, 0.82, 2.18, 4.12, 4.14, C.panel2, C.cyan);
  text(s, '当前项目地图', 1.20, 2.56, 1.54, 0.24, { fontSize: 13, color: C.cyan, bold: true });
  const tree = [
    ['父仓', 'AGENTS.md · openspec/ · .qoder/'],
    ['backend/', 'Spring Boot 3.3 · 8080'],
    ['frontend/', 'Next.js 16 · React 19 · 3000'],
    ['openspec/', 'specs/ · changes/ · archive/'],
  ];
  tree.forEach((row, i) => {
    const yy = 3.06 + i * 0.66;
    circle(s, 1.24, yy + 0.07, 0.16, [C.cyan, C.blue, C.orange, C.green][i], [C.cyan, C.blue, C.orange, C.green][i], 0);
    text(s, row[0], 1.58, yy, 1.15, 0.24, { fontSize: 13, color: C.text, bold: true });
    text(s, row[1], 2.76, yy + 0.01, 1.80, 0.22, { fontSize: 10.5, color: C.muted, fit: 'shrink' });
  });
  text(s, '父仓只追踪子仓 SHA', 1.20, 5.86, 2.46, 0.24, { fontSize: 13, color: C.orange, bold: true });

  text(s, 'Codex 必须先回答', 5.64, 2.34, 2.28, 0.28, { fontSize: 15, color: C.muted, bold: true });
  const qs = [
    ['01', '变更影响哪个仓？', 'parent / backend / frontend'],
    ['02', '已有能力在哪里？', 'spec / code / tests'],
    ['03', '当前工作区干净吗？', 'git status / submodule status'],
    ['04', '什么证据能证明完成？', 'test / build / browser'],
  ];
  qs.forEach((q, i) => {
    const yy = 2.92 + i * 0.76;
    circle(s, 5.66, yy + 0.04, 0.30, C.blue, C.blue, 0);
    text(s, q[0], 5.66, yy + 0.11, 0.30, 0.12, { fontSize: 8.5, color: C.bg, bold: true, align: 'center' });
    text(s, q[1], 6.14, yy, 2.74, 0.24, { fontSize: 14, color: C.text, bold: true });
    text(s, q[2], 9.12, yy + 0.01, 2.92, 0.21, { fontSize: 11, color: C.muted, align: 'right' });
  });
  rect(s, 5.64, 6.08, 6.30, 0.52, C.panel, C.red);
  text(s, '先基线，后写代码。', 5.90, 6.22, 5.78, 0.20, { fontSize: 15, color: C.red, bold: true, align: 'center' });
  footer(s);
  note(s, '这里用当前仓库的父仓 + 两个 submodule 结构说明 brownfield 的特殊性：验收不能只看父仓 diff。', 'AGENTS.md；README.md；openspec/project.md；当前 git status 与 openspec list --json');
}

// 04 Workflow timeline
{
  const s = pptx.addSlide();
  s.background = { color: C.bg };
  header(s, '03 / WORKFLOW', '一条变更如何走完', '每一步都有产物，每个跳步都有门禁。', '04');
  const steps = [
    { x: 0.78, color: C.cyan, n: '1', title: 'Explore', sub: '只读理解现状' },
    { x: 2.76, color: C.blue, n: '2', title: 'Propose', sub: '生成 OpenSpec' },
    { x: 4.74, color: C.orange, n: '3', title: 'Sign-off', sub: '人类批准' },
    { x: 6.72, color: C.blue, n: '4', title: 'Apply', sub: 'Codex 实现' },
    { x: 8.70, color: C.green, n: '5', title: 'Accept', sub: 'Claude 验收' },
    { x: 10.68, color: C.cyan, n: '6', title: 'Archive', sub: '收口留痕' },
  ];
  connector(s, 1.16, 3.18, 11.92, 3.18, C.line, 2);
  steps.forEach((st, i) => {
    circle(s, st.x + 0.34, 2.76, 0.84, st.color, st.color, 0);
    text(s, st.n, st.x + 0.34, 3.02, 0.84, 0.22, { fontSize: 18, color: C.bg, bold: true, align: 'center' });
    text(s, st.title, st.x, 4.02, 1.54, 0.26, { fontSize: 14, color: st.color, bold: true, align: 'center' });
    text(s, st.sub, st.x, 4.44, 1.54, 0.22, { fontSize: 11, color: C.muted, align: 'center' });
    if (i < steps.length - 1) chevron(s, st.x + 1.72, 2.96, 0.26, 0.48, C.line);
  });
  rect(s, 0.86, 5.52, 3.56, 0.82, C.panel2, C.cyan);
  text(s, 'Codex 的输出', 1.16, 5.76, 1.10, 0.20, { fontSize: 12, color: C.cyan, bold: true });
  text(s, '代码、测试、handoff', 2.50, 5.76, 1.46, 0.20, { fontSize: 12, color: C.text });
  rect(s, 4.86, 5.52, 3.56, 0.82, C.panel2, C.orange);
  text(s, 'Claude 的输出', 5.16, 5.76, 1.10, 0.20, { fontSize: 12, color: C.orange, bold: true });
  text(s, 'acceptance.md + PASS/FAIL', 6.46, 5.76, 1.66, 0.20, { fontSize: 11, color: C.text, fit: 'shrink' });
  rect(s, 8.86, 5.52, 3.56, 0.82, C.panel2, C.green);
  text(s, '人类的输出', 9.16, 5.76, 1.10, 0.20, { fontSize: 12, color: C.green, bold: true });
  text(s, '范围批准与最终接受', 10.48, 5.76, 1.58, 0.20, { fontSize: 11, color: C.text, fit: 'shrink' });
  footer(s);
  note(s, '流程重点是状态转换：Explore 之后才 Proposal，Proposal 经过人类签字才 Apply，Apply 后固定 commit 才能交给 Claude。', 'docs/ai-coding-harness-development-workflow.md；.qoder/rules/spec-driven-workflow.md');
}

// 05 OpenSpec
{
  const s = pptx.addSlide();
  s.background = { color: C.bg };
  header(s, '04 / OPENSPEC', 'OpenSpec 把需求变成可审阅的证据', '同一份 artifact 既服务 Codex 实现，也服务 Claude 验收。', '05');
  const docs = [
    { x: 0.86, color: C.cyan, file: 'proposal.md', q: '范围', body: '为什么做\n做什么\n不做什么' },
    { x: 3.56, color: C.blue, file: 'specs/', q: '行为', body: '输入输出\n错误条件\n可观察场景' },
    { x: 6.26, color: C.orange, file: 'design.md', q: '方案', body: '模块边界\n数据流\n架构取舍' },
    { x: 8.96, color: C.green, file: 'tasks.md', q: '执行', body: '实现顺序\n测试方式\n完成条件' },
  ];
  docs.forEach((d, i) => {
    rect(s, d.x, 2.36, 2.28, 3.46, C.panel, d.color);
    circle(s, d.x + 0.24, 2.70, 0.34, d.color, d.color, 0);
    text(s, String(i + 1), d.x + 0.24, 2.78, 0.34, 0.15, { fontSize: 9.5, color: C.bg, bold: true, align: 'center' });
    text(s, d.file, d.x + 0.70, 2.70, 1.34, 0.25, { fontSize: 14.5, color: d.color, bold: true });
    text(s, d.q, d.x + 0.24, 3.40, 1.50, 0.30, { fontSize: 22, bold: true });
    connector(s, d.x + 0.24, 3.94, d.x + 1.98, 3.94, C.line, 1);
    text(s, d.body, d.x + 0.24, 4.26, 1.70, 1.02, { fontSize: 14, color: C.muted, valign: 'top' });
    if (i < docs.length - 1) chevron(s, d.x + 2.38, 3.82, 0.25, 0.48, C.line);
  });
  rect(s, 0.88, 6.18, 10.36, 0.48, C.panel2, C.orange);
  text(s, '人类签字是闸门：没有批准的 Spec，Codex 不进入业务代码。', 1.18, 6.31, 9.76, 0.18, { fontSize: 13.5, color: C.orange, bold: true, align: 'center' });
  text(s, 'CLI status 是 artifact 图的事实来源', 11.54, 6.28, 0.82, 0.26, { fontSize: 9.5, color: C.dim, align: 'right', fit: 'shrink' });
  footer(s);
  note(s, '强调 OpenSpec 的两种用途：Codex 用它知道要做什么，Claude 用它判断实际做了什么。当前官方 spec-driven schema 包含 specs 阶段。', 'openspec/config.yaml；openspec/project.md；OpenSpec spec-driven schema: https://github.com/Fission-AI/OpenSpec/blob/main/schemas/spec-driven/schema.yaml');
}

// 06 Backend case
{
  const s = pptx.addSlide();
  s.background = { color: C.bg };
  header(s, '05 / BACKEND CASE', '后端案例：个人资料 API 的一项变更', '把抽象流程落到真实的 Spring Boot controller、service 和测试。', '06');

  rect(s, 0.80, 2.20, 4.10, 4.20, C.panel2, C.blue);
  text(s, '已有契约', 1.18, 2.56, 1.16, 0.24, { fontSize: 13, color: C.blue, bold: true });
  text(s, 'PUT /api/users/me/profile', 1.18, 3.00, 3.14, 0.28, { fontFace: MONO, fontSize: 16, color: C.text, bold: true, fit: 'shrink' });
  text(s, '需求示例：\nnickname 超过 30 个字符时\n返回统一的 422 校验错误。', 1.18, 3.62, 3.08, 0.78, { fontSize: 18, color: C.muted, valign: 'top' });
  text(s, '行为证据', 1.18, 4.84, 1.16, 0.22, { fontSize: 12, color: C.orange, bold: true });
  text(s, 'error_code = validation_error\ndetails.nickname 存在错误说明', 1.18, 5.20, 3.20, 0.54, { fontFace: MONO, fontSize: 11.5, color: C.orange, valign: 'top' });

  text(s, 'Codex 按任务推进', 5.64, 2.34, 2.20, 0.26, { fontSize: 15, color: C.muted, bold: true });
  const steps = [
    ['RED', '新增超长 nickname 测试', C.red],
    ['GREEN', '最小校验实现', C.green],
    ['REFACTOR', '保持 controller / service 边界', C.orange],
    ['REGRESSION', '跑完整 backend suite', C.blue],
  ];
  steps.forEach((st, i) => {
    const yy = 2.96 + i * 0.78;
    circle(s, 5.66, yy + 0.04, 0.30, st[2], st[2], 0);
    text(s, String(i + 1), 5.66, yy + 0.11, 0.30, 0.13, { fontSize: 9, color: C.bg, bold: true, align: 'center' });
    text(s, st[0], 6.14, yy, 1.20, 0.22, { fontSize: 12.5, color: st[2], bold: true });
    text(s, st[1], 7.56, yy + 0.01, 3.42, 0.22, { fontSize: 12.5, color: C.text });
    if (i < steps.length - 1) connector(s, 5.81, yy + 0.35, 5.81, yy + 0.78, C.line, 1);
  });
  rect(s, 5.64, 6.06, 6.04, 0.52, C.panel, C.green);
  text(s, 'mvn -f backend/pom.xml test', 5.98, 6.20, 5.34, 0.20, { fontFace: MONO, fontSize: 13, color: C.green, bold: true, align: 'center' });
  footer(s, 'BACKEND  /  PROFILE API  /  SPRING BOOT 3.3 + JUNIT 5');
  note(s, '后端案例使用仓库现有 user-profile capability。演示一个小的行为变更：nickname 超长时的 422 错误。', 'openspec/specs/user-profile/spec.md；backend/src/main/java/com/mooc/app/controller/ProfileController.java；backend/src/main/java/com/mooc/app/service/ProfileService.java；backend/src/test/java/com/mooc/app/controller/ProfileControllerTest.java');
}

// 07 Backend acceptance
{
  const s = pptx.addSlide();
  s.background = { color: C.bg };
  header(s, '06 / BACKEND ACCEPTANCE', 'Claude 如何验收后端变更', 'Claude 不相信“已经完成”的口头总结，只对照 Spec 和真实测试。', '07');

  rect(s, 0.82, 2.26, 5.06, 3.98, C.panel, C.orange);
  text(s, '正向对账：Spec → 代码', 1.20, 2.62, 2.66, 0.26, { fontSize: 14, color: C.orange, bold: true });
  const checks = [
    ['✓', '422 状态码正确', 'ProfileControllerTest...'],
    ['✓', 'error_code 正确', 'GlobalExceptionHandler...'],
    ['✓', 'details.nickname 存在', 'validation response'],
    ['✓', '正常资料更新不回归', 'updateProfile...'],
  ];
  checks.forEach((c, i) => {
    const yy = 3.16 + i * 0.58;
    circle(s, 1.20, yy + 0.04, 0.22, C.green, C.green, 0);
    text(s, c[0], 1.20, yy + 0.08, 0.22, 0.12, { fontSize: 9, color: C.bg, bold: true, align: 'center' });
    text(s, c[1], 1.62, yy, 2.26, 0.22, { fontSize: 12.5, color: C.text, bold: true });
    text(s, c[2], 4.02, yy + 0.01, 1.38, 0.20, { fontFace: MONO, fontSize: 9.5, color: C.muted, align: 'right', fit: 'shrink' });
  });

  rect(s, 6.28, 2.26, 5.06, 3.98, C.panel, C.red);
  text(s, '反向对账：代码 → Spec', 6.66, 2.62, 2.72, 0.26, { fontSize: 14, color: C.red, bold: true });
  const reverse = [
    '是否偷偷新增未经设计的 API？',
    '是否把业务逻辑塞进 Controller？',
    '是否改变了已有 401 / 409 行为？',
    '是否返回了公开资料不该有的 email？',
  ];
  reverse.forEach((v, i) => {
    const yy = 3.20 + i * 0.58;
    circle(s, 6.68, yy + 0.04, 0.22, C.red, C.red, 0);
    text(s, '?', 6.68, yy + 0.08, 0.22, 0.12, { fontSize: 10, color: C.bg, bold: true, align: 'center' });
    text(s, v, 7.10, yy, 3.88, 0.22, { fontSize: 12.5, color: C.text });
  });
  rect(s, 0.84, 6.48, 10.50, 0.32, C.panel2, C.green);
  text(s, '验收结论必须引用路径、行号、测试名称和实际输出。', 1.18, 6.55, 9.82, 0.16, { fontSize: 12, color: C.green, bold: true, align: 'center' });
  footer(s, 'CLAUDE  /  READ-ONLY REVIEW  /  SPEC COMPLIANCE + REGRESSION');
  note(s, '把当前仓库的 spec-reviewer 双向对账方式转成 Claude 的验收动作。关键不是“看起来合理”，而是每一条都要有证据。', 'docs/ai-coding-harness-development-workflow.md；.qoder/agents/spec-reviewer.md；backend/src/test/java/com/mooc/app/controller/ProfileControllerTest.java');
}

// 08 Frontend case
{
  const s = pptx.addSlide();
  s.background = { color: C.bg };
  header(s, '07 / FRONTEND CASE', '前端案例：个人资料页的四种状态', '同一条后端契约，前端需要把 Content、Empty、Error、Loading 变成可验证的体验。', '08');

  rect(s, 0.80, 2.18, 3.10, 4.22, C.panel2, C.cyan);
  text(s, '页面入口', 1.18, 2.56, 1.18, 0.24, { fontSize: 13, color: C.cyan, bold: true });
  text(s, 'frontend/app/profile/page.tsx', 1.18, 3.02, 2.40, 0.34, { fontFace: MONO, fontSize: 12, color: C.text, fit: 'shrink' });
  text(s, 'Server Component\n预取 /api/users/me/profile', 1.18, 3.66, 2.30, 0.62, { fontSize: 17, color: C.muted, valign: 'top' });
  text(s, 'frontend/lib/backend.ts', 1.18, 4.68, 2.40, 0.28, { fontFace: MONO, fontSize: 12, color: C.blue, fit: 'shrink' });
  text(s, '薄 BFF 只做 SSR fetch\n不写业务事务', 1.18, 5.14, 2.26, 0.54, { fontSize: 14, color: C.orange, valign: 'top' });

  text(s, '验收矩阵', 4.66, 2.34, 1.26, 0.26, { fontSize: 15, color: C.muted, bold: true });
  const states = [
    { y: 2.92, color: C.green, name: 'Content', desc: '显示昵称、头像、bio、标签', test: 'ProfileView tests' },
    { y: 3.72, color: C.blue, name: 'Empty', desc: '显示 Complete Your Profile', test: 'emptyProfile fixture' },
    { y: 4.52, color: C.orange, name: 'Error', desc: '失败时有明确提示与入口', test: '需新增失败测试' },
    { y: 5.32, color: C.cyan, name: 'Loading', desc: '请求中不允许重复提交', test: '需覆盖 loading 态' },
  ];
  states.forEach((st) => {
    rect(s, 4.64, st.y, 7.20, 0.58, C.panel, st.color);
    circle(s, 4.90, st.y + 0.15, 0.24, st.color, st.color, 0);
    text(s, st.name, 5.36, st.y + 0.12, 1.14, 0.22, { fontSize: 13, color: st.color, bold: true });
    text(s, st.desc, 6.70, st.y + 0.12, 2.92, 0.22, { fontSize: 12, color: C.text });
    text(s, st.test, 10.10, st.y + 0.13, 1.46, 0.20, { fontFace: MONO, fontSize: 9.5, color: C.muted, align: 'right', fit: 'shrink' });
  });
  rect(s, 4.64, 6.18, 7.20, 0.46, C.panel2, C.orange);
  text(s, 'npm test  +  npm run build  +  浏览器走查', 5.00, 6.31, 6.46, 0.18, { fontFace: MONO, fontSize: 12, color: C.orange, bold: true, align: 'center' });
  footer(s, 'FRONTEND  /  NEXT.JS 16 + REACT 19 + VITEST');
  note(s, '前端案例使用当前 profile 页面和已有测试。重点是让 Claude 检查四态覆盖，同时确认薄 BFF 边界没有被破坏。', 'frontend/app/profile/page.tsx；frontend/app/profile/_components/ProfileView.tsx；frontend/app/profile/page.test.tsx；frontend/lib/backend.ts；frontend/lib/api/profile.test.ts');
}

// 09 Cross stack contract
{
  const s = pptx.addSlide();
  s.background = { color: C.bg };
  header(s, '08 / CONTRACT', '前后端协作的交接点是 API contract', 'backend 先把行为说清楚，frontend 再按同一份 contract 表现状态。', '09');

  rect(s, 0.86, 2.30, 3.18, 3.78, C.panel, C.blue);
  text(s, 'Backend', 1.22, 2.68, 1.28, 0.28, { fontSize: 20, color: C.blue, bold: true });
  text(s, 'HTTP 200 / 401 / 409 / 422', 1.22, 3.34, 2.28, 0.26, { fontFace: MONO, fontSize: 12.5, color: C.text, fit: 'shrink' });
  text(s, '{\n  request_id,\n  error_code,\n  message,\n  details\n}', 1.22, 4.00, 1.82, 1.10, { fontFace: MONO, fontSize: 13, color: C.muted, valign: 'top' });
  text(s, 'ProfileController\nProfileService\nJUnit / MockMvc', 1.22, 5.40, 1.92, 0.48, { fontSize: 12, color: C.blue, valign: 'top' });

  arrow(s, 4.40, 3.82, 1.16, 0.46, C.orange);
  text(s, '共享 contract', 4.34, 4.46, 1.32, 0.22, { fontSize: 11, color: C.orange, bold: true, align: 'center' });

  rect(s, 5.84, 2.30, 3.18, 3.78, C.panel, C.cyan);
  text(s, 'Frontend', 6.20, 2.68, 1.36, 0.28, { fontSize: 20, color: C.cyan, bold: true });
  text(s, 'fetch + parse + state', 6.20, 3.34, 2.12, 0.26, { fontFace: MONO, fontSize: 12.5, color: C.text });
  text(s, 'Content\nEmpty\nError\nLoading', 6.20, 4.00, 1.84, 1.10, { fontSize: 16, color: C.muted, valign: 'top' });
  text(s, 'page.tsx\nProfileView.tsx\nVitest / RTL', 6.20, 5.40, 1.82, 0.48, { fontSize: 12, color: C.cyan, valign: 'top' });

  arrow(s, 9.38, 3.82, 1.16, 0.46, C.green);
  text(s, 'Claude 验收', 9.28, 4.46, 1.40, 0.22, { fontSize: 11, color: C.green, bold: true, align: 'center' });
  rect(s, 10.82, 2.30, 1.62, 3.78, C.panel2, C.green);
  text(s, 'Accept', 11.10, 2.78, 1.02, 0.28, { fontSize: 18, color: C.green, bold: true, align: 'center' });
  text(s, '同一条\nSpec\n两边\n都对账', 11.08, 3.54, 1.06, 1.46, { fontSize: 15, color: C.text, bold: true, align: 'center', valign: 'top' });
  footer(s, 'CONTRACT  /  ONE SPEC  /  TWO IMPLEMENTATION SIDES  /  ONE ACCEPTANCE');
  note(s, '这页用于解释为什么前后端不能各自写完再碰运气。OpenSpec spec 与 API contract 是交接点，Claude 在两侧分别核对。', 'openspec/specs/user-profile/spec.md；backend/src/main/java/com/mooc/app/controller/ProfileController.java；frontend/lib/api/profile.ts');
}

// 10 Claude acceptance
{
  const s = pptx.addSlide();
  s.background = { color: C.bg };
  header(s, '09 / CLAUDE ACCEPTANCE', 'Claude 的验收不是“再看一眼代码”', '它需要独立构建上下文、独立运行命令、独立给出结论。', '10');
  const columns = [
    { x: 0.84, color: C.orange, title: 'Spec → Code', body: '每条 MUST\n是否有实现？\n是否有测试证据？' },
    { x: 3.90, color: C.red, title: 'Code → Spec', body: '是否超纲？\n是否加了未经批准的\nAPI / 依赖 / 抽象？' },
    { x: 6.96, color: C.blue, title: 'Regression', body: '目标测试\n全量测试\n构建与 lint\n是否全部通过？' },
    { x: 10.02, color: C.green, title: 'Experience', body: '前端四态\n响应式\n可访问性\n边界错误提示' },
  ];
  columns.forEach((c, i) => {
    rect(s, c.x, 2.34, 2.46, 3.44, C.panel, c.color);
    circle(s, c.x + 0.26, 2.70, 0.32, c.color, c.color, 0);
    text(s, String(i + 1), c.x + 0.26, 2.78, 0.32, 0.14, { fontSize: 9, color: C.bg, bold: true, align: 'center' });
    text(s, c.title, c.x + 0.70, 2.70, 1.44, 0.24, { fontSize: 14.5, color: c.color, bold: true });
    connector(s, c.x + 0.26, 3.32, c.x + 2.12, 3.32, C.line, 1);
    text(s, c.body, c.x + 0.26, 3.70, 1.84, 1.30, { fontSize: 15, color: C.text, valign: 'top' });
  });
  rect(s, 0.88, 6.22, 11.28, 0.56, C.panel2, C.red);
  text(s, 'FAIL 时只返回证据化 Action Items，不直接修改业务代码。', 1.24, 6.38, 10.56, 0.20, { fontSize: 14, color: C.red, bold: true, align: 'center' });
  footer(s, 'CLAUDE  /  READ-ONLY  /  INDEPENDENT EVIDENCE');
  note(s, 'Claude 作为第二个智能体，价值在于上下文和判断的独立性。它应该能发现 Codex 自己不愿意发现的偏差。', 'docs/ai-coding-harness-development-workflow.md；.qoder/agents/spec-reviewer.md；.qoder/skills/verification-before-completion/SKILL.md');
}

// 11 Failure loop
{
  const s = pptx.addSlide();
  s.background = { color: C.bg };
  header(s, '10 / REWORK', '验收失败以后，问题回到 Codex', 'Claude 不修复自己的发现，避免“同一个智能体自己审自己”。', '11');
  const loop = [
    { x: 0.94, y: 2.64, color: C.red, title: 'Claude FAIL', sub: '记录路径、行号、复现' },
    { x: 3.60, y: 4.48, color: C.orange, title: 'acceptance.md', sub: '保存问题与证据' },
    { x: 6.26, y: 4.48, color: C.blue, title: 'Codex FIX', sub: '先补 RED，再修复' },
    { x: 8.92, y: 2.64, color: C.green, title: 'Claude RECHECK', sub: '针对新 SHA 重验' },
  ];
  loop.forEach((n) => {
    circle(s, n.x, n.y, 1.12, n.color, n.color, 0);
    text(s, n.title, n.x - 0.08, n.y + 0.36, 1.28, 0.22, { fontSize: 12.5, color: C.bg, bold: true, align: 'center' });
    text(s, n.sub, n.x - 0.44, n.y + 1.42, 2.02, 0.24, { fontSize: 11, color: C.muted, align: 'center' });
  });
  connector(s, 2.10, 3.14, 3.72, 4.48, C.line, 2);
  connector(s, 4.72, 5.04, 6.26, 5.04, C.line, 2);
  connector(s, 7.38, 4.48, 9.04, 3.14, C.line, 2);
  connector(s, 10.04, 2.64, 10.04, 2.10, C.line, 2);
  connector(s, 10.04, 2.10, 1.50, 2.10, C.line, 2);
  connector(s, 1.50, 2.10, 1.50, 2.64, C.line, 2);
  text(s, '如果是 Spec 错了：先回到人类决策，再更新 OpenSpec。', 1.44, 6.20, 10.44, 0.28, { fontSize: 15, color: C.orange, bold: true, align: 'center' });
  footer(s, 'REWORK  /  EVIDENCE → CODE FIX → NEW SHA → RECHECK');
  note(s, '这是独立验收真正产生价值的地方：失败不是终点，而是带证据的返工入口。', 'docs/ai-coding-harness-development-workflow.md；.qoder/skills/verification-before-completion/SKILL.md');
}

// 12 Archive
{
  const s = pptx.addSlide();
  s.background = { color: C.bg };
  header(s, '11 / ARCHIVE', '完成不是“代码能跑”，而是上下文被收口', '归档把这次变更的决策、实现、测试和验收证据保存下来。', '12');
  rect(s, 0.84, 2.26, 5.02, 3.94, C.panel2, C.cyan);
  text(s, '归档前的门禁', 1.22, 2.64, 1.64, 0.24, { fontSize: 14, color: C.cyan, bold: true });
  const gates = ['tasks 全部完成', 'Codex 测试全绿', 'Claude acceptance PASS', 'delta spec 已同步', 'backend / frontend 子仓已提交', '父仓已 bump 指针'];
  gates.forEach((g, i) => {
    const yy = 3.16 + i * 0.44;
    circle(s, 1.24, yy + 0.06, 0.18, C.green, C.green, 0);
    text(s, '✓', 1.24, yy + 0.09, 0.18, 0.10, { fontSize: 8, color: C.bg, bold: true, align: 'center' });
    text(s, g, 1.60, yy, 3.64, 0.20, { fontSize: 12.5, color: C.text });
  });

  rect(s, 6.48, 2.26, 5.44, 3.94, C.panel, C.green);
  text(s, '最终上下文', 6.86, 2.64, 1.56, 0.24, { fontSize: 14, color: C.green, bold: true });
  text(s, 'openspec/changes/archive/', 6.86, 3.18, 3.82, 0.24, { fontFace: MONO, fontSize: 13, color: C.text, fit: 'shrink' });
  text(s, 'proposal.md\nspecs/\ndesign.md\ntasks.md\nacceptance.md', 6.86, 3.72, 2.44, 1.46, { fontFace: MONO, fontSize: 14, color: C.muted, valign: 'top' });
  text(s, '这份目录回答：\n为什么做、怎么做、做了什么、如何证明。', 9.40, 3.76, 1.86, 0.90, { fontSize: 12.5, color: C.orange, valign: 'top' });
  rect(s, 0.86, 6.48, 11.02, 0.30, C.panel, C.orange);
  text(s, 'Prompt 让 AI 开始，Harness 让项目知道下一次为什么可以继续。', 1.16, 6.54, 10.42, 0.16, { fontSize: 12.5, color: C.orange, bold: true, align: 'center' });
  footer(s, 'ARCHIVE  /  PRESERVE THE REASONING, NOT ONLY THE PATCH');
  note(s, '收尾时把 acceptance.md 一起归档，让未来的 Codex 或 Claude 看到完整的决策和证据，而不是只看到最后一版代码。', 'docs/ai-coding-harness-development-workflow.md；.qoder/commands/opsx/archive.md；AGENTS.md');
}

const outDir = path.resolve(process.cwd(), '..', 'artifacts');
mkdirSync(outDir, { recursive: true });
const output = path.join(outDir, 'ai-coding-harness-brownfield-workflow.pptx');
await pptx.writeFile({ fileName: output, compression: true });
console.log(output);
