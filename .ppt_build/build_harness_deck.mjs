import pptxgen from 'pptxgenjs';
import path from 'node:path';
import { mkdirSync } from 'node:fs';

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'Codex';
pptx.company = 'OpenAI';
pptx.subject = 'AI Coding Harness 教学';
pptx.title = 'AI Coding Harness：从 README 读懂开发思路';
pptx.lang = 'zh-CN';
pptx.theme = {
  headFontFace: 'Microsoft YaHei',
  bodyFontFace: 'Microsoft YaHei',
  lang: 'zh-CN',
};
pptx.defineLayout({ name: 'WIDE_CUSTOM', width: 13.333, height: 7.5 });
pptx.layout = 'WIDE_CUSTOM';

const W = 13.333;
const H = 7.5;
const C = {
  bg: '0B1324',
  panel: '121F36',
  panel2: '172B49',
  panel3: '1E385B',
  text: 'F4F7FB',
  muted: 'AFC0D9',
  dim: '7890AF',
  line: '294260',
  cyan: '5CE1E6',
  blue: '63A7FF',
  orange: 'FFB454',
  green: '74D6A2',
  pink: 'FF7A8A',
  white: 'FFFFFF',
};
const FONT = 'Microsoft YaHei';

function shape(slide, type, x, y, w, h, fill, line = fill, extra = {}) {
  slide.addShape(type, {
    x, y, w, h,
    fill: { color: fill, transparency: extra.fillTransparency ?? 0 },
    line: { color: line, transparency: extra.lineTransparency ?? 0, width: extra.lineWidth ?? 1 },
    radius: extra.radius,
    ...extra,
  });
}

function txt(slide, text, x, y, w, h, opts = {}) {
  slide.addText(text, {
    x, y, w, h,
    fontFace: opts.fontFace || FONT,
    fontSize: opts.fontSize ?? 16,
    color: opts.color || C.text,
    bold: opts.bold || false,
    italic: opts.italic || false,
    align: opts.align || 'left',
    valign: opts.valign || 'mid',
    margin: opts.margin ?? 0,
    breakLine: false,
    fit: opts.fit || 'shrink',
    paraSpaceAfterPt: opts.paraSpaceAfterPt,
    charSpacing: opts.charSpacing,
    transparency: opts.transparency,
    isTextBox: true,
  });
}

function line(slide, x1, y1, x2, y2, color = C.line, width = 1.5, dash = 'solid') {
  slide.addShape(pptx.ShapeType.line, {
    x: x1,
    y: y1,
    w: x2 - x1,
    h: y2 - y1,
    line: { color, width, dashType: dash, beginArrowType: 'none', endArrowType: 'none' },
  });
}

function chevron(slide, x, y, w = 0.28, h = 0.5, color = C.line) {
  shape(slide, pptx.ShapeType.chevron, x, y, w, h, color, color, { lineWidth: 0 });
}

function roundPanel(slide, x, y, w, h, fill = C.panel, stroke = C.line, radius = 0.12) {
  shape(slide, pptx.ShapeType.roundRect, x, y, w, h, fill, stroke, { radius, lineWidth: 1 });
}

function circle(slide, x, y, d, fill, stroke = fill, lineWidth = 1) {
  shape(slide, pptx.ShapeType.ellipse, x, y, d, d, fill, stroke, { lineWidth });
}

function pill(slide, label, x, y, w, color, fill = C.panel2) {
  roundPanel(slide, x, y, w, 0.34, fill, color, 0.16);
  txt(slide, label, x, y + 0.01, w, 0.30, { fontSize: 10.5, color, bold: true, align: 'center' });
}

function header(slide, eyebrow, title, subtitle = '', no = '') {
  txt(slide, eyebrow.toUpperCase(), 0.62, 0.35, 4.0, 0.24, { fontSize: 10, color: C.cyan, bold: true, charSpacing: 1.3 });
  txt(slide, title, 0.62, 0.72, 11.0, 0.52, { fontSize: 25, bold: true, color: C.text });
  if (subtitle) txt(slide, subtitle, 0.64, 1.32, 11.4, 0.32, { fontSize: 12.5, color: C.muted });
  line(slide, 0.62, 1.78, 12.70, 1.78, C.line, 1);
  txt(slide, no, 12.1, 0.35, 0.62, 0.24, { fontSize: 10, color: C.dim, align: 'right' });
}

function footer(slide, text = 'AI CODING HARNESS  /  READ THE README AS A SYSTEM MAP') {
  line(slide, 0.62, 7.10, 12.70, 7.10, C.line, 0.8);
  txt(slide, text, 0.62, 7.17, 8.8, 0.16, { fontSize: 8.5, color: C.dim, charSpacing: 0.6 });
}

function notes(slide, source, body) {
  slide.addNotes(`讲解提示：${body}\n\n来源：${source}`);
}

// 01 Cover
{
  const slide = pptx.addSlide();
  slide.background = { color: C.bg };
  txt(slide, 'AI CODING × SPEC-DRIVEN', 0.72, 0.70, 4.2, 0.28, { fontSize: 11, color: C.cyan, bold: true, charSpacing: 1.5 });
  txt(slide, 'AI Coding\nHarness', 0.72, 1.22, 6.6, 1.55, { fontSize: 39, bold: true, color: C.text, valign: 'top' });
  txt(slide, '从项目 README 读懂：\n如何让 AI 按工程流程持续工作', 0.76, 3.08, 5.8, 0.82, { fontSize: 20, color: C.muted, valign: 'top' });
  pill(slide, 'Harness', 0.76, 4.44, 1.25, C.cyan);
  pill(slide, 'OpenSpec', 2.14, 4.44, 1.42, C.blue);
  pill(slide, 'Superpowers', 3.70, 4.44, 1.58, C.orange);
  txt(slide, '学习目标：看懂“约束 → 产物 → 反馈”的开发闭环', 0.76, 5.35, 5.7, 0.32, { fontSize: 13, color: C.dim });

  roundPanel(slide, 8.02, 0.92, 4.58, 5.66, C.panel, C.line);
  txt(slide, 'README 的隐藏主线', 8.42, 1.34, 3.7, 0.3, { fontSize: 12, color: C.muted, bold: true });
  txt(slide, '把 AI 放进一套\n可复用的工程系统', 8.42, 1.80, 3.55, 0.9, { fontSize: 24, color: C.text, bold: true, valign: 'top' });
  const nodes = [
    { y: 3.18, label: '意图', sub: '我想解决什么问题？', color: C.cyan },
    { y: 4.18, label: '约束', sub: '什么必须先发生？', color: C.blue },
    { y: 5.18, label: '反馈', sub: '如何证明它真的完成？', color: C.orange },
  ];
  nodes.forEach((n, i) => {
    circle(slide, 8.48, n.y, 0.40, n.color, n.color, 0);
    txt(slide, String(i + 1), 8.48, n.y + 0.02, 0.40, 0.35, { fontSize: 12, color: C.bg, bold: true, align: 'center' });
    txt(slide, n.label, 9.10, n.y - 0.01, 0.76, 0.28, { fontSize: 15, color: n.color, bold: true });
    txt(slide, n.sub, 9.86, n.y, 2.25, 0.24, { fontSize: 11, color: C.muted });
    if (i < nodes.length - 1) line(slide, 8.68, n.y + 0.40, 8.68, n.y + 0.98, C.line, 1.5);
  });
  txt(slide, '教学版 · 仅聚焦 Harness 思路', 8.42, 6.17, 3.3, 0.20, { fontSize: 10, color: C.dim });
  txt(slide, '01', 12.05, 0.70, 0.56, 0.22, { fontSize: 10, color: C.dim, align: 'right' });
  footer(slide, 'AI CODING HARNESS  /  A TEACHING DECK');
  notes(slide, 'README.md；AGENTS.md', '先告诉听众本 PPT 的范围：不讲业务功能，只把 README 当成一张 AI coding 工作流地图。');
}

// 02 Problem
{
  const slide = pptx.addSlide();
  slide.background = { color: C.bg };
  header(slide, '01 / WHY', '先读懂这份 README 在解决什么问题', '核心问题不是“AI 会不会写代码”，而是“AI 能不能持续地写对代码”。', '02');

  roundPanel(slide, 0.72, 2.24, 5.02, 3.88, C.panel2, C.line);
  txt(slide, '问题的本质', 1.10, 2.58, 1.5, 0.26, { fontSize: 12, color: C.cyan, bold: true });
  txt(slide, '一次生成，\n不等于持续交付', 1.10, 3.08, 3.85, 0.94, { fontSize: 28, color: C.text, bold: true, valign: 'top' });
  txt(slide, 'AI coding 的难点会在第二次、第三次迭代出现：\n上下文丢失、边界漂移、流程被跳过、完成标准模糊。', 1.10, 4.46, 4.08, 0.74, { fontSize: 14, color: C.muted, valign: 'top' });
  pill(slide, '持续迭代', 1.10, 5.54, 1.18, C.orange, C.bg);
  pill(slide, '可审阅', 2.46, 5.54, 1.08, C.green, C.bg);
  pill(slide, '可验证', 3.72, 5.54, 1.08, C.green, C.bg);

  txt(slide, '从“裸模型”到“受治理的 AI 工作流”', 6.30, 2.34, 5.7, 0.26, { fontSize: 14, color: C.muted, bold: true });
  roundPanel(slide, 6.32, 2.82, 2.58, 2.46, C.panel, C.line);
  txt(slide, '裸模型', 6.72, 3.16, 1.2, 0.3, { fontSize: 20, color: C.pink, bold: true });
  txt(slide, '“帮我加一个功能”', 6.72, 3.72, 1.8, 0.28, { fontSize: 13, color: C.text });
  txt(slide, '结果依赖当下上下文\n过程不容易复盘', 6.72, 4.22, 1.72, 0.58, { fontSize: 12, color: C.muted, valign: 'top' });
  chevron(slide, 9.20, 3.74, 0.42, 0.62, C.cyan);
  roundPanel(slide, 9.82, 2.82, 2.58, 2.46, C.panel, C.cyan);
  txt(slide, 'Harness', 10.22, 3.16, 1.5, 0.3, { fontSize: 20, color: C.cyan, bold: true });
  txt(slide, '“先对齐，再实现”', 10.22, 3.72, 1.82, 0.28, { fontSize: 13, color: C.text });
  txt(slide, '规则约束行为\n产物留下证据\n测试提供反馈', 10.22, 4.22, 1.80, 0.72, { fontSize: 12, color: C.muted, valign: 'top' });
  txt(slide, '一句话：Harness 把“写代码”变成“在流程里交付代码”。', 6.32, 5.78, 5.9, 0.28, { fontSize: 14, color: C.orange, bold: true });
  footer(slide);
  notes(slide, 'README.md；AGENTS.md “三层架构”与“硬规则”', '把 Harness 讲成持续迭代的稳定器：它不替代模型能力，而是把模型放进可以复盘、审阅、验证的路径。');
}

// 03 Mental model
{
  const slide = pptx.addSlide();
  slide.background = { color: C.bg };
  header(slide, '02 / MENTAL MODEL', 'Harness = 给模型加上可执行的上下文', '它不是更长的 prompt，而是一组持久化的规则、入口、方法与反馈。', '03');

  roundPanel(slide, 0.78, 2.30, 3.15, 3.90, C.panel2, C.line);
  txt(slide, '持久化输入', 1.16, 2.68, 1.52, 0.26, { fontSize: 12, color: C.cyan, bold: true });
  const inputItems = [
    ['Rules', '什么不能违反'],
    ['Commands', '从哪里开始'],
    ['Skills', '如何做得稳定'],
    ['Agents', '谁负责判断'],
  ];
  inputItems.forEach((it, i) => {
    const yy = 3.20 + i * 0.62;
    circle(slide, 1.17, yy + 0.04, 0.24, [C.cyan, C.blue, C.orange, C.green][i], [C.cyan, C.blue, C.orange, C.green][i], 0);
    txt(slide, it[0], 1.58, yy - 0.01, 1.14, 0.23, { fontSize: 13.5, color: C.text, bold: true });
    txt(slide, it[1], 2.66, yy, 0.96, 0.22, { fontSize: 10.5, color: C.muted, align: 'right' });
  });
  txt(slide, '它们都能被提交、审阅、复用。', 1.16, 5.74, 2.32, 0.23, { fontSize: 11, color: C.dim });

  // Model core
  roundPanel(slide, 4.45, 2.30, 4.40, 3.90, C.panel, C.cyan);
  circle(slide, 5.70, 3.28, 1.92, C.panel3, C.cyan, 2);
  txt(slide, 'MODEL', 5.90, 3.76, 1.52, 0.28, { fontSize: 15, color: C.cyan, bold: true, align: 'center' });
  txt(slide, '生成与推理能力', 5.58, 4.18, 2.14, 0.24, { fontSize: 11, color: C.muted, align: 'center' });
  txt(slide, 'Harness 提供方向\n模型提供能力', 4.96, 5.16, 3.38, 0.56, { fontSize: 18, color: C.text, bold: true, align: 'center', valign: 'top' });
  line(slide, 3.93, 4.24, 4.45, 4.24, C.cyan, 2);
  chevron(slide, 4.18, 3.99, 0.26, 0.50, C.cyan);

  // Feedback side
  roundPanel(slide, 9.38, 2.30, 3.18, 3.90, C.panel2, C.line);
  txt(slide, '输出与反馈', 9.78, 2.68, 1.52, 0.26, { fontSize: 12, color: C.orange, bold: true });
  const feedback = [
    ['Repo', '真实代码与变更'],
    ['Tests', '失败 / 通过'],
    ['Review', '人类判断与纠偏'],
  ];
  feedback.forEach((it, i) => {
    const yy = 3.32 + i * 0.76;
    roundPanel(slide, 9.78, yy, 2.40, 0.48, C.bg, C.line);
    txt(slide, it[0], 9.98, yy + 0.07, 0.72, 0.22, { fontSize: 12.5, color: C.text, bold: true });
    txt(slide, it[1], 10.70, yy + 0.08, 1.28, 0.20, { fontSize: 10.5, color: C.muted, align: 'right' });
  });
  line(slide, 8.85, 4.24, 9.38, 4.24, C.orange, 2);
  chevron(slide, 9.08, 3.99, 0.26, 0.50, C.orange);
  txt(slide, '下一轮上下文', 9.78, 5.78, 2.12, 0.24, { fontSize: 12, color: C.orange, bold: true });
  footer(slide);
  notes(slide, 'AGENTS.md；.qoder/rules；.qoder/commands；.qoder/skills；.qoder/agents', '强调四个持久化输入，以及代码、测试、review 如何把真实世界反馈送回下一轮。');
}

// 04 Anatomy
{
  const slide = pptx.addSlide();
  slide.background = { color: C.bg };
  header(slide, '03 / ANATOMY', '仓库里的 Harness 拆成 5 类零件', '读 `.qoder/` 时，不要只看文件名；要看每类文件在工作流中扮演什么角色。', '04');

  roundPanel(slide, 0.76, 2.22, 1.96, 3.98, C.panel2, C.cyan);
  txt(slide, '.qoder/', 1.08, 2.72, 1.30, 0.38, { fontSize: 25, color: C.cyan, bold: true });
  txt(slide, 'Harness\n工作区', 1.08, 3.46, 1.18, 0.70, { fontSize: 22, color: C.text, bold: true, valign: 'top' });
  txt(slide, '让“应该怎么工作”\n成为仓库的一部分', 1.08, 5.12, 1.26, 0.54, { fontSize: 11, color: C.muted, valign: 'top' });

  const cols = [
    { x: 3.02, color: C.cyan, key: '01', title: 'Rules', path: '.qoder/rules/', desc: '持续生效的边界', ex: '先 spec\n再 code' },
    { x: 4.96, color: C.blue, key: '02', title: 'Commands', path: '.qoder/commands/', desc: '工作流入口', ex: '/opsx:propose\n/opsx:apply' },
    { x: 6.90, color: C.orange, key: '03', title: 'Skills', path: '.qoder/skills/', desc: '可复用的方法', ex: 'TDD\nReview' },
    { x: 8.84, color: C.green, key: '04', title: 'Agents', path: '.qoder/agents/', desc: '角色与判断', ex: 'PM\nSpec reviewer' },
    { x: 10.78, color: C.pink, key: '05', title: 'AGENTS.md', path: './AGENTS.md', desc: '仓库级总契约', ex: '拓扑\n硬规则' },
  ];
  cols.forEach((c) => {
    roundPanel(slide, c.x, 2.22, 1.70, 3.98, C.panel, c.color);
    circle(slide, c.x + 0.18, 2.58, 0.32, c.color, c.color, 0);
    txt(slide, c.key, c.x + 0.18, 2.61, 0.32, 0.20, { fontSize: 9, color: C.bg, bold: true, align: 'center' });
    txt(slide, c.title, c.x + 0.18, 3.16, 1.34, 0.36, { fontSize: 17, color: c.color, bold: true });
    txt(slide, c.path, c.x + 0.18, 3.72, 1.30, 0.28, { fontSize: 9.5, color: C.dim, fit: 'shrink' });
    line(slide, c.x + 0.18, 4.18, c.x + 1.48, 4.18, C.line, 1);
    txt(slide, c.desc, c.x + 0.18, 4.48, 1.30, 0.40, { fontSize: 12, color: C.text, bold: true, valign: 'top' });
    txt(slide, c.ex, c.x + 0.18, 5.28, 1.30, 0.48, { fontSize: 11, color: C.muted, valign: 'top' });
  });
  txt(slide, '判断顺序：先找总契约，再找入口，最后追到具体方法。', 3.02, 6.48, 8.6, 0.24, { fontSize: 13.5, color: C.orange, bold: true });
  footer(slide);
  notes(slide, 'AGENTS.md “三层架构”与“快速入口”；.qoder/ 目录', '用这张图建立阅读顺序：AGENTS.md 给总规则，rules/commands/skills/agents 各自补齐行为、入口、方法、角色。');
}

// 05 Layers
{
  const slide = pptx.addSlide();
  slide.background = { color: C.bg };
  header(slide, '04 / ARCHITECTURE', '三层分工：管规则、管产物、管方法', 'Harness、OpenSpec、Superpowers 不是三个口号，而是三种不同的稳定性来源。', '05');

  const rows = [
    { y: 2.30, color: C.cyan, name: 'Harness', q: '管行为边界', desc: '让 agent 知道“必须遵守什么、从哪里开始、谁来判断”。', ex: 'AGENTS.md  ·  rules  ·  commands  ·  agents' },
    { y: 3.64, color: C.blue, name: 'OpenSpec', q: '管持久化产物', desc: '让需求从一句话变成可讨论、可追踪、可复盘的文档证据。', ex: 'proposal.md  →  design.md  →  tasks.md' },
    { y: 4.98, color: C.orange, name: 'Superpowers', q: '管执行方法', desc: '让实现动作有套路：先想清楚、先写测试、再实现、再验证。', ex: 'brainstorming  ·  TDD  ·  review  ·  verification' },
  ];
  rows.forEach((r) => {
    roundPanel(slide, 0.86, r.y, 11.62, 1.06, C.panel, r.color);
    roundPanel(slide, 1.08, r.y + 0.21, 1.54, 0.62, r.color, r.color);
    txt(slide, r.name, 1.08, r.y + 0.28, 1.54, 0.25, { fontSize: 16, color: C.bg, bold: true, align: 'center' });
    txt(slide, r.q, 3.00, r.y + 0.20, 1.66, 0.24, { fontSize: 13, color: r.color, bold: true });
    txt(slide, r.desc, 3.00, r.y + 0.48, 5.35, 0.26, { fontSize: 12.5, color: C.text });
    txt(slide, r.ex, 8.72, r.y + 0.34, 3.38, 0.24, { fontSize: 10.5, color: C.muted, align: 'right', fit: 'shrink' });
  });
  txt(slide, '组合后的效果', 0.90, 6.38, 1.52, 0.24, { fontSize: 12, color: C.green, bold: true });
  txt(slide, '每次行动都有：输入约束  →  中间产物  →  验收反馈', 2.62, 6.38, 7.70, 0.24, { fontSize: 16, color: C.text, bold: true });
  circle(slide, 10.92, 6.22, 0.38, C.green, C.green, 0);
  txt(slide, '✓', 10.92, 6.26, 0.38, 0.24, { fontSize: 15, color: C.bg, bold: true, align: 'center' });
  footer(slide);
  notes(slide, 'AGENTS.md “三层架构”；.qoder/skills/；openspec/', '这页是概念分层：Harness 管行为，OpenSpec 管证据，Superpowers 管动作。三层叠加才形成完整的 AI coding harness。');
}

// 06 OpenSpec artifacts
{
  const slide = pptx.addSlide();
  slide.background = { color: C.bg };
  header(slide, '05 / OPENSPEC', 'OpenSpec：把一句需求拆成三种可审阅的证据', '先对齐“为什么 / 怎么做 / 先做什么”，再让 AI 进入代码区。', '06');

  const docs = [
    { x: 0.88, color: C.cyan, tag: '01', title: 'proposal.md', q: '为什么做？', lines: ['问题是什么？', '范围是什么？', '价值是什么？'], foot: '决策入口' },
    { x: 4.52, color: C.blue, tag: '02', title: 'design.md', q: '怎么做？', lines: ['方案怎么落地？', '边界在哪里？', '有哪些取舍？'], foot: '设计证据' },
    { x: 8.16, color: C.orange, tag: '03', title: 'tasks.md', q: '先做什么？', lines: ['步骤怎么拆？', '每步怎么验收？', '完成如何勾选？'], foot: '执行清单' },
  ];
  docs.forEach((d, i) => {
    roundPanel(slide, d.x, 2.34, 3.02, 3.40, C.panel, d.color);
    circle(slide, d.x + 0.34, 2.70, 0.38, d.color, d.color, 0);
    txt(slide, d.tag, d.x + 0.34, 2.75, 0.38, 0.20, { fontSize: 10, color: C.bg, bold: true, align: 'center' });
    txt(slide, d.title, d.x + 0.88, 2.70, 1.78, 0.30, { fontSize: 17, color: d.color, bold: true });
    txt(slide, d.q, d.x + 0.34, 3.34, 2.2, 0.36, { fontSize: 20, color: C.text, bold: true });
    d.lines.forEach((t, j) => {
      circle(slide, d.x + 0.38, 4.08 + j * 0.40, 0.12, d.color, d.color, 0);
      txt(slide, t, d.x + 0.64, 4.02 + j * 0.40, 1.92, 0.22, { fontSize: 12, color: C.muted });
    });
    line(slide, d.x + 0.34, 5.28, d.x + 2.68, 5.28, C.line, 1);
    txt(slide, d.foot, d.x + 0.34, 5.42, 2.24, 0.20, { fontSize: 10.5, color: d.color, bold: true });
    if (i < docs.length - 1) {
      chevron(slide, d.x + 3.22, 3.76, 0.32, 0.56, C.line);
    }
  });
  roundPanel(slide, 0.88, 6.12, 10.30, 0.58, C.panel2, C.orange);
  txt(slide, '人类签字', 1.16, 6.27, 1.12, 0.22, { fontSize: 13, color: C.orange, bold: true });
  txt(slide, 'proposal / design / tasks 对齐后，才进入实现阶段。', 2.62, 6.27, 6.84, 0.22, { fontSize: 13, color: C.text });
  txt(slide, '阻止“直接开写”', 9.52, 6.27, 1.36, 0.22, { fontSize: 11, color: C.orange, bold: true, align: 'right' });
  footer(slide);
  notes(slide, 'AGENTS.md “硬规则 1”；.qoder/commands/opsx/propose.md；openspec/config.yaml', '把三份文档讲成三个审阅点：先审问题，再审方案，再审执行。人类签字是从想法进入实现的闸门。');
}

// 07 Workflow
{
  const slide = pptx.addSlide();
  slide.background = { color: C.bg };
  header(slide, '06 / LOOP', '从想法到归档：完整闭环', '这条链路的价值是：每一步都有可见产物，每一个跳步都更容易被发现。', '07');

  const steps = [
    { x: 0.72, color: C.cyan, num: '1', title: 'Idea', sub: '一句需求' },
    { x: 2.70, color: C.blue, num: '2', title: '/opsx:propose', sub: '产出三份 spec' },
    { x: 4.68, color: C.orange, num: '3', title: 'Sign-off', sub: '人类确认' },
    { x: 6.66, color: C.blue, num: '4', title: '/opsx:apply', sub: '按 tasks 执行' },
    { x: 8.64, color: C.green, num: '5', title: 'TDD + review', sub: '反馈与验收' },
    { x: 10.62, color: C.cyan, num: '6', title: '/opsx:archive', sub: '收口留痕' },
  ];
  line(slide, 1.08, 3.32, 11.92, 3.32, C.line, 2);
  steps.forEach((s, i) => {
    circle(slide, s.x + 0.38, 2.93, 0.78, s.color, s.color, 0);
    txt(slide, s.num, s.x + 0.38, 3.12, 0.78, 0.25, { fontSize: 18, color: C.bg, bold: true, align: 'center' });
    txt(slide, s.title, s.x, 4.02, 1.58, 0.32, { fontSize: 14.5, color: s.color, bold: true, align: 'center' });
    txt(slide, s.sub, s.x, 4.50, 1.58, 0.26, { fontSize: 11, color: C.muted, align: 'center' });
    if (i < steps.length - 1) chevron(slide, s.x + 1.72, 3.08, 0.25, 0.48, C.line);
  });
  roundPanel(slide, 0.88, 5.55, 3.66, 0.82, C.panel2, C.cyan);
  txt(slide, '决策点', 1.18, 5.79, 0.72, 0.22, { fontSize: 12, color: C.cyan, bold: true });
  txt(slide, '什么时候可以从 spec 进入 code？', 2.12, 5.79, 2.02, 0.22, { fontSize: 12, color: C.text });
  roundPanel(slide, 4.82, 5.55, 3.66, 0.82, C.panel2, C.orange);
  txt(slide, '反馈点', 5.12, 5.79, 0.72, 0.22, { fontSize: 12, color: C.orange, bold: true });
  txt(slide, '失败测试如何改变下一步？', 6.06, 5.79, 2.04, 0.22, { fontSize: 12, color: C.text });
  roundPanel(slide, 8.76, 5.55, 3.66, 0.82, C.panel2, C.green);
  txt(slide, '收口点', 9.06, 5.79, 0.72, 0.22, { fontSize: 12, color: C.green, bold: true });
  txt(slide, '完成后的上下文如何保存？', 10.00, 5.79, 2.06, 0.22, { fontSize: 12, color: C.text });
  footer(slide);
  notes(slide, 'AGENTS.md “第一次使用”；.qoder/commands/opsx/{propose,apply,archive}.md；.qoder/rules/spec-driven-workflow.md', '带着听众完整走一遍命令链路：propose 生成证据，sign-off 设置闸门，apply 执行，TDD/review 提供反馈，archive 完成收口。');
}

// 08 TDD feedback
{
  const slide = pptx.addSlide();
  slide.background = { color: C.bg };
  header(slide, '07 / FEEDBACK', '为什么 TDD 是 AI coding 的关键反馈回路', '对 AI 来说，测试不是收尾检查，而是下一轮上下文。', '08');

  roundPanel(slide, 0.78, 2.24, 4.52, 3.96, C.panel2, C.orange);
  txt(slide, 'RED → GREEN → REFACTOR', 1.16, 2.62, 3.76, 0.28, { fontSize: 14, color: C.orange, bold: true, charSpacing: 0.5 });
  const loop = [
    { x: 1.28, y: 3.56, color: C.pink, label: 'RED', sub: '先看到失败' },
    { x: 2.58, y: 4.54, color: C.green, label: 'GREEN', sub: '最小实现' },
    { x: 3.86, y: 3.56, color: C.blue, label: 'REFACTOR', sub: '整理结构' },
  ];
  loop.forEach((n) => {
    circle(slide, n.x, n.y, 0.88, n.color, n.color, 0);
    txt(slide, n.label, n.x - 0.06, n.y + 0.28, 1.00, 0.22, { fontSize: 11, color: C.bg, bold: true, align: 'center' });
    txt(slide, n.sub, n.x - 0.16, n.y + 1.04, 1.20, 0.22, { fontSize: 10.5, color: C.muted, align: 'center' });
  });
  line(slide, 2.10, 4.00, 2.58, 4.78, C.line, 1.8);
  line(slide, 3.46, 4.78, 3.96, 4.00, C.line, 1.8);
  line(slide, 4.48, 3.56, 2.16, 3.56, C.line, 1.8);
  txt(slide, '失败不是阻塞\n而是导航', 1.44, 5.56, 3.24, 0.42, { fontSize: 17, color: C.text, bold: true, align: 'center', valign: 'top' });

  txt(slide, '没有反馈时', 5.90, 2.52, 2.16, 0.28, { fontSize: 14, color: C.pink, bold: true });
  txt(slide, '有反馈时', 9.42, 2.52, 2.16, 0.28, { fontSize: 14, color: C.green, bold: true });
  const compares = [
    ['假设', '实现漂移', '测试暴露边界'],
    ['修改', '越改越大', '保持最小增量'],
    ['完成', '“看起来可以”', '有证据可以继续'],
  ];
  compares.forEach((r, i) => {
    const yy = 3.06 + i * 0.86;
    line(slide, 5.90, yy + 0.58, 12.22, yy + 0.58, C.line, 0.8);
    txt(slide, r[0], 5.90, yy + 0.08, 0.76, 0.22, { fontSize: 12, color: C.muted, bold: true });
    txt(slide, r[1], 6.86, yy + 0.08, 1.98, 0.22, { fontSize: 12, color: C.text });
    txt(slide, r[2], 9.42, yy + 0.08, 2.74, 0.22, { fontSize: 12, color: C.green, bold: true });
  });
  txt(slide, 'Harness 的关键不是让 AI 永远不犯错，而是让错误尽早、清晰、可修复地出现。', 5.90, 5.92, 6.32, 0.34, { fontSize: 13.5, color: C.orange, bold: true });
  footer(slide);
  notes(slide, '.qoder/skills/test-driven-development/SKILL.md；AGENTS.md “TDD 不可绕过”', '强调 TDD 在 AI 工作流中承担“可执行反馈”的角色：RED 暴露假设，GREEN 限制修改，REFACTOR 控制长期质量。');
}

// 09 Exercise
{
  const slide = pptx.addSlide();
  slide.background = { color: C.bg };
  header(slide, '08 / PRACTICE', '用一个小练习把 Harness 读出来', '练习目标：不写业务代码，只观察流程如何约束 AI。', '09');

  roundPanel(slide, 0.78, 2.26, 4.18, 3.98, C.panel2, C.cyan);
  txt(slide, '练习题', 1.16, 2.62, 1.10, 0.24, { fontSize: 12, color: C.cyan, bold: true });
  txt(slide, '为项目加一个\nhello-cli 命令', 1.16, 3.10, 3.12, 0.78, { fontSize: 27, color: C.text, bold: true, valign: 'top' });
  txt(slide, '你不需要真的实现它。\n只追踪：流程先要求你写什么？\n什么时刻才允许碰代码？', 1.16, 4.44, 3.16, 0.86, { fontSize: 14, color: C.muted, valign: 'top' });
  pill(slide, '只读流程', 1.16, 5.72, 1.20, C.orange, C.bg);
  pill(slide, '不改代码', 2.54, 5.72, 1.20, C.green, C.bg);

  const acts = [
    ['1', '写一句 idea', '不要直接让 AI 开写'],
    ['2', '运行 propose', '看 change 目录出现什么'],
    ['3', '读三份 spec', '分别回答 why / how / next'],
    ['4', '模拟 sign-off', '找出人工决策点'],
    ['5', '追 TDD 反馈', '观察失败如何回流'],
    ['6', '最后 archive', '看上下文如何收口'],
  ];
  acts.forEach((a, i) => {
    const yy = 2.30 + i * 0.62;
    circle(slide, 5.48, yy + 0.05, 0.28, i === 3 ? C.orange : C.blue, i === 3 ? C.orange : C.blue, 0);
    txt(slide, a[0], 5.48, yy + 0.10, 0.28, 0.15, { fontSize: 9.5, color: C.bg, bold: true, align: 'center' });
    txt(slide, a[1], 5.98, yy, 1.76, 0.23, { fontSize: 13.5, color: C.text, bold: true });
    txt(slide, a[2], 7.92, yy + 0.01, 3.46, 0.22, { fontSize: 11.5, color: C.muted });
    if (i < acts.length - 1) line(slide, 5.62, yy + 0.35, 5.62, yy + 0.62, C.line, 1);
  });
  roundPanel(slide, 5.34, 6.16, 6.90, 0.56, C.panel, C.orange);
  txt(slide, '观察问题：谁决定？什么留下？反馈从哪里回来？', 5.72, 6.33, 6.12, 0.20, { fontSize: 13, color: C.orange, bold: true, align: 'center' });
  footer(slide);
  notes(slide, 'AGENTS.md “第一次使用”；.qoder/commands/opsx；openspec/changes/', '让学习者把流程当成实验对象：不追求实现 hello-cli，而是观察每个命令如何生成上下文、设置闸门和留下证据。');
}

// 10 Summary
{
  const slide = pptx.addSlide();
  slide.background = { color: C.bg };
  header(slide, '09 / TAKEAWAY', '带走这张地图', '看完 README，你应该能回答：输入是什么？约束是什么？验收证据是什么？', '10');

  roundPanel(slide, 0.86, 2.24, 11.60, 1.22, C.panel2, C.cyan);
  txt(slide, 'Prompt 让 AI 开始；', 1.24, 2.59, 3.54, 0.34, { fontSize: 24, color: C.muted, bold: true });
  txt(slide, 'Harness 让 AI 稳定地继续。', 5.02, 2.59, 6.54, 0.34, { fontSize: 24, color: C.cyan, bold: true });

  txt(slide, '推荐阅读顺序', 0.90, 4.10, 1.74, 0.24, { fontSize: 13, color: C.orange, bold: true });
  const read = [
    ['01', 'README.md', '先看项目的总叙事'],
    ['02', 'AGENTS.md', '确认拓扑与硬规则'],
    ['03', '.qoder/rules', '找到持续性约束'],
    ['04', '.qoder/commands/opsx', '看工作流入口'],
    ['05', '.qoder/skills', '追执行方法与反馈'],
  ];
  read.forEach((r, i) => {
    const x = 0.90 + i * 2.40;
    circle(slide, x, 4.72, 0.38, [C.cyan, C.blue, C.orange, C.green, C.pink][i], [C.cyan, C.blue, C.orange, C.green, C.pink][i], 0);
    txt(slide, r[0], x, 4.82, 0.38, 0.18, { fontSize: 9, color: C.bg, bold: true, align: 'center' });
    txt(slide, r[1], x - 0.04, 5.36, 1.86, 0.26, { fontSize: 13, color: C.text, bold: true });
    txt(slide, r[2], x - 0.04, 5.74, 1.86, 0.34, { fontSize: 10.5, color: C.muted, valign: 'top' });
  });
  roundPanel(slide, 0.90, 6.44, 11.54, 0.42, C.panel, C.line);
  txt(slide, '目标不是自动化一切，而是把不确定性放进可检查的流程里。', 1.20, 6.54, 10.94, 0.20, { fontSize: 13, color: C.text, bold: true, align: 'center' });
  footer(slide, 'AI CODING HARNESS  /  START WITH THE SYSTEM, THEN STUDY THE CODE');
  notes(slide, 'README.md；AGENTS.md；.qoder/rules；.qoder/commands/opsx；.qoder/skills', '最后回收三问：输入是什么、约束是什么、验收证据是什么。把“看懂 Harness”转成一套可迁移的阅读方法。');
}

const outDir = path.resolve(process.cwd(), '..', 'artifacts');
mkdirSync(outDir, { recursive: true });
const output = path.join(outDir, 'ai-coding-harness-teaching.pptx');
await pptx.writeFile({ fileName: output, compression: true });
console.log(output);
