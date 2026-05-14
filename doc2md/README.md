# doc2md - Document to Markdown Converter

将 Word、PDF、PPT、Excel 文档转换为 Markdown 格式，支持 OCR 识别和 Web 预览。

## 特性

- **多格式支持**: Word (.docx), PDF, PowerPoint (.pptx/.ppt), Excel (.xlsx/.xls/.csv)
- **CLI 工具**: 简洁的命令行界面，支持单个和批量转换
- **API 服务**: FastAPI 构建的 REST API，带 Swagger 文档
- **Web 预览**: 内置 Markdown 文件浏览器和预览界面
- **OCR 识别**: Tesseract 本地 OCR + DeepSeek API 云端识别
- **项目组织**: 每次转换生成独立项目，按时间戳命名

## 快速开始

### 安装

```bash
# 克隆项目
git clone https://github.com/iyangming/doc2md.git
cd doc2md

# 安装依赖
pip install -r requirements.txt
```

### CLI 使用

```bash
# 转换单个文件
python -m doc2md.cli convert document.docx

# 批量转换
python -m doc2md.cli convert file1.docx file2.pdf file3.xlsx

# 列出所有项目
python -m doc2md.cli list-projects

# 启动 Web 服务
python -m doc2md.cli serve
```

### API 服务

```bash
# 启动服务
python -m uvicorn doc2md.api:app --host 0.0.0.0 --port 8000
```

访问:
- API 文档: http://localhost:8000/docs
- 文件浏览器: http://localhost:8000/browser

### Docker 部署

```bash
docker build -t doc2md .
docker run -p 8000:8000 doc2md
```

## API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/health` | GET | 健康检查 |
| `/formats` | GET | 支持的格式列表 |
| `/convert` | POST | 转换单个文件 |
| `/convert/batch` | POST | 批量转换 |
| `/api/projects` | GET | 列出所有项目 |
| `/api/projects/{id}` | GET | 获取项目详情 |

## 配置

复制 `.env.example` 为 `.env` 并配置:

```env
DEEPSEEK_API_KEY=your-api-key-here
DEEPSEEK_MODEL=gpt-4.1
DEEPSEEK_API_BASE=https://api.deepseek.com/v1
DEEPSEEK_OCR_THRESHOLD=0.8
DEFAULT_OCR_MODE=full
MAX_FILE_SIZE_MB=50
```

## 项目结构

```
doc2md/
├── api.py              # FastAPI 服务
├── browser.py         # 文件浏览/预览
├── cli.py             # CLI 工具
├── config.py          # 配置管理
├── models.py          # 数据模型
├── ocr.py             # OCR 处理器
├── processors/        # 文档处理器
│   ├── base.py
│   ├── docx.py
│   ├── pdf.py
│   ├── pptx.py
│   └── xlsx.py
├── static/            # 静态资源
└── templates/        # HTML 模板
```

## 输出结构

每次转换生成独立项目目录:

```
projects/
└── 2026-05-14-1430/     # 时间戳命名
    ├── document.md       # 转换后的 Markdown
    └── assets/          # 提取的图片
        └── document/
            └── image1.png
```

## Markdown 质量

- 标题层级 (H1-H6)
- 目录自动生成
- 表格转换
- 代码块语法高亮
- LaTeX 公式支持
- 任务列表
- 引用块
- 元数据 (Front-matter)

## 运行测试

```bash
pytest tests/ -v
```

## License

MIT