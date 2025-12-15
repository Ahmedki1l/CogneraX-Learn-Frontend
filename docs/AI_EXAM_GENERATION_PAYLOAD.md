# AI Exam Generation Payload

The frontend sends the following payload to `POST /api/v1/ai/generate-exam`.

```json
{
  "content": "Concatenated resource excerpts and optional instructor instructions",
  "courseId": "<course-id>",
  "language": "en | ar | auto",
  "examConfig": {
    "title": "Final Exam – React Development",
    "totalQuestions": 20,
    "duration": 60,
    "difficultyDistribution": {
      "easy": 30,
      "medium": 50,
      "hard": 20
    },
    "fieldId": "<field-id>",
    "questionTypes": [
      "multiple-choice",
      "true-false",
      "essay"
    ],
    "questionTypeDistribution": {
      "multiple-choice": 12,
      "true-false": 5,
      "essay": 3
    },
    "resourceSelections": [
      {
        "lessonId": "<lesson-id-1>",
        "resourceIds": ["<resource-id-1>", "<resource-id-2>"]
      },
      {
        "lessonId": "<lesson-id-2>",
        "resourceIds": ["<resource-id-3>"]
      }
    ],
    "resourceMetadata": [
      {
        "lessonId": "<lesson-id-1>",
        "lessonTitle": "Lesson 1",
        "resourceId": "<resource-id-1>",
        "resourceTitle": "VMS AI Features Plan",
        "resourceType": "docx"
      }
    ],
    "instructions": "Any extra instructor guidance (optional)"
  },
  "autoAddToBank": true
}
```

**Notes**

- `content` is a fallback string assembled from selected resources. When the resource is binary (e.g. DOCX), it may contain only a label; the backend should read the referenced resource IDs for full context.
- `questionTypes` is limited to `multiple-choice`, `true-false`, and `essay`.
- `questionTypeDistribution` maps each selected question type to the number of questions requested. The sum must equal `totalQuestions`.
- `resourceSelections` lists chosen lessons and resources. `resourceMetadata` mirrors this for logging/tracing and can be ignored if not needed.
- `language` accepts `en`, `ar`, or `auto` (mirror resource language).
