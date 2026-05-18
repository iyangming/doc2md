# doc2md Web

现代化文档转 Markdown Web 应用

## 功能特性

- 拖拽上传文档文件
- 支持多种格式：Word (.docx)、PDF、PowerPoint (.pptx)、Excel (.xlsx/.csv)
- 实时 Markdown 预览
- OCR 文字识别
- 一键下载转换结果
- 响应式设计，支持深色模式

## 技术栈

- React 19 + TypeScript
- Vite 7
- Tailwind CSS v3
- shadcn/ui
- Lucide Icons

## 开发

```bash
cd doc2md-web
npm install
npm run dev
```

## 构建

```bash
npm run build
```

## 配置

创建 `.env` 文件：

```
VITE_API_BASE_URL=http://localhost:8000
```

## 后端

本项目需要配合 doc2md 后端使用，详见 [doc2md](https://github.com/iyangming/doc2md)
