# Backend API Requirements for AI Education Platform

## Overview

This document outlines the complete API requirements for the AI Education Platform frontend. The frontend has been fully integrated with these API endpoints, and all components are ready to work with real backend data.

## Base URL

```
http://localhost:5000/api/v1
```

## Authentication

All endpoints require JWT authentication via the `Authorization` header:
```
Authorization: Bearer <token>
```

## API Endpoints

### 1. User & Access Management

#### Create User
```http
POST /users
Content-Type: application/json

{
  "name": "string",
  "email": "string",
  "role": "string",
  "permissions": ["string"],
  "organizationId": "string"
}
```

#### Update User
```http
PUT /users/:id
Content-Type: application/json

{
  "name": "string",
  "email": "string",
  "role": "string",
  "permissions": ["string"]
}
```

#### Delete User
```http
DELETE /users/:id
```

#### Update User Role
```http
PATCH /users/:id/role
Content-Type: application/json

{
  "role": "string"
}
```

#### Update User Permissions
```http
PATCH /users/:id/permissions
Content-Type: application/json

{
  "permissions": ["string"]
}
```

#### Bulk User Actions
```http
POST /users/bulk
Content-Type: application/json

{
  "action": "string",
  "userIds": ["string"]
}
```

#### Export Users
```http
GET /users/export?filters={}
```

### 2. System Administration

#### Get System Metrics
```http
GET /system/metrics
```

#### Get Audit Logs
```http
GET /system/audit-logs?filter={}&date={}
```

#### Get Backups
```http
GET /system/backups
```

#### Create Backup
```http
POST /system/backups
```

#### Restore Backup
```http
POST /system/backups/:id/restore
```

#### Get Compliance Reports
```http
GET /system/compliance-reports
```

### 3. Platform Configuration

#### Get Integrations
```http
GET /config/integrations
```

#### Update Integration
```http
PUT /config/integrations/:id
Content-Type: application/json

{
  "config": {}
}
```

#### Get Feature Flags
```http
GET /config/feature-flags
```

#### Update Feature Flag
```http
PATCH /config/feature-flags/:id
Content-Type: application/json

{
  "enabled": boolean
}
```

#### Get Branding Settings
```http
GET /config/branding
```

#### Update Branding Settings
```http
PUT /config/branding
Content-Type: application/json

{
  "organizationName": "string",
  "tagline": "string",
  "primaryColor": "string",
  "secondaryColor": "string",
  "customCSS": "string",
  "customFooter": "string",
  "hideDefaultBranding": boolean
}
```

### 4. AI Credits Management

#### Get AI Credits Balance
```http
GET /ai-credits/balance
```

#### Get AI Credits Stats
```http
GET /ai-credits/stats
```

#### Get AI Credits History
```http
GET /ai-credits/history?filters={}
```

#### Allocate AI Credits
```http
POST /ai-credits/allocate
Content-Type: application/json

{
  "instructorId": "string",
  "amount": number,
  "reason": "string"
}
```

#### Bulk Allocate Credits
```http
POST /ai-credits/bulk-allocate
Content-Type: application/json

{
  "allocations": [
    {
      "instructorId": "string",
      "amount": number,
      "reason": "string"
    }
  ]
}
```

#### Get Instructor Credits
```http
GET /ai-credits/instructors?filters={}
```

### 5. Students Management

#### Get Students
```http
GET /students?course={}&search={}
```

#### Get Student Details
```http
GET /students/:id
```

#### Get Student Progress
```http
GET /students/:id/progress
```

#### Invite Students
```http
POST /students/invite
Content-Type: application/json

{
  "emails": ["string"]
}
```

#### Export Students Data
```http
GET /students/export?filters={}
```

### 6. Analytics

#### Get Platform Analytics
```http
GET /analytics/platform?period={}
```

#### Get User Engagement Stats
```http
GET /analytics/engagement?period={}
```

#### Get Revenue Analytics
```http
GET /analytics/revenue?period={}
```

#### Get Predictive Analytics
```http
GET /analytics/predictive
```

#### Export Analytics Report
```http
GET /analytics/export/:type?filters={}
```

## Response Format

All API responses should follow this format:

```json
{
  "success": boolean,
  "data": any,
  "message": "string",
  "token": "string", // For auth endpoints
  "refreshToken": "string" // For auth endpoints
}
```

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "string",
    "message": "string",
    "details": {}
  }
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Authentication Flow

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}
```

### Refresh Token
```http
POST /auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "string"
}
```

### Logout
```http
POST /auth/logout
```

## Data Models

### User
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}
```

### System Metrics
```typescript
interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  activeUsers: number;
  totalRequests: number;
  errorRate: number;
  uptime: number;
}
```

### AI Credits
```typescript
interface AICredits {
  total: number;
  used: number;
  remaining: number;
  monthlyUsage: number;
  lastPurchased: string;
  nextRenewal: string;
}
```

### Student
```typescript
interface Student {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  course: string;
  progress: number;
  lastActive: string;
  status: 'active' | 'inactive';
  grade: string;
  assignmentsCompleted: number;
  totalAssignments: number;
  joinDate: string;
}
```

## Implementation Notes

1. **Pagination**: All list endpoints should support pagination with `page` and `limit` query parameters.

2. **Filtering**: Support filtering with query parameters for relevant endpoints.

3. **Search**: Implement search functionality for user and student endpoints.

4. **Real-time Updates**: Consider implementing WebSocket connections for real-time data updates.

5. **Rate Limiting**: Implement rate limiting to prevent abuse.

6. **Caching**: Consider implementing caching for frequently accessed data.

7. **Logging**: Implement comprehensive logging for all API calls.

8. **Validation**: Implement proper input validation and sanitization.

9. **Security**: Ensure all endpoints are properly secured and validated.

10. **Documentation**: Maintain up-to-date API documentation.

## Testing

The frontend has been tested with mock data and is ready for integration with the real backend. All components include:

- Loading states
- Error handling
- Fallback to mock data when API calls fail
- Real-time updates where applicable
- Proper user feedback via toast notifications

## Next Steps

1. Implement all API endpoints according to this specification
2. Set up proper authentication and authorization
3. Implement database models and migrations
4. Add comprehensive error handling
5. Implement logging and monitoring
6. Set up testing environment
7. Deploy to staging environment
8. Conduct integration testing with frontend
9. Deploy to production

## Contact

For questions or clarifications about these API requirements, please contact the frontend development team.

