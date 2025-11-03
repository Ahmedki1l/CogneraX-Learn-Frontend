import React, { useState, useRef } from 'react';
import { Upload, X, File, Image, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Card, CardContent } from '../ui/card';
import { api } from '../../services/api';
import { toast } from 'sonner';

interface FileUploadProps {
  type: 'avatar' | 'thumbnail' | 'document' | 'video' | 'misc';
  accept?: string;
  maxSize?: number; // in MB
  onUploadComplete?: (url: string) => void;
  currentFile?: string;
}

export function FileUpload({
  type,
  accept = '*/*',
  maxSize = 50,
  onUploadComplete,
  currentFile
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(currentFile || '');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAcceptType = () => {
    switch (type) {
      case 'avatar':
      case 'thumbnail':
        return 'image/*';
      case 'document':
        return '.pdf,.doc,.docx,.txt,.md';
      case 'video':
        return 'video/*';
      default:
        return accept;
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file size
    if (selectedFile.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      toast.error(`File too large. Maximum size is ${maxSize}MB`);
      return;
    }

    setFile(selectedFile);
    setError('');

    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);

    try {
      // Simulate progress
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      let response;
      
      // Use appropriate upload endpoint based on type
      switch (type) {
        case 'avatar':
          response = await api.upload.uploadAvatar(file);
          break;
        case 'thumbnail':
          response = await api.upload.uploadCourseThumbnail(file);
          break;
        case 'video':
          response = await api.upload.uploadVideo(file);
          break;
        case 'document':
          response = await api.upload.uploadResource(file, 'document');
          break;
        default:
          response = await api.upload.uploadFile(file, type);
      }

      clearInterval(interval);
      setProgress(100);

      if (response) {
        const fileUrl = response.url || response.path;
        setPreview(fileUrl);
        toast.success('File uploaded successfully!');
        
        if (onUploadComplete) {
          onUploadComplete(fileUrl);
        }
      }
    } catch (error: any) {
      console.error('Upload failed:', error);
      setError(error?.error?.message || 'Upload failed');
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(currentFile || '');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept={getAcceptType()}
        onChange={handleFileSelect}
        className="hidden"
      />

      {!file && !preview ? (
        <Card
          className="border-2 border-dashed cursor-pointer hover:border-primary hover:bg-gray-50 transition-colors"
          onClick={handleClick}
        >
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Upload className="h-10 w-10 text-gray-400 mb-4" />
            <p className="text-sm text-gray-600 mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              {getAcceptType().replace('*/', '').toUpperCase()} • Max {maxSize}MB
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {/* Preview */}
          {preview && (type === 'avatar' || type === 'thumbnail') && (
            <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              {!uploading && (
                <button
                  onClick={handleRemove}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          {/* File Info */}
          {file && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {file.type.startsWith('image/') ? (
                  <Image className="h-5 w-5 text-blue-600" />
                ) : (
                  <File className="h-5 w-5 text-gray-600" />
                )}
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              {!uploading && (
                <button
                  onClick={handleRemove}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          )}

          {/* Progress */}
          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-xs text-center text-gray-500">
                Uploading... {progress}%
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          {file && !uploading && (
            <div className="flex space-x-2">
              <Button onClick={handleUpload} className="flex-1">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
              <Button variant="outline" onClick={handleClick}>
                Change
              </Button>
            </div>
          )}

          {/* Success */}
          {!file && preview && (
            <div className="flex items-center justify-center space-x-2 text-green-600 text-sm">
              <CheckCircle className="h-4 w-4" />
              <span>File uploaded successfully</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

