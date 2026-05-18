import { useState, useCallback } from 'react';
import { Upload, FileText, FileBox, Presentation, Table, FileSpreadsheet, Loader2, CheckCircle2, AlertCircle, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useDocConverter } from '@/hooks/useDocConverter';
import { SUPPORTED_FORMATS, OCR_MODES } from '@/types/doc2md';
import type { ConversionResult } from '@/types/doc2md';
import { toast } from 'sonner';

interface FileUploaderProps {
  onSuccess?: (result: ConversionResult) => void;
}

const formatIcons: Record<string, React.ElementType> = {
  FileText,
  FileBox,
  Presentation,
  Table,
  FileSpreadsheet,
};

function FileCard({ fileInfo, onRemove, onConvert, onDownload, isConverting }: {
  fileInfo: { file: File; status: string; result?: any; error?: string };
  onRemove: () => void;
  onConvert: () => void;
  onDownload: () => void;
  isConverting: boolean;
}) {
  const ext = '.' + fileInfo.file.name.split('.').pop()?.toLowerCase();
  const format = SUPPORTED_FORMATS.find(f => f.ext === ext);
  const Icon = format ? formatIcons[format.icon] : FileText;

  const statusConfig = {
    pending: { icon: null, color: 'bg-muted text-muted-foreground', badge: '待转换' },
    converting: { icon: Loader2, color: 'bg-blue-500/10 text-blue-500', badge: '转换中' },
    success: { icon: CheckCircle2, color: 'bg-green-500/10 text-green-500', badge: '完成' },
    error: { icon: AlertCircle, color: 'bg-red-500/10 text-red-500', badge: '失败' },
  };

  const status = statusConfig[fileInfo.status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <Card className="relative overflow-hidden">
      {fileInfo.status === 'converting' && (
        <Progress value={66} className="absolute top-0 left-0 right-0 h-1 rounded-none" />
      )}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${status.color}`}>
              <Icon className={`h-5 w-5 ${fileInfo.status === 'converting' ? 'animate-spin' : ''}`} />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-sm font-medium truncate max-w-[200px]">
                {fileInfo.file.name}
              </CardTitle>
              <CardDescription className="text-xs">
                {(fileInfo.file.size / 1024 / 1024).toFixed(2)} MB
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className={status.color}>
            {status.icon && <status.icon className="h-3 w-3 mr-1" />}
            {status.badge}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex gap-2">
        {fileInfo.status === 'pending' && (
          <Button size="sm" onClick={onConvert} disabled={isConverting}>
            转换
          </Button>
        )}
        {fileInfo.status === 'success' && (
          <Button size="sm" variant="default" onClick={onDownload}>
            <Download className="h-4 w-4 mr-1" />
            下载 MD
          </Button>
        )}
        {fileInfo.status === 'error' && (
          <p className="text-xs text-red-500">{fileInfo.error}</p>
        )}
        <Button size="sm" variant="ghost" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

export function FileUploader({ onSuccess }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const {
    files,
    isConverting,
    ocrMode,
    setOcrMode,
    addFiles,
    removeFile,
    clearFiles,
    convertAll,
    convertSingle,
  } = useDocConverter({
    onSuccess: (result) => {
      toast.success(`转换成功: ${result.filename}`);
      onSuccess?.(result);
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }, [addFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
  }, [addFiles]);

  const handleDownload = useCallback((index: number) => {
    const fileInfo = files[index];
    if (fileInfo.result?.markdown) {
      const blob = new Blob([fileInfo.result.markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileInfo.result.filename || 'output.md';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [files]);

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200
          ${isDragging
            ? 'border-primary bg-primary/5 scale-[1.02]'
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
          }
        `}
      >
        <input
          type="file"
          multiple
          accept=".docx,.pdf,.pptx,.ppt,.xlsx,.xls,.csv"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center gap-4">
          <div className={`p-4 rounded-full bg-primary/10 ${isDragging ? 'animate-bounce' : ''}`}>
            <Upload className={`h-8 w-8 text-primary ${isDragging ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <p className="text-lg font-medium">
              {isDragging ? '释放文件开始上传' : '拖拽文件到此处'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              或点击选择文件
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {SUPPORTED_FORMATS.map((format) => {
              const Icon = formatIcons[format.icon];
              return (
                <Badge key={format.ext} variant="outline" className="gap-1">
                  <Icon className="h-3 w-3" />
                  {format.ext}
                </Badge>
              );
            })}
          </div>
        </div>
      </div>

      {/* OCR Mode Selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">OCR 模式</CardTitle>
          <CardDescription>选择是否对图片进行文字识别</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {OCR_MODES.map((mode) => (
              <button
                key={mode.value}
                onClick={() => setOcrMode(mode.value)}
                className={`
                  p-3 rounded-lg border-2 text-left transition-all
                  ${ocrMode === mode.value
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-primary/50'
                  }
                `}
              >
                <p className="font-medium text-sm">{mode.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{mode.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">
              已添加 {files.length} 个文件
            </h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFiles}
                disabled={isConverting}
              >
                清空
              </Button>
              <Button
                size="sm"
                onClick={convertAll}
                disabled={isConverting || files.every(f => f.status !== 'pending')}
              >
                {isConverting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    转换中...
                  </>
                ) : (
                  '全部转换'
                )}
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {files.map((fileInfo, idx) => (
              <FileCard
                key={idx}
                fileInfo={fileInfo}
                onRemove={() => removeFile(idx)}
                onConvert={() => convertSingle(idx)}
                onDownload={() => handleDownload(idx)}
                isConverting={isConverting}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
