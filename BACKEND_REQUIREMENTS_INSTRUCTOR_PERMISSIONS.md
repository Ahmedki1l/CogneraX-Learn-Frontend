# Backend Requirements: Instructor Permissions & Course Assignment System

## Overview

This document outlines the backend implementation requirements for the hybrid permission system where instructors can be assigned to fields (full access) or specific courses (limited access).

**Status:** Frontend complete, awaiting backend implementation

**Frontend Changes:**
- ✅ Created `InstructorApiService` with `getAccessibleCourses()` method
- ✅ Updated `CourseManagement` component to display hierarchical field/course structure
- ✅ Added permission-based UI (Create/Edit/Delete buttons)
- ✅ Updated `CourseCreator` to filter fields based on permissions
- ✅ Integrated field filtering and access type badges

---

## Summary

This document contains all backend requirements for implementing the instructor permission system with hierarchical field/course display. The **critical priority** endpoint is:

**`GET /instructors/:instructorId/accessible-courses`** - Required for the frontend to display instructor's accessible fields and courses in hierarchical structure.

All other endpoints, middleware, and database schema updates are documented below.

---

## Permission Model

### Field-Level Assignment
- Instructors assigned to a field get **full permissions** for ALL courses in that field
- Permissions: `create_course`, `update_course`, `delete_course`, `view_analytics`
- Managed via existing API: `/fields/:id/assign-instructors`

### Course-Level Assignment
- Instructors assigned to specific courses (without field assignment)
- Can ONLY access assigned courses
- Permissions per course: `update_course`, `delete_course` (**NO `create_course`**)
- Requires new backend endpoints (documented below)

---

## New API Endpoints Required

### 1. Assign Instructors to Specific Courses

**Endpoint:** `POST /courses/:courseId/assign-instructors`  
**Access:** Admin with `manage_users` permission  
**Description:** Assign one or more instructors to a specific course

**Request Body:**
```json
{
  "instructorIds": ["instructorId1", "instructorId2"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "courseId": "courseId",
    "assignedInstructors": [
      {
        "id": "instructorId1",
        "name": "Instructor Name",
        "email": "instructor@example.com",
        "assignedAt": "2024-01-15T10:00:00.000Z",
        "permissions": ["update_course", "delete_course"]
      }
    ]
  },
  "message": "Instructors assigned successfully"
}
```

**Notes:**
- Instructors assigned at the course level cannot create new courses
- If an instructor is already assigned to the field containing this course, they should get field-level permissions (higher priority)
- Validate that instructors exist and are not students

---

### 2. Remove Instructors from Specific Courses

**Endpoint:** `DELETE /courses/:courseId/assign-instructors`  
**Access:** Admin with `manage_users` permission  
**Description:** Remove one or more instructors from a specific course

**Request Body:**
```json
{
  "instructorIds": ["instructorId1", "instructorId2"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "courseId": "courseId",
    "removedInstructors": ["instructorId1", "instructorId2"]
  },
  "message": "Instructors removed successfully"
}
```

**Notes:**
- Only remove course-level assignments
- Field-level assignments are not affected by this operation
- Validate that instructors are actually assigned to this course

---

### 3. Get Course Instructors

**Endpoint:** `GET /courses/:courseId/instructors`  
**Access:** Admin with `view_analytics` permission  
**Description:** Get all instructors assigned to a specific course

**Query Parameters:**
- `includeFields` (boolean, optional) - Include instructors assigned via field-level access

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "instructorId",
      "name": "Instructor Name",
      "email": "instructor@example.com",
      "assignedAt": "2024-01-15T10:00:00.000Z",
      "permissions": ["update_course", "delete_course"],
      "assignmentType": "course" // or "field"
    }
  ],
  "message": "Course instructors retrieved successfully"
}
```

**Notes:**
- `assignmentType` indicates whether access is direct (course) or through field (field)
- If `includeFields=true`, instructors with field-level access to the course's field should be included

---

### 4. Get Instructor's Accessible Courses (Hierarchical)

**Endpoint:** `GET /instructors/:instructorId/accessible-courses`  
**Access:** Instructor (self) or Admin  
**Description:** Get all fields and courses accessible to an instructor in hierarchical structure

**Response:**
```json
{
  "success": true,
  "data": {
    "fields": [
      {
        "_id": "fieldId1",
        "name": "Computer Science",
        "description": "Field Description",
        "icon": "📚",
        "accessType": "full",
        "courses": [
          {
            "_id": "courseId1",
            "title": "Course Title 1",
            "description": "Course Description",
            "status": "published",
            "students": 25,
            "lessons": 10
          },
          {
            "_id": "courseId2",
            "title": "Course Title 2",
            "description": "Course Description",
            "status": "draft",
            "students": 10,
            "lessons": 5
          }
        ],
        "permissions": ["create_course", "update_course", "delete_course", "view_analytics"]
      },
      {
        "_id": "fieldId2",
        "name": "Mathematics",
        "description": "Another Field",
        "icon": "💻",
        "accessType": "partial",
        "courses": [
          {
            "_id": "courseId3",
            "title": "Assigned Course Only",
            "description": "Course Description",
            "status": "published",
            "students": 15,
            "lessons": 8
          }
        ],
        "permissions": ["update_course", "delete_course", "view_analytics"]
      }
    ]
  }
}
```

**Backend Logic:**

1. Get instructor user document to retrieve global permissions
2. Get instructor's assigned fields (via field assignments)
3. For each assigned field, fetch ALL courses under that field
4. Add these fields to response with:
   - `accessType: "full"`
   - `permissions`: instructor's global permissions (e.g., `["create_course", "update_course", "delete_course", "view_analytics"]`)
5. Get instructor's assigned courses (course-level assignments)
6. For each assigned course:
   - Get its parent field
   - If parent field is already in assigned fields (from step 2), SKIP this course (already included in full field access)
   - If parent field is NOT in assigned fields:
     - Check if this field already exists in the response array (from other course assignments)
     - If field exists: add this course to that field's courses array
     - If field does NOT exist: create new field entry with:
       - `accessType: "partial"`
       - `permissions`: instructor's global permissions MINUS `create_course` (e.g., `["update_course", "delete_course", "view_analytics"]`)
       - Add only this course to the field
7. Return unified structure with all fields and their accessible courses

**Notes:**
- Single unified `fields` array (no separate assignedFields/assignedCourses)
- `accessType: "full"` = instructor assigned to entire field (sees all courses)
- `accessType: "partial"` = instructor assigned to specific courses only (sees only assigned courses)
- Fields with `accessType: "full"` include ALL courses under that field
- Fields with `accessType: "partial"` include ONLY assigned courses
- Each field includes its specific permissions array based on access type and instructor's global permissions
- Permissions are derived from the instructor's global permissions in the user document

---

## Permission Validation Middleware

The backend needs middleware to check instructor permissions before allowing course operations.

### Middleware Function: `checkCoursePermission(operation)`

```javascript
/**
 * Middleware to check if an instructor can perform an operation on a course
 * @param {string} operation - 'create_course', 'update_course', 'delete_course', 'view_analytics'
 */
function checkCoursePermission(operation) {
  return async (req, res, next) => {
    try {
      const instructor = req.user; // from JWT
      const courseId = req.params.id || req.params.courseId;
      
      // Get course details
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          error: { message: 'Course not found' }
        });
      }
      
      // Check permissions
      const hasAccess = await canAccessCourse(instructor, course, operation);
      
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: { 
            message: 'Insufficient permissions',
            code: 'PERMISSION_DENIED'
          }
        });
      }
      
      req.course = course;
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Permission check failed' }
      });
    }
  };
}
```

### Permission Check Logic

```javascript
/**
 * Check if instructor can access a course for a specific operation
 * @param {Object} instructor - Instructor user object
 * @param {Object} course - Course object
 * @param {string} operation - 'create_course', 'update_course', 'delete_course', 'view_analytics'
 * @returns {Promise<boolean>}
 */
async function canAccessCourse(instructor, course, operation) {
  // 1. Check global permission
  if (instructor.permissions && instructor.permissions.includes(operation)) {
    return true;
  }
  
  // 2. Check field-level assignment
  if (instructor.assignedFields && instructor.assignedFields.length > 0) {
    const fieldAccess = await Field.find({
      _id: { $in: instructor.assignedFields },
      _id: course.field
    });
    
    if (fieldAccess.length > 0) {
      return true; // Field-level access grants all permissions
    }
  }
  
  // 3. Check course-level assignment (NO create_course permission)
  if (operation !== 'create_course') {
    if (instructor.assignedCourses && instructor.assignedCourses.includes(course._id)) {
      return true;
    }
  }
  
  // 4. Check if instructor is the creator of the course
  if (course.createdBy && course.createdBy.toString() === instructor._id.toString()) {
    return true;
  }
  
  return false;
}
```

### Apply Middleware to Routes

```javascript
// Course Routes

// Create course - Check if instructor can create courses in this field
router.post('/courses', 
  authMiddleware,
  checkCoursePermission('create_course'),
  createCourse
);

// Update course
router.put('/courses/:id',
  authMiddleware,
  checkCoursePermission('update_course'),
  updateCourse
);

// Delete course
router.delete('/courses/:id',
  authMiddleware,
  checkCoursePermission('delete_course'),
  deleteCourse
);

// Get course details (for analytics)
router.get('/courses/:id',
  authMiddleware,
  checkCoursePermission('view_analytics'),
  getCourseById
);
```

---

## Database Schema Updates

### Users Collection

**New fields to add:**
```javascript
{
  // ... existing fields ...
  assignedFields: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Field',
    default: []
  }],
  assignedCourses: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course',
    default: []
  }],
  permissions: [{ type: String }] // existing field, keep as is
}
```

### Courses Collection

**New fields to add:**
```javascript
{
  // ... existing fields ...
  assignedInstructors: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: []
  }],
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  },
  field: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Field',
    required: true
  }
}
```

### Field Collection (existing)

**Ensure these relationships exist:**
```javascript
{
  // ... existing fields ...
  instructors: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  }]
}
```

---

## Implementation Priority

### Phase 1: Critical (Immediate) - **REQUIRED FOR FRONTEND**
1. ⚠️ GET `/instructors/:instructorId/accessible-courses` - **HIERARCHICAL ENDPOINT** (Frontend depends on this)
2. ⚠️ Middleware for permission checking on course operations
3. ⚠️ Database schema updates (add assignedCourses, assignedInstructors fields)
4. ⚠️ GET `/courses/:courseId/instructors` - List instructors for a course

### Phase 2: Course Assignment (High Priority)
1. POST `/courses/:courseId/assign-instructors` - Assign instructors to course
2. DELETE `/courses/:courseId/assign-instructors` - Remove instructors from course
3. GET `/users/:instructorId/assigned-courses` - List courses for an instructor

### Phase 3: Edge Cases (Nice to Have)
1. Handle conflicting assignments (course + field)
2. Bulk assignment endpoints
3. Assignment history/audit logging

---

## Testing Requirements

### Unit Tests
- Test `canAccessCourse()` function with various scenarios
- Test field-level vs course-level access
- Test permission hierarchies

### Integration Tests
- Test instructor assignment flows
- Test permission middleware with real requests
- Test concurrent course modifications

### Test Scenarios

```javascript
// Test Scenario 1: Field-level assignment
instructor.assignedFields = [fieldId];
course.field = fieldId;
canAccessCourse(instructor, course, 'create_course') // Should return true
canAccessCourse(instructor, course, 'update_course') // Should return true
canAccessCourse(instructor, course, 'delete_course') // Should return true

// Test Scenario 2: Course-level assignment
instructor.assignedCourses = [courseId];
course._id = courseId;
canAccessCourse(instructor, course, 'create_course') // Should return false
canAccessCourse(instructor, course, 'update_course') // Should return true
canAccessCourse(instructor, course, 'delete_course') // Should return true

// Test Scenario 3: No assignment
instructor.assignedFields = [];
instructor.assignedCourses = [];
canAccessCourse(instructor, course, 'create_course') // Should return false
canAccessCourse(instructor, course, 'update_course') // Should return false
```

---

## Migration Script

### Add to database migration script:

```javascript
// Add assignedCourses and assignedInstructors to Users collection
async function migrateUsers() {
  await User.updateMany(
    { assignedCourses: { $exists: false } },
    { $set: { assignedCourses: [] } }
  );
  
  await User.updateMany(
    { assignedFields: { $exists: false } },
    { $set: { assignedFields: [] } }
  );
}

// Add assignedInstructors to Courses collection
async function migrateCourses() {
  await Course.updateMany(
    { assignedInstructors: { $exists: false } },
    { $set: { assignedInstructors: [] } }
  );
}

// Run migrations
migrateUsers()
  .then(() => migrateCourses())
  .then(() => console.log('Migration completed'))
  .catch(err => console.error('Migration failed:', err));
```

---

## Error Handling

### Standard Error Responses

```json
// Permission Denied
{
  "success": false,
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "You do not have permission to perform this operation"
  }
}

// Course Not Found
{
  "success": false,
  "error": {
    "code": "COURSE_NOT_FOUND",
    "message": "Course not found"
  }
}

// Invalid Instructor
{
  "success": false,
  "error": {
    "code": "INVALID_INSTRUCTOR",
    "message": "One or more instructor IDs are invalid"
  }
}
```

---

## Notes for Backend Team

1. **Field-level takes precedence**: If an instructor has both field and course assignments to the same course, field-level permissions should apply
2. **Auto-assignment prevention**: When assigning instructors to a field, do NOT automatically assign them to all courses in that field. Keep field and course assignments separate
3. **Validation**: Always validate that users are instructors (not students) before assignment
4. **Audit logging**: Consider logging all assignment changes for compliance
5. **Performance**: Add indexes on `assignedFields`, `assignedCourses`, `assignedInstructors` for fast lookups

---

## Frontend Status

✅ Frontend UI is implemented and ready  
✅ Uses existing APIs for field assignment (fully functional)  
⏳ Uses stub APIs for course assignment (shows "pending backend" warnings)  
✅ All UI components are ready for backend integration

**The frontend will work immediately for:**
- Field-level instructor assignment
- Permission management (grant/revoke)
- Viewing instructor assignments

**The frontend will show warnings for:**
- Course-level instructor assignment (pending backend implementation)

---

## Contact

For questions or clarifications, contact the frontend development team.

**Last Updated:** January 2025

