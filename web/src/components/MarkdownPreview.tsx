import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Check, Download, Eye, FileCode } from 'lucide-react';

interface MarkdownPreviewProps {
  markdown: string;
  filename?: string;
  assets?: string[];
}

export function MarkdownPreview({ markdown, filename = 'document.md', assets = [] }: MarkdownPreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.md') ? filename : `${filename}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Simple markdown to HTML rendering
  const htmlContent = useMemo(() => {
    let html = markdown
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-6 mb-2">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>')
      // Bold and italic
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Code blocks
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-muted p-4 rounded-lg overflow-x-auto my-4"><code>$2</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm">$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline" target="_blank" rel="noopener">$1</a>')
      // Lists
      .replace(/^\s*[-*]\s+(.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/^\s*(\d+)\.\s+(.*$)/gim, '<li class="ml-4 list-decimal">$2</li>')
      // Blockquotes
      .replace(/^\>\s+(.*$)/gim, '<blockquote class="border-l-4 border-primary pl-4 italic my-4">$1</blockquote>')
      // Horizontal rules
      .replace(/^---$/gim, '<hr class="my-6 border-muted" />')
      // Line breaks
      .replace(/\n\n/g, '</p><p class="my-3">')
      .replace(/\n/g, '<br />');

    // Wrap consecutive list items
    html = html.replace(/(<li class="ml-4">.*<\/li>)(\s*<li class="ml-4">.*<\/li>)*/g, '<ul class="list-disc my-3">$&</ul>');

    return `<p class="my-3">${html}</p>`;
  }, [markdown]);

  const stats = useMemo(() => {
    const lines = markdown.split('\n').length;
    const chars = markdown.length;
    const words = markdown.split(/\s+/).filter(Boolean).length;
    return { lines, chars, words };
  }, [markdown]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileCode className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-base">{filename}</CardTitle>
              <CardDescription className="flex gap-3 mt-1">
                <span>{stats.words} 字</span>
                <span>{stats.lines} 行</span>
                <span>{stats.chars} 字符</span>
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              {copied ? '已复制' : '复制'}
            </Button>
            <Button size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-1" />
              下载
            </Button>
          </div>
        </div>

        {assets.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="text-sm text-muted-foreground">附件:</span>
            {assets.map((asset, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {asset.split('/').pop()}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 min-h-0 p-0">
        <Tabs defaultValue="preview" className="h-full flex flex-col">
          <TabsList className="w-full justify-start rounded-none border-b px-4 h-12 bg-transparent">
            <TabsTrigger value="preview" className="gap-1.5">
              <Eye className="h-4 w-4" />
              预览
            </TabsTrigger>
            <TabsTrigger value="source" className="gap-1.5">
              <FileCode className="h-4 w-4" />
              源码
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="flex-1 m-0">
            <ScrollArea className="h-full p-6">
              <div
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="source" className="flex-1 m-0">
            <ScrollArea className="h-full">
              <pre className="p-6 text-sm font-mono whitespace-pre-wrap break-words">
                {markdown}
              </pre>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
