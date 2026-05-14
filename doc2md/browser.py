from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import HTMLResponse, FileResponse
from pathlib import Path
from typing import Optional
from doc2md.config import config

router = APIRouter(prefix="/browser", tags=["browser"])

def get_projects() -> list[str]:
    projects_dir = Path(config.PROJECTS_DIR)
    if not projects_dir.exists():
        return []
    return sorted([d.name for d in projects_dir.iterdir() if d.is_dir()], reverse=True)

def get_files_for_project(project_id: str) -> list[str]:
    project_dir = Path(config.PROJECTS_DIR) / project_id
    if not project_dir.exists():
        return []
    return [f.name for f in project_dir.glob("*.md")]

@router.get("")
async def browser_index():
    projects = get_projects()
    return HTMLResponse(content=get_browser_html(projects))

@router.get("/projects")
async def list_projects_api():
    return {"projects": get_projects()}

@router.get("/projects/{project_id}/files")
async def list_project_files(project_id: str):
    files = get_files_for_project(project_id)
    return {"project_id": project_id, "files": files}

@router.get("/projects/{project_id}/files/{filename}")
async def read_file(project_id: str, filename: str):
    file_path = Path(config.PROJECTS_DIR) / project_id / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, message="File not found")
    content = file_path.read_text()
    return {"content": content, "filename": filename}

@router.get("/assets/{project_id}/{path:path}")
async def get_asset(project_id: str, path: str):
    asset_path = Path(config.PROJECTS_DIR) / project_id / config.ASSETS_DIR / path
    if not asset_path.exists():
        raise HTTPException(status_code=404, message="Asset not found")
    return FileResponse(asset_path)

def get_browser_html(projects: list[str]) -> str:
    projects_json = str(projects)
    return f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>doc2md Browser</title>
    <link rel="stylesheet" href="/static/css/style.css">
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/github.min.css">
    <script src="https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/lib/highlight.min.js"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
    <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"></script>
</head>
<body>
    <div class="container">
        <aside class="sidebar">
            <h2>Projects</h2>
            <select id="project-select">
                {''.join(f'<option value="{p}">{p}</option>' for p in projects)}
            </select>
            <h2>Files</h2>
            <ul id="file-list"></ul>
        </aside>
        <main class="content">
            <div id="preview"></div>
        </main>
    </div>
    <script>
        const projects = {projects_json};
        const projectSelect = document.getElementById('project-select');
        const fileList = document.getElementById('file-list');
        const preview = document.getElementById('preview');

        async function loadFiles() {{
            const projectId = projectSelect.value;
            if (!projectId) return;
            const res = await fetch(`/browser/projects/${{projectId}}/files`);
            const data = await res.json();
            fileList.innerHTML = data.files.map(f =>
                `<li><a href="#" onclick="loadFile('${{projectId}}', '$'+encodeURIComponent(f)+''); return false;">${{f}}</a></li>`
            ).join('');
        }}

        async function loadFile(projectId, filename) {{
            const res = await fetch(`/browser/projects/${{projectId}}/files/${{encodeURIComponent(filename)}}`);
            const data = await res.json();
            const parsedContent = marked.parse(data.content);
            preview.innerHTML = '<div class="markdown-body">' + parsedContent + '</div>';
            if (window.hljs) hljs.highlightAll();
            if (window.renderMathInElement) renderMathInElement(preview, {{ delimiters: [
                {{left: '$$', right: '$$', display: true}},
                {{left: '$', right: '$', display: false}}
            ]}});
        }}

        projectSelect.addEventListener('change', loadFiles);
        loadFiles();
    </script>
</body>
</html>
"""