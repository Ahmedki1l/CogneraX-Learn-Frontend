# Lesson Creation Frontend Integration Guide

## Overview

This guide explains how to create lessons with video and resource file uploads using the API endpoint. The endpoint accepts `multipart/form-data` to allow file uploads alongside lesson metadata.

---

## Endpoint

```
POST /api/v1/courses/:courseId/lessons
```

**Authentication:** Required (JWT token in `Authorization` header)  
**Authorization:** Instructor or Admin only  
**Content-Type:** `multipart/form-data`

---

## Request Format

### Required Fields

| Field Name | Type | Description |
|------------|------|-------------|
| `title` | String | Lesson title (required) |
| `order` | Number | Lesson order/sequence (optional, auto-incremented if not provided) |

### Optional Text Fields

| Field Name | Type | Description |
|------------|------|-------------|
| `description` | String | Lesson description |
| `content` | String | Lesson content/text (HTML or plain text) |
| `isPreview` | Boolean/String | Whether lesson is a preview (default: false) |
| `estimatedTime` | Number/String | Estimated completion time in minutes |
| `quizzes` | String/Array | Comma-separated quiz IDs or array of quiz IDs |

### Video Upload Fields

| Field Name | Type | Description |
|------------|------|-------------|
| `video` | File | Single video file (optional) |
| `videoTitle` | String | Video title (defaults to original filename) |
| `videoDescription` | String | Video description |
| `videoDuration` | Number/String | Video duration in seconds |
| `videoThumbnail` | String | Video thumbnail URL (if available separately) |
| `videoTranscript` | String | Video transcript text |

**Accepted Video Formats:** mp4, avi, mov, wmv, flv, mkv, webm  
**Max Video Size:** 100MB

### Resource Upload Fields

| Field Name | Type | Description |
|------------|------|-------------|
| `resources` | File[] | Multiple resource files (optional, max 10) |
| `resourceTitles[]` | String[] | Array of titles for each resource (defaults to original filenames) |
| `resourceTypes[]` | String[] | Array of resource types: 'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'link', 'code', 'image', 'video', 'audio', 'other' (auto-detected if not provided) |
| `resourceDescriptions[]` | String[] | Array of descriptions for each resource |
| `resourceDownloadable` | Boolean/String | Whether resources are downloadable (default: true) |

**Accepted Resource Formats:** pdf, doc, docx, xls, xlsx, ppt, pptx, txt, mp4, avi, mov, wmv, flv, mkv, webm, jpeg, jpg, png, gif, webp  
**Max Resources:** 10 files  
**Max File Size:** 100MB per file

---

## Response

### Success Response (201 Created)

```json
{
  "success": true,
  "data": {
    "_id": "60f7b3c4e4b0a1234567890a",
    "courseId": "60f7b3c4e4b0a1234567890b",
    "title": "Introduction to JavaScript",
    "description": "Learn the basics of JavaScript programming",
    "content": "<p>JavaScript is a programming language...</p>",
    "order": 1,
    "isPreview": false,
    "estimatedTime": 30,
    "video": {
      "url": "https://cdn.example.com/videos/video-1234567890.mp4",
      "title": "Introduction Video",
      "description": "Watch this video to get started",
      "duration": 1200,
      "thumbnail": null,
      "transcript": null
    },
    "resources": [
      {
        "title": "JavaScript Cheat Sheet",
        "type": "pdf",
        "url": "https://cdn.example.com/resource/resource-1234567890.pdf",
        "size": 524288,
        "description": "Quick reference guide",
        "isDownloadable": true,
        "uploadedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "quizzes": [],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Error Response (400 Bad Request)

```json
{
  "success": false,
  "error": {
    "message": "Course not found"
  }
}
```

### Error Response (403 Forbidden)

```json
{
  "success": false,
  "error": {
    "message": "Not authorized to add lessons to this course"
  }
}
```

---

## JavaScript/React Examples

### Example 1: Basic Lesson Creation (No Files)

```javascript
const createLessonWithoutFiles = async (courseId, lessonData, token) => {
  const formData = new FormData();
  
  // Required fields
  formData.append('title', lessonData.title);
  formData.append('order', lessonData.order || '1');
  
  // Optional text fields
  if (lessonData.description) {
    formData.append('description', lessonData.description);
  }
  if (lessonData.content) {
    formData.append('content', lessonData.content);
  }
  if (lessonData.isPreview !== undefined) {
    formData.append('isPreview', lessonData.isPreview);
  }
  if (lessonData.estimatedTime) {
    formData.append('estimatedTime', lessonData.estimatedTime);
  }

  try {
    const response = await fetch(`/api/v1/courses/${courseId}/lessons`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to create lesson');
    }

    return result.data;
  } catch (error) {
    console.error('Error creating lesson:', error);
    throw error;
  }
};
```

### Example 2: Lesson with Video Upload

```javascript
const createLessonWithVideo = async (courseId, lessonData, videoFile, token) => {
  const formData = new FormData();
  
  // Required fields
  formData.append('title', lessonData.title);
  formData.append('order', lessonData.order || '1');
  
  // Video file
  formData.append('video', videoFile);
  
  // Video metadata
  if (lessonData.videoTitle) {
    formData.append('videoTitle', lessonData.videoTitle);
  }
  if (lessonData.videoDescription) {
    formData.append('videoDescription', lessonData.videoDescription);
  }
  if (lessonData.videoDuration) {
    formData.append('videoDuration', lessonData.videoDuration);
  }
  
  // Other optional fields
  if (lessonData.description) {
    formData.append('description', lessonData.description);
  }

  try {
    const response = await fetch(`/api/v1/courses/${courseId}/lessons`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to create lesson');
    }

    return result.data;
  } catch (error) {
    console.error('Error creating lesson with video:', error);
    throw error;
  }
};
```

### Example 3: Lesson with Multiple Resources

```javascript
const createLessonWithResources = async (courseId, lessonData, resourceFiles, token) => {
  const formData = new FormData();
  
  // Required fields
  formData.append('title', lessonData.title);
  formData.append('order', lessonData.order || '1');
  
  // Append all resource files
  resourceFiles.forEach((file) => {
    formData.append('resources', file);
  });
  
  // Resource metadata arrays
  if (lessonData.resourceTitles && lessonData.resourceTitles.length > 0) {
    lessonData.resourceTitles.forEach((title) => {
      formData.append('resourceTitles[]', title);
    });
  }
  
  if (lessonData.resourceTypes && lessonData.resourceTypes.length > 0) {
    lessonData.resourceTypes.forEach((type) => {
      formData.append('resourceTypes[]', type);
    });
  }
  
  if (lessonData.resourceDescriptions && lessonData.resourceDescriptions.length > 0) {
    lessonData.resourceDescriptions.forEach((desc) => {
      formData.append('resourceDescriptions[]', desc);
    });
  }

  try {
    const response = await fetch(`/api/v1/courses/${courseId}/lessons`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to create lesson');
    }

    return result.data;
  } catch (error) {
    console.error('Error creating lesson with resources:', error);
    throw error;
  }
};
```

### Example 4: Complete Lesson Creation (Video + Resources)

```javascript
const createCompleteLesson = async (courseId, lessonData, token) => {
  const formData = new FormData();
  
  // Required fields
  formData.append('title', lessonData.title);
  formData.append('order', lessonData.order || '1');
  
  // Optional text fields
  if (lessonData.description) formData.append('description', lessonData.description);
  if (lessonData.content) formData.append('content', lessonData.content);
  if (lessonData.isPreview !== undefined) formData.append('isPreview', lessonData.isPreview);
  if (lessonData.estimatedTime) formData.append('estimatedTime', lessonData.estimatedTime);
  
  // Video upload
  if (lessonData.videoFile) {
    formData.append('video', lessonData.videoFile);
    if (lessonData.videoTitle) formData.append('videoTitle', lessonData.videoTitle);
    if (lessonData.videoDescription) formData.append('videoDescription', lessonData.videoDescription);
    if (lessonData.videoDuration) formData.append('videoDuration', lessonData.videoDuration);
  }
  
  // Resources upload
  if (lessonData.resourceFiles && lessonData.resourceFiles.length > 0) {
    lessonData.resourceFiles.forEach((file) => {
      formData.append('resources', file);
    });
    
    if (lessonData.resourceTitles) {
      lessonData.resourceTitles.forEach((title) => {
        formData.append('resourceTitles[]', title);
      });
    }
    
    if (lessonData.resourceTypes) {
      lessonData.resourceTypes.forEach((type) => {
        formData.append('resourceTypes[]', type);
      });
    }
    
    if (lessonData.resourceDescriptions) {
      lessonData.resourceDescriptions.forEach((desc) => {
        formData.append('resourceDescriptions[]', desc);
      });
    }
  }
  
  // Quizzes
  if (lessonData.quizzes && lessonData.quizzes.length > 0) {
    lessonData.quizzes.forEach((quizId) => {
      formData.append('quizzes[]', quizId);
    });
  }

  try {
    const response = await fetch(`/api/v1/courses/${courseId}/lessons`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to create lesson');
    }

    return result.data;
  } catch (error) {
    console.error('Error creating lesson:', error);
    throw error;
  }
};
```

### Example 5: React Component with Upload Progress

```jsx
import React, { useState } from 'react';

const LessonCreationForm = ({ courseId, token, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: '',
    videoFile: null,
    resourceFiles: [],
    uploadProgress: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === 'video') {
      setFormData({ ...formData, videoFile: files[0] });
    } else if (name === 'resources') {
      setFormData({ ...formData, resourceFiles: Array.from(files) });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data = new FormData();
    
    // Required
    data.append('title', formData.title);
    data.append('order', formData.order || '1');
    
    // Optional
    if (formData.description) {
      data.append('description', formData.description);
    }
    
    // Video
    if (formData.videoFile) {
      data.append('video', formData.videoFile);
    }
    
    // Resources
    formData.resourceFiles.forEach((file) => {
      data.append('resources', file);
    });

    try {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setFormData({ ...formData, uploadProgress: progress });
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 201) {
          const result = JSON.parse(xhr.responseText);
          onSuccess(result.data);
          // Reset form
          setFormData({
            title: '',
            description: '',
            order: '',
            videoFile: null,
            resourceFiles: [],
            uploadProgress: 0
          });
        } else {
          const result = JSON.parse(xhr.responseText);
          setError(result.error?.message || 'Failed to create lesson');
        }
        setLoading(false);
      });

      xhr.addEventListener('error', () => {
        setError('Network error occurred');
        setLoading(false);
      });

      xhr.open('POST', `/api/v1/courses/${courseId}/lessons`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(data);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Title *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div>
        <label>Order</label>
        <input
          type="number"
          value={formData.order}
          onChange={(e) => setFormData({ ...formData, order: e.target.value })}
        />
      </div>

      <div>
        <label>Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div>
        <label>Video</label>
        <input
          type="file"
          name="video"
          accept="video/*"
          onChange={handleFileChange}
        />
      </div>

      <div>
        <label>Resources</label>
        <input
          type="file"
          name="resources"
          multiple
          onChange={handleFileChange}
        />
      </div>

      {formData.uploadProgress > 0 && formData.uploadProgress < 100 && (
        <div>
          <progress value={formData.uploadProgress} max="100" />
          <span>{Math.round(formData.uploadProgress)}%</span>
        </div>
      )}

      {error && <div className="error">{error}</div>}

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Lesson'}
      </button>
    </form>
  );
};

export default LessonCreationForm;
```

---

## Error Handling

### Common Errors

1. **400 Bad Request - Invalid File Type**
   ```json
   {
     "success": false,
     "error": {
       "message": "Error: Invalid file type for videos. Only mp4|avi|mov|wmv|flv|mkv|webm files are allowed."
     }
   }
   ```
   **Solution:** Ensure video files are in supported formats.

2. **400 Bad Request - File Too Large**
   ```json
   {
     "success": false,
     "error": {
       "message": "File too large"
     }
   }
   ```
   **Solution:** Ensure files are under 100MB limit.

3. **403 Forbidden - Not Authorized**
   ```json
   {
     "success": false,
     "error": {
       "message": "Not authorized to add lessons to this course"
     }
   }
   ```
   **Solution:** User must be the course instructor or an admin.

4. **404 Not Found - Course Not Found**
   ```json
   {
     "success": false,
     "error": {
       "message": "Course not found"
     }
   }
   ```
   **Solution:** Verify the course ID is correct and the course exists.

---

## File Size and Type Limits

### Video Files
- **Max Size:** 100MB
- **Allowed Types:** mp4, avi, mov, wmv, flv, mkv, webm

### Resource Files
- **Max Size:** 100MB per file
- **Max Count:** 10 files
- **Allowed Types:** pdf, doc, docx, xls, xlsx, ppt, pptx, txt, mp4, avi, mov, wmv, flv, mkv, webm, jpeg, jpg, png, gif, webp

---

## Progress Indication for Large Uploads

For better UX when uploading large files, use XMLHttpRequest instead of fetch to track upload progress:

```javascript
const uploadWithProgress = (courseId, formData, token, onProgress) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percentComplete = (e.loaded / e.total) * 100;
        onProgress(percentComplete);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 201) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(xhr.responseText));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error'));
    });

    xhr.open('POST', `/api/v1/courses/${courseId}/lessons`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.send(formData);
  });
};
```

---

## Backward Compatibility

The endpoint maintains backward compatibility with JSON requests (without files). You can still create lessons using JSON:

```javascript
fetch(`/api/v1/courses/${courseId}/lessons`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'Lesson Title',
    order: 1,
    description: 'Lesson description',
    video: {
      url: 'https://external-video-url.com/video.mp4',
      title: 'Video Title'
    },
    resources: [
      {
        title: 'Resource Title',
        type: 'pdf',
        url: 'https://external-resource-url.com/file.pdf'
      }
    ]
  })
});
```

---

## Best Practices

1. **Validate Files Client-Side**: Check file size and type before uploading to provide immediate feedback.
2. **Show Progress**: Use XMLHttpRequest for large file uploads to show progress to users.
3. **Handle Errors Gracefully**: Display user-friendly error messages based on error responses.
4. **Optimize File Sizes**: Consider compressing videos and images before upload.
5. **Provide Metadata**: Always include meaningful titles and descriptions for uploaded files.
6. **Test File Types**: Ensure your frontend validates file types before submission.

---

## Testing

### Using curl

```bash
# Create lesson with video
curl -X POST http://localhost:5000/api/v1/courses/COURSE_ID/lessons \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Introduction to JavaScript" \
  -F "order=1" \
  -F "description=Learn JavaScript basics" \
  -F "video=@/path/to/video.mp4" \
  -F "videoTitle=Introduction Video"
```

```bash
# Create lesson with resources
curl -X POST http://localhost:5000/api/v1/courses/COURSE_ID/lessons \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=JavaScript Fundamentals" \
  -F "order=2" \
  -F "resources=@/path/to/resource1.pdf" \
  -F "resources=@/path/to/resource2.doc" \
  -F "resourceTitles[]=JavaScript Cheat Sheet" \
  -F "resourceTitles[]=Practice Exercises"
```

