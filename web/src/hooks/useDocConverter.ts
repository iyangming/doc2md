import { useState, useCallback } from 'react';
import { API_BASE_URL, SUPPORTED_FORMATS } from '@/types/doc2md';
import type { ConversionResult, BatchResult } from '@/types/doc2md';

interface UseDocConverterOptions {
  onSuccess?: (result: ConversionResult) => void;
  onError?: (error: string) => void;
  onBatchComplete?: (result: BatchResult) => void;
}

interface FileInfo {
  file: File;
  status: 'pending' | 'converting' | 'success' | 'error';
  result?: ConversionResult;
  error?: string;
}

export function useDocConverter(options: UseDocConverterOptions = {}) {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [ocrMode, setOcrMode] = useState('full');

  const isValidFile = useCallback((file: File): boolean => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    return SUPPORTED_FORMATS.some(f => f.ext === ext);
  }, []);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const validFiles = fileArray.filter(isValidFile);

    setFiles(prev => [
      ...prev,
      ...validFiles.map(file => ({
        file,
        status: 'pending' as const,
      })),
    ]);

    return validFiles.length;
  }, [isValidFile]);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  const convertFile = useCallback(async (file: File): Promise<ConversionResult> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('ocr_mode', ocrMode);

    const response = await fetch(`${API_BASE_URL}/convert`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: '转换失败' }));
      throw new Error(error.message || '转换失败');
    }

    return response.json();
  }, [ocrMode]);

  const convertAll = useCallback(async () => {
    if (files.length === 0) return;

    setIsConverting(true);
    setFiles(prev => prev.map(f => ({ ...f, status: 'converting' as const })));

    const pendingFiles = files.filter(f => f.status === 'pending');

    for (let i = 0; i < pendingFiles.length; i++) {
      const originalIndex = files.findIndex(f => f.file === pendingFiles[i].file);
      const fileInfo = pendingFiles[i];

      try {
        const result = await convertFile(fileInfo.file);
        setFiles(prev => prev.map((f, idx) =>
          idx === originalIndex
            ? { ...f, status: 'success', result }
            : f
        ));
        options.onSuccess?.(result);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '转换失败';
        setFiles(prev => prev.map((f, idx) =>
          idx === originalIndex
            ? { ...f, status: 'error', error: errorMessage }
            : f
        ));
        options.onError?.(errorMessage);
      }
    }

    setIsConverting(false);
  }, [files, convertFile, options]);

  const convertSingle = useCallback(async (index: number) => {
    const fileInfo = files[index];
    if (!fileInfo) return;

    setFiles(prev => prev.map((f, idx) =>
      idx === index ? { ...f, status: 'converting' } : f
    ));

    try {
      const result = await convertFile(fileInfo.file);
      setFiles(prev => prev.map((f, idx) =>
        idx === index ? { ...f, status: 'success', result } : f
      ));
      options.onSuccess?.(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '转换失败';
      setFiles(prev => prev.map((f, idx) =>
        idx === index ? { ...f, status: 'error', error: errorMessage } : f
      ));
      options.onError?.(errorMessage);
    }
  }, [files, convertFile, options]);

  return {
    files,
    isConverting,
    ocrMode,
    setOcrMode,
    addFiles,
    removeFile,
    clearFiles,
    convertAll,
    convertSingle,
  };
}
