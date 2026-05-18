/**
 * API Configuration for doc2md Backend
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface ConversionResult {
  project_id: string;
  markdown: string;
  assets: string[];
  filename: string;
}

export interface ProjectInfo {
  project_id: string;
  created_at: string;
  files: string[];
  assets: string[];
}

export interface BatchResult {
  project_id: string;
  results: Array<{
    filename: string;
    markdown?: string;
    assets?: string[];
    error?: string;
  }>;
}

export const SUPPORTED_FORMATS = [
  { ext: '.docx', name: 'Word文档', icon: 'FileText' },
  { ext: '.pdf', name: 'PDF文档', icon: 'FileBox' },
  { ext: '.pptx', name: 'PowerPoint', icon: 'Presentation' },
  { ext: '.ppt', name: 'PowerPoint', icon: 'Presentation' },
  { ext: '.xlsx', name: 'Excel表格', icon: 'Table' },
  { ext: '.xls', name: 'Excel表格', icon: 'Table' },
  { ext: '.csv', name: 'CSV文件', icon: 'FileSpreadsheet' },
];

export const OCR_MODES = [
  { value: 'full', label: '完整OCR', description: '对所有图片进行OCR识别' },
  { value: 'caption', label: '仅标题', description: '仅识别标题级别文字' },
  { value: 'none', label: '不启用', description: '不使用OCR功能' },
];
