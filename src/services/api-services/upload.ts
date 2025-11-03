import { BaseApiService, API_BASE_URL } from './base';

export class UploadApiService extends BaseApiService {
  // File Upload
  async uploadFile(file: File, options?: {
    folder?: string;
    public?: boolean;
    maxSize?: number;
    allowedTypes?: string[];
  }): Promise<any> {
    // Validate file size
    if (options?.maxSize && file.size > options.maxSize) {
      throw new Error(`File size exceeds maximum allowed size of ${options.maxSize} bytes`);
    }

    // Validate file type
    if (options?.allowedTypes && !options.allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed`);
    }

    const formData = new FormData();
    formData.append('file', file);
    
    if (options?.folder) formData.append('folder', options.folder);
    if (options?.public !== undefined) formData.append('public', options.public.toString());

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    return response.json();
  }

  async uploadMultipleFiles(files: File[], options?: {
    folder?: string;
    public?: boolean;
    maxSize?: number;
    allowedTypes?: string[];
  }): Promise<any> {
    // Validate all files
    if (options?.maxSize) {
      for (const file of files) {
        if (file.size > options.maxSize) {
          throw new Error(`File ${file.name} exceeds maximum allowed size of ${options.maxSize} bytes`);
        }
      }
    }

    if (options?.allowedTypes) {
      for (const file of files) {
        if (!options.allowedTypes.includes(file.type)) {
          throw new Error(`File type ${file.type} for ${file.name} is not allowed`);
        }
      }
    }

    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files`, file);
    });
    
    if (options?.folder) formData.append('folder', options.folder);
    if (options?.public !== undefined) formData.append('public', options.public.toString());

    const response = await fetch(`${API_BASE_URL}/upload/multiple`, {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    return response.json();
  }

  // Image Upload
  async uploadImage(file: File, options?: {
    folder?: string;
    public?: boolean;
    resize?: {
      width?: number;
      height?: number;
      quality?: number;
    };
    generateThumbnail?: boolean;
  }): Promise<any> {
    const formData = new FormData();
    formData.append('image', file);
    
    if (options?.folder) formData.append('folder', options.folder);
    if (options?.public !== undefined) formData.append('public', options.public.toString());
    if (options?.resize) formData.append('resize', JSON.stringify(options.resize));
    if (options?.generateThumbnail !== undefined) formData.append('generateThumbnail', options.generateThumbnail.toString());

    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    return response.json();
  }

  // Video Upload
  async uploadVideo(file: File, options?: {
    folder?: string;
    public?: boolean;
    generateThumbnail?: boolean;
    compress?: boolean;
    quality?: 'low' | 'medium' | 'high';
  }): Promise<any> {
    const formData = new FormData();
    formData.append('video', file);
    
    if (options?.folder) formData.append('folder', options.folder);
    if (options?.public !== undefined) formData.append('public', options.public.toString());
    if (options?.generateThumbnail !== undefined) formData.append('generateThumbnail', options.generateThumbnail.toString());
    if (options?.compress !== undefined) formData.append('compress', options.compress.toString());
    if (options?.quality) formData.append('quality', options.quality);

    const response = await fetch(`${API_BASE_URL}/upload/video`, {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    return response.json();
  }

  // Document Upload
  async uploadDocument(file: File, options?: {
    folder?: string;
    public?: boolean;
    extractText?: boolean;
    generatePreview?: boolean;
  }): Promise<any> {
    const formData = new FormData();
    formData.append('document', file);
    
    if (options?.folder) formData.append('folder', options.folder);
    if (options?.public !== undefined) formData.append('public', options.public.toString());
    if (options?.extractText !== undefined) formData.append('extractText', options.extractText.toString());
    if (options?.generatePreview !== undefined) formData.append('generatePreview', options.generatePreview.toString());

    const response = await fetch(`${API_BASE_URL}/upload/document`, {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    return response.json();
  }

  // File Management
  async getFiles(filters?: {
    page?: number;
    limit?: number;
    folder?: string;
    type?: string;
    public?: boolean;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    return this.request(`/upload/files?${params.toString()}`);
  }

  async getFile(fileId: string): Promise<any> {
    return this.request(`/upload/files/${fileId}`);
  }

  async updateFile(fileId: string, updates: {
    name?: string;
    description?: string;
    public?: boolean;
    tags?: string[];
  }): Promise<any> {
    return this.request(`/upload/files/${fileId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteFile(fileId: string): Promise<void> {
    return this.request(`/upload/files/${fileId}`, {
      method: 'DELETE',
    });
  }

  async deleteMultipleFiles(fileIds: string[]): Promise<any> {
    return this.request('/upload/files/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ fileIds }),
    });
  }

  // File Access
  async getFileUrl(fileId: string, options?: {
    expiresIn?: number;
    download?: boolean;
  }): Promise<{ url: string }> {
    const params = new URLSearchParams();
    if (options?.expiresIn) params.append('expiresIn', options.expiresIn.toString());
    if (options?.download) params.append('download', 'true');
    
    return this.request(`/upload/files/${fileId}/url?${params.toString()}`);
  }

  async downloadFile(fileId: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/upload/files/${fileId}/download`, {
      method: 'GET',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
    });

    if (!response.ok) {
      throw new Error('File download failed');
    }

    return response.blob();
  }

  // Folder Management
  async getFolders(): Promise<any> {
    return this.request('/upload/folders');
  }

  async createFolder(name: string, parentId?: string): Promise<any> {
    return this.request('/upload/folders', {
      method: 'POST',
      body: JSON.stringify({ name, parentId }),
    });
  }

  async updateFolder(folderId: string, updates: {
    name?: string;
    parentId?: string;
  }): Promise<any> {
    return this.request(`/upload/folders/${folderId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteFolder(folderId: string): Promise<void> {
    return this.request(`/upload/folders/${folderId}`, {
      method: 'DELETE',
    });
  }

  // Upload Progress
  async getUploadProgress(uploadId: string): Promise<any> {
    return this.request(`/upload/progress/${uploadId}`);
  }

  async cancelUpload(uploadId: string): Promise<void> {
    return this.request(`/upload/cancel/${uploadId}`, {
      method: 'POST',
    });
  }

  // Storage Management
  async getStorageUsage(): Promise<any> {
    return this.request('/upload/storage/usage');
  }

  async getStorageQuota(): Promise<any> {
    return this.request('/upload/storage/quota');
  }

  async cleanupStorage(): Promise<any> {
    return this.request('/upload/storage/cleanup', {
      method: 'POST',
    });
  }

  // File Processing
  async processFile(fileId: string, processingOptions: {
    type: 'resize' | 'compress' | 'convert' | 'extract-text' | 'generate-thumbnail';
    options?: any;
  }): Promise<any> {
    return this.request(`/upload/files/${fileId}/process`, {
      method: 'POST',
      body: JSON.stringify(processingOptions),
    });
  }

  async getProcessingStatus(processId: string): Promise<any> {
    return this.request(`/upload/process/${processId}/status`);
  }

  // File Sharing
  async createShareLink(fileId: string, options?: {
    expiresIn?: number;
    password?: string;
    allowDownload?: boolean;
    allowPreview?: boolean;
  }): Promise<{ shareUrl: string; shareId: string }> {
    return this.request(`/upload/files/${fileId}/share`, {
      method: 'POST',
      body: JSON.stringify(options || {}),
    });
  }

  async getShareInfo(shareId: string): Promise<any> {
    return this.request(`/upload/share/${shareId}`);
  }

  async updateShareSettings(shareId: string, updates: {
    expiresIn?: number;
    password?: string;
    allowDownload?: boolean;
    allowPreview?: boolean;
  }): Promise<any> {
    return this.request(`/upload/share/${shareId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteShareLink(shareId: string): Promise<void> {
    return this.request(`/upload/share/${shareId}`, {
      method: 'DELETE',
    });
  }

  // Additional upload methods for components
  async uploadAvatar(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(`${API_BASE_URL}/upload/avatar`, {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    return response.json();
  }

  async uploadCourseThumbnail(courseId: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('thumbnail', file);

    const response = await fetch(`${API_BASE_URL}/upload/course-thumbnail/${courseId}`, {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    return response.json();
  }

  async uploadLessonResource(lessonId: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('resource', file);

    const response = await fetch(`${API_BASE_URL}/upload/lesson-resource/${lessonId}`, {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    return response.json();
  }

  async uploadResource(file: File, type: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch(`${API_BASE_URL}/upload/resource`, {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    return response.json();
  }
}
