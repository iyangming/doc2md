# Document to Markdown 转换系统设计

**日期**：2026-05-14
**更新**：2026-05-19（新增 Web 前端）
**状态**：已实现

---

## 1. 概述

**项目名称**：doc2md
**功能**：将 Word、PDF、PPT、Excel 文档转换为 Markdown 格式，支持图片提取和 OCR
**用户**：团队知识库建设者（开发者 + 非技术成员）
**部署**：本地运行 + Docker

---

## 2. 系统架构

```
输入文件 → CLI/API/Web UI → 处理器引擎 → Markdown 输出
                                        ↓
                                  ./projects/{timestamp}/
                                        ↓
                                  assets/ + output.md
```

**核心模块：**

| 模块 | 技术 | 职责 |
|------|------|------|
| CLI | Typer | 命令行交互，支持批量转换 |
| API | FastAPI + Swagger | REST API + Web 调试界面 |
| Web UI | React + Vite + Tailwind | 现代化文档转换界面 |
| 处理器引擎 | 统一接口 | 每种格式一个处理器 |
| OCR | Tesseract + DeepSeek | 图片文字识别 |
| 资产处理器 | 统一管理 | 图片提取、路径重写 |

---

## 3. 支持格式

| 格式 | 处理器 | 状态 |
|------|--------|------|
| Word (.docx) | python-docx | ✅ |
| PDF | pdfplumber + PyMuPDF → DeepSeek OCR | ✅ |
| PPT (.pptx/.ppt) | python-pptx | ✅ |
| Excel (.xlsx/.xls/.csv) | openpyxl | ✅ |

---

## 4. 项目结构

每次转换生成独立项目目录：

```
doc2md/
├── projects/                    # 所有转换项目的根目录
│   ├── 2026-05-14-1430/       # 单次转换项目
│   │   ├── doc1.md
│   │   ├── sheet.xlsx.md
│   │   └── assets/
│   │       ├── doc1/
│   │       │   └── image1.png
│   │       └── sheet/
│   │           └── chart1.png
│   └── 2026-05-14-1600/
├── cli.py
├── api.py
├── processors/
│   ├── __init__.py
│   ├── base.py
│   ├── docx.py
│   ├── pdf.py
│   ├── pptx.py
│   └── xlsx.py
├── ocr.py
├── browser.py                  # 文件浏览/预览路由
├── static/
│   ├── css/style.css
│   └── js/
│       ├── app.js
│       └── marked.min.js
├── templates/
│   └── preview.html
├── requirements.txt
└── Dockerfile

web/                           # React 前端 (可选)
├── src/
│   ├── components/
│   │   ├── FileUploader.tsx    # 文件上传组件
│   │   └── MarkdownPreview.tsx # Markdown 预览组件
│   │   └── ui/                # shadcn/ui 组件
│   ├── hooks/
│   │   └── useDocConverter.ts # 文档转换 Hook
│   ├── types/
│   │   └── doc2md.ts          # TypeScript 类型定义
│   ├── App.tsx
│   ├── App.css
│   └── index.css
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

**目录命名规则**：`{YYYY-MM-DD}-{HHMM}`（如 `2026-05-14-1430`）
**同名文件处理**：覆盖模式

---

## 5. 数据流

```
用户上传文件（CLI/API/Web UI）
    ↓
创建项目目录 projects/{timestamp}/
    ↓
检测文件类型
    ↓
调用对应处理器
    ↓
解析内容 → 转换为 Markdown
    ↓
提取图片 → assets/{filename}/
    ↓
图片 OCR 识别（可选模式）
    ↓
Markdown 内图片路径重写为相对路径
    ↓
输出 .md 文件 + assets/ 文件夹
```

---

## 6. API 设计

### 6.1 转换接口

```
POST /convert
  - form: file (上传文件)
  - form: ocr_mode (full | caption | none)  # 默认 full
  - form: force_ocr (bool)  # 强制使用 DeepSeek OCR
  - response: {
      project_id: "2026-05-14-1430",
      markdown: "...",
      assets: ["path1", "path2"]
    }

POST /convert/batch
  - form: files (批量上传)
  - response: {
      project_id: "2026-05-14-1430",
      results: [{ filename, markdown, assets }, ...]
    }
```

### 6.2 文件浏览接口

```
GET /files/{path:path}           # 静态文件服务（Markdown + 图片）
GET /preview/{filename}          # Markdown 预览页面
GET /api/files                   # 列出已转换的文件
GET /api/projects                # 列出所有项目
GET /api/projects/{id}           # 获取项目详情
GET /formats                     # 支持的格式列表
GET /health                      # 健康检查
```

### 6.3 OCR 配置

```python
# 环境变量
DEEPSEEK_API_KEY=sk-xxxx
DEEPSEEK_MODEL=gpt-4.1
DEEPSEEK_API_BASE=https://api.deepseek.com/v1
DEEPSEEK_OCR_THRESHOLD=0.8  # 成功率阈值，低于此值触发 DeepSeek
```

---

## 7. Web 前端

### 7.1 技术栈

- React 19 + TypeScript
- Vite 7
- Tailwind CSS v3
- shadcn/ui 组件库
- Lucide Icons

### 7.2 核心功能

- 拖拽上传文档文件
- 支持多种格式：Word (.docx)、PDF、PowerPoint (.pptx)、Excel (.xlsx/.csv)
- 实时 Markdown 预览
- OCR 文字识别（可选模式）
- 一键下载转换结果
- 响应式设计，支持深色模式

### 7.3 组件结构

```
src/components/
├── FileUploader.tsx      # 文件上传 + 格式选择
├── MarkdownPreview.tsx   # Markdown 实时预览
└── ui/                   # shadcn/ui 组件
    ├── button.tsx
    ├── card.tsx
    ├── dialog.tsx
    └── ...

src/hooks/
└── useDocConverter.ts    # 调用后端 API 的 Hook

src/types/
└── doc2md.ts             # 类型定义
```

### 7.4 开发

```bash
cd web
npm install
npm run dev    # 开发服务器
npm run build  # 生产构建
```

### 7.5 环境变量

```
VITE_API_BASE_URL=http://localhost:8000  # 后端 API 地址
```

---

## 8. OCR 处理

### 8.1 模式

| 模式 | 输出 |
|------|------|
| `full` | 完整 OCR 文字作为图片替代 |
| `caption` | 图片描述文字 + 原图引用 |
| `none` | 只提取图片，不 OCR |

### 8.2 流程

```
文档中的图片
    ↓
提取到 ./projects/{timestamp}/assets/{docname}/
    ↓
调用 Tesseract OCR
    ↓
成功率 < 阈值？
    ↓ 是
调用 DeepSeek OCR API
    ↓
返回识别结果
```

### 8.3 输出格式

```markdown
![image description](assets/doc1/image1.png)

> OCR 识别结果（可选显示）
> 图片中的文字内容...

![image](assets/doc1/image2.png)
```

---

## 9. Markdown 质量

### 9.1 标题层级自动检测

- Word 大纲结构 → Markdown H1-H6
- 自动识别文档标题层级
- 多级标题嵌套保持

### 9.2 目录自动生成

- 从标题自动生成 Markdown 目录
- 输出格式：`[TOC]` 或完整目录列表
- 支持层级缩进

```markdown
- [一级标题](#一级标题)
  - [二级标题](#二级标题)
    - [三级标题](#三级标题)
```

### 9.3 引用块保留

- Word blockquote → Markdown `>`
- 支持多层引用嵌套

```markdown
> 这是引用内容
> > 嵌套引用
```

### 9.4 列表嵌套层级

- 保留多层级的 ol/ul
- 智能识别列表类型（有序/无序）
- 列表项内容支持换行

```markdown
1. 第一项
   - 子项
   - 子项
2. 第二项
   - 子项
```

### 9.5 任务列表

- 识别 Word 中的 checkbox/任务
- 转换为 Markdown 待办格式

```markdown
- [ ] 待办事项
- [x] 已完成事项
```

### 9.6 脚注/尾注

- 转为 Markdown 脚注语法

```markdown
正文内容[^1]

[^1]: 脚注内容
```

### 9.7 元数据提取（Front-matter）

- 自动提取标题/作者/日期
- 生成 YAML front-matter

```markdown
---
title: 文档标题
author: 作者名
date: 2026-05-14
---

正文内容...
```

### 9.8 表格转换（Excel → Markdown）

```markdown
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 内容 | 内容 | 内容 |
```

支持：
- 合并单元格（转为普通表格）
- 格式化数字（保留原样）
- 表头识别

### 9.9 公式支持（LaTeX）

```markdown
行内公式：$E = mc^2$

块级公式：
$$
\int_{a}^{b} f(x) dx
$$
```

技术方案：保留 LaTeX 语法，渲染时用 KaTeX

### 9.10 代码块语法高亮

```markdown
```python
def hello():
    print("world")
```
```

技术方案：保留语法标记，渲染时用 highlight.js

### 9.11 超链接保留

```markdown
[链接文字](https://example.com)
```

### 9.12 图片 alt 文本

- 优先使用 Word 里的 alt text 作为图片描述
- 输出：`![alt text](path/to/image.png)`

---

## 10. 错误处理

| 错误 | 处理 |
|------|------|
| 不支持的格式 | 400 + 支持格式列表 |
| 损坏文件 | 400 + 具体错误 |
| 空文档 | 200 + 空 Markdown |
| 内存超限（>50MB） | 413 + 提示 |
| OCR 失败 | 回退到图片本身 |

---

## 11. 技术栈

```
Python 3.11
├── fastapi          # Web API + Swagger
├── uvicorn          # ASGI 服务器
├── typer            # CLI
├── python-multipart # 文件上传
├── python-docx      # Word 解析
├── pdfplumber       # PDF 解析
├── PyMuPDF          # PDF 备选
├── python-pptx      # PPT 解析
├── openpyxl         # Excel 解析
├── pytesseract      # 本地 OCR
├── requests         # DeepSeek API
└── markdown         # Markdown 处理

React 19 (前端)
├── vite             # 构建工具
├── tailwindcss      # 样式
├── shadcn/ui        # UI 组件
└── lucide-react     # 图标
```

---

## 12. Dockerfile

```dockerfile
FROM python:3.11-slim

# 安装 Tesseract OCR
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-eng \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# 创建必要目录
RUN mkdir -p projects assets static/css static/js templates

EXPOSE 8000

CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 13. 待确认

- [x] 标题层级自动检测
- [x] 目录自动生成
- [x] 引用块保留
- [x] 列表嵌套层级
- [x] 任务列表
- [x] 脚注/尾注
- [x] 元数据提取
- [x] 表格转换
- [x] 公式支持
- [x] 代码块语法高亮
- [x] 超链接保留
- [x] 图片 alt 文本
- [ ] 搜索功能是否需要（暂未实现）
- [ ] 多用户/权限控制（暂未实现）