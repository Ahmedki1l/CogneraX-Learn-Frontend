# Gradebook Backend Requirements

This document describes the backend endpoints needed to fully power the instructor Gradebook. All endpoints require JWT authentication.

## 1) Gradebook Overview
- **GET** `/courses/:courseId/gradebook/overview`
- Returns aggregated stats for the course.
```json
{
  "success": true,
  "data": {
    "totalAssignments": 12,
    "activeAssignments": 4,
    "completedAssignments": 8,
    "totalExams": 3,
    "pendingGrades": 23,
    "pendingAssignmentGrades": 15,
    "pendingExamGrades": 8,
    "classAverage": 84.2,
    "classAverageDelta": 2.1,
    "completionRate": 91,
    "averageProgress": 88.5,
    "totalStudents": 45,
    "activeStudents": 41
  }
}
```

## 2) Gradebook Students
- **GET** `/courses/:courseId/gradebook/students`
- Query params: `page`, `limit`, `search`, `status` (optional)
- Returns enrolled students with assignment/exam grades.
```json
{
  "success": true,
  "data": {
    "students": [
      {
        "id": "student_id",
        "name": "John Doe",
        "email": "john@example.com",
        "avatar": "JD",
        "overall": 85.5,
        "assignments": {
          "assignment_id": {
            "assignmentId": "assignment_id",
            "score": 90,
            "maxPoints": 100,
            "submitted": true,
            "late": false,
            "feedback": "Great work"
          }
        },
        "exams": {
          "exam_id": {
            "examId": "exam_id",
            "score": 82,
            "maxScore": 100,
            "percentage": 82,
            "letterGrade": "B",
            "status": "graded"
          }
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 2,
      "totalPages": 1
    }
  }
}
```

## 3) Student Grade Detail
- **GET** `/courses/:courseId/gradebook/students/:studentId`
- Detailed breakdown for one student (assignments + exams + analytics).
```json
{
  "success": true,
  "data": {
    "studentId": "student_id",
    "overall": 85.5,
    "assignments": [
      {
        "id": "assignment_id",
        "title": "Essay 1",
        "score": 90,
        "maxPoints": 100,
        "submittedAt": "2024-02-01T10:00:00Z",
        "late": false,
        "feedback": "Good structure"
      }
    ],
    "exams": [
      {
        "id": "exam_id",
        "title": "Midterm",
        "score": 82,
        "maxScore": 100,
        "percentage": 82,
        "letterGrade": "B",
        "gradedAt": "2024-02-02T12:00:00Z"
      }
    ],
    "statistics": {
      "submissionsOnTime": 10,
      "lateSubmissions": 2,
      "averageScore": 85.5,
      "improvementTrend": 5.2
    }
  }
}
```

## 4) Rubrics
- **GET** `/courses/:courseId/rubrics`
- **POST** `/courses/:courseId/rubrics`
- **PUT** `/rubrics/:rubricId`
- **DELETE** `/rubrics/:rubricId`
- Rubric shape:
```json
{
  "id": "rubric_id",
  "name": "Problem Solving Rubric",
  "courseId": "course_id",
  "criteria": [
    {
      "id": "criterion_id",
      "name": "Understanding",
      "weight": 25,
      "levels": [
        { "points": 4, "description": "Complete understanding" },
        { "points": 3, "description": "Substantial understanding" },
        { "points": 2, "description": "Partial understanding" },
        { "points": 1, "description": "Little understanding" },
        { "points": 0, "description": "No understanding" }
      ]
    }
  ]
}
```

## 5) Gradebook Export / Import
- **GET** `/courses/:courseId/gradebook/export?format=csv|json`
  - Returns file download (CSV or JSON)
- **POST** `/courses/:courseId/gradebook/import` (optional/future)
  - Body: file upload for bulk grade import

## 6) Authentication & Roles
- All endpoints require JWT auth
- Roles: Instructor/Admin (course owner) for all gradebook endpoints

## 7) Notes
- Responses may be wrapped in `{ success, data }`
- Pagination recommended for student list
- Numeric fields should be numbers; percentages as numbers (0-100)
- Time values should be ISO strings
