import React, { useState, useEffect } from 'react';
import { X, Download, ExternalLink, FileText, AlertTriangle, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogPortal, DialogOverlay } from '../ui/dialog';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '../ui/utils';
import { useLanguage } from '../context/LanguageContext';

// Utility function to fix URLs with wrong port
const fixBackendUrl = (url: string): string => {
  if (!url || typeof url !== 'string') return url;
  
  try {
    // If URL contains wrong port, fix it
    if (url.includes(':5173')) {
      return url.replace(':5173', ':5000');
    }
    
    // If it's a localhost URL without port or with wrong port
    if (url.includes('localhost') && !url.includes(':5000')) {
      return url.replace(/localhost(:\d+)?/, 'localhost:5000');
    }
    
    return url;
  } catch (error) {
    console.error('Error fixing URL:', error);
    return url;
  }
};

interface PdfViewerProps {
  isOpen: boolean;
  onClose: () => void;
  resource: {
    title: string;
    url: string;
    type: string;
    size?: number;
    description?: string;
  } | null;
}

export function PdfViewer({ isOpen, onClose, resource }: PdfViewerProps) {
  const { t, isRTL } = useLanguage();
  const [pdfLoadError, setPdfLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (isOpen && resource) {
      setPdfLoadError(false);
      setIsLoading(true);
      setRetryCount(0);
    }
  }, [isOpen, resource]);

  if (!resource) return null;

  // Fix the resource URL to use correct backend port
  const fixedResource = {
    ...resource,
    url: fixBackendUrl(resource.url)
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(fixedResource.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fixedResource.title || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Resource downloaded successfully');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download resource');
    }
  };

  const handleOpenInNewTab = () => {
    window.open(fixedResource.url, '_blank');
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setPdfLoadError(false);
    setIsLoading(true);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setPdfLoadError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setPdfLoadError(true);
  };

  // Test if URL is accessible
  const testUrlAccessibility = async (url: string) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error('URL accessibility test failed:', error);
      return false;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className={cn(
            "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] rounded-lg border shadow-lg duration-200",
            "w-[95vw] h-[95vh] max-w-none p-0"
          )}
          style={{ 
            width: '95vw', 
            height: '95vh',
            maxWidth: 'none',
            maxHeight: 'none'
          }}
        >
        {/* Styled Header */}
        <DialogHeader className="px-6 py-4 bg-gradient-to-r from-teal-500 to-purple-600 text-white border-b-0 flex flex-row items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white mb-1">
                {fixedResource.title}
              </DialogTitle>
              <div className="flex items-center space-x-4 text-sm text-white/80">
                <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-medium">
                  {fixedResource.type.toUpperCase()}
                </span>
                {fixedResource.size && (
                  <span className="font-medium">
                    {formatFileSize(fixedResource.size)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleDownload}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/40 backdrop-blur-sm transition-all duration-200"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button
              onClick={handleOpenInNewTab}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/40 backdrop-blur-sm transition-all duration-200"
              size="sm"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in New Tab
            </Button>
            <Button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/40 backdrop-blur-sm transition-all duration-200"
              size="sm"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* PDF Content with Enhanced Container */}
        {resource.type === 'pdf' ? (
          <div className="w-full h-full bg-gray-50" style={{ height: 'calc(95vh - 80px)' }}>
            <div className="w-full h-full bg-white shadow-inner border border-gray-200 overflow-hidden">
              <iframe
                key={`${fixedResource.url}-${retryCount}`}
                src={`${fixedResource.url}#toolbar=1&navpanes=1&scrollbar=1&view=FitH&pagemode=thumbs`}
                className="w-full h-full border-0"
                title={fixedResource.title}
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                style={{
                  filter: 'contrast(1.1) brightness(1.05)', // Slight enhancement
                }}
              />
            </div>
          </div>
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100" style={{ height: 'calc(95vh - 80px)' }}>
              <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-gray-200 max-w-md">
                <div className="h-20 w-20 bg-gradient-to-br from-teal-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Preview Not Available
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  This file type cannot be previewed in the browser. You can still download or open it in a new tab.
                </p>
                <div className="flex items-center justify-center space-x-3">
                  <Button 
                    onClick={handleDownload} 
                    className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button 
                    onClick={handleOpenInNewTab}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in New Tab
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}

