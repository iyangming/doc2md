import { useState } from 'react';
import { FileUploader } from '@/components/FileUploader';
import { MarkdownPreview } from '@/components/MarkdownPreview';
import type { ConversionResult } from '@/types/doc2md';
import { FileText, Columns, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';

function App() {
  const [selectedResult, setSelectedResult] = useState<ConversionResult | null>(null);
  const [viewMode, setViewMode] = useState<'split' | 'upload' | 'preview'>('split');

  const handleConversionComplete = (result: ConversionResult) => {
    setSelectedResult(result);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">doc2md</h1>
              <p className="text-xs text-muted-foreground">文档转 Markdown 工具</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'upload' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('upload')}
            >
              <FileText className="h-4 w-4 mr-1" />
              上传
            </Button>
            <Button
              variant={viewMode === 'split' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('split')}
            >
              <Columns className="h-4 w-4 mr-1" />
              分屏
            </Button>
            <Button
              variant={viewMode === 'preview' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('preview')}
              disabled={!selectedResult}
            >
              <Sparkles className="h-4 w-4 mr-1" />
              预览
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-8">
        {viewMode === 'split' ? (
          <div className="grid gap-6 lg:grid-cols-2 h-[calc(100vh-10rem)]">
            <div className="overflow-auto">
              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">上传文档</h2>
                <p className="text-sm text-muted-foreground">
                  支持 Word、PDF、PPT、Excel 等格式，智能提取内容并转换为 Markdown
                </p>
              </div>
              <FileUploader onSuccess={handleConversionComplete} />
            </div>
            <div className="overflow-hidden">
              {selectedResult ? (
                <MarkdownPreview
                  markdown={selectedResult.markdown}
                  filename={selectedResult.filename}
                  assets={selectedResult.assets}
                />
              ) : (
                <Card className="h-full flex items-center justify-center">
                  <CardContent className="text-center py-12">
                    <Sparkles className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <CardTitle className="text-lg mb-2">暂无预览</CardTitle>
                    <CardDescription>
                      上传并转换文档后，这里将显示 Markdown 预览
                    </CardDescription>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : viewMode === 'upload' ? (
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">上传文档</h2>
              <p className="text-sm text-muted-foreground">
                支持 Word、PDF、PPT、Excel 等格式，智能提取内容并转换为 Markdown
              </p>
            </div>
            <FileUploader onSuccess={handleConversionComplete} />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {selectedResult && (
              <MarkdownPreview
                markdown={selectedResult.markdown}
                filename={selectedResult.filename}
                assets={selectedResult.assets}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-6 mt-12">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>doc2md - 将文档转换为 Markdown 格式</p>
          <p className="mt-1">支持 Word (.docx)、PDF、PowerPoint (.pptx)、Excel (.xlsx/.csv)</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
