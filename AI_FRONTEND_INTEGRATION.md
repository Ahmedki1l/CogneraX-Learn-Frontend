<!-- Frontend guidance for AI features -->
# AI Features Frontend Integration Guide

## Overview
The backend exposes a suite of AI-powered endpoints under `/api/v1/ai` (unless a different `API_VERSION` is configured). This guide outlines how frontend clients should interact with these routes, with emphasis on the new language-selection support and the required session-minute payload for teaching plan generation.

All routes require an authenticated user. Authorization varies by endpoint and is noted in the table below.

## Language Handling
- Every AI generation endpoint now accepts an optional `language` string in the request body.
- Supported values:
  - Explicit locale or language name (e.g. `English`, `Arabic`, `Spanish`).
  - `"auto"` to request that the model mirror the language of the submitted content.
  - If omitted, the backend defaults to English.
- The language value is passed to Gemini and echoed in the response payloads (e.g. `data.language`). Downstream consumers should rely on this field to determine the output locale.
- For question/exam generation, the stored `aiGenerated.language` metadata will contain the same value (defaulting to `en`).

## Teaching Plan Session Minutes
- `POST /api/v1/ai/generate-teaching-plan` now **requires** a `sessionMinutes` numeric field.
- This field replaces the previous `sessionDuration` name; for backward compatibility the backend will still accept `sessionDuration`, but clients **must** send `sessionMinutes`.
- The backend returns `sessionMinutes` in the response payload for UI confirmation.

## Endpoint Reference

| Endpoint | Method | Access | Key Payload Fields | Notes |
| --- | --- | --- | --- | --- |
| `/ai/analyze-content` | POST | Instructor/Admin | `content`, `analysisType?`, `language?` | Returns content diagnostics, credit usage, and `language`. |
| `/ai/recreate-content` | POST | Instructor/Admin | `originalContent`, `enhancementType?`, `language?` | Produces enhanced content and metadata in the requested language. |
| `/ai/generate-teaching-plan` | POST | Instructor/Admin | `content`, `sessionMinutes`, `studentLevel?`, `learningObjectives?`, `teachingStyle?`, `language?` | Generates plan JSON; response includes `sessionMinutes` and `language`. |
| `/ai/generate-questions` | POST | Instructor/Admin | `content`, `courseId`, `count`, `questionTypes?`, `difficulty?`, `autoAddToBank?`, `language?` | Questions appear in `data.questions`; when `autoAddToBank` is true, `aiGenerated.language` metadata records the requested language. |
| `/ai/generate-exam` | POST | Instructor/Admin | `content`, `courseId`, `examConfig`, `autoAddToBank?`, `language?` | Returns exam structure and copied `language` metadata. |
| `/ai/grade-essay` | POST | Instructor/Admin | `essayContent`, `rubric`, `maxScore?`, `submissionId?`, `language?` | Responds with grading JSON in the specified language. |
| `/ai/history` | GET | Any authenticated user | `type?`, `startDate?`, `endDate?`, `page?`, `limit?` | Returns paginated AI interaction history for the current user (analyze, recreate, teaching-plan, etc.). |
| `/ai/credits/balance` | GET | Any authenticated user | (query only) | Returns latest credit balance snapshot. |
| `/ai/credits/allocate` | POST | Admin | `userId`, `amount`, `description?` | Allocates credits to a user and logs the action. |
| `/ai/ai-credits/stats` | GET | Admin or org admin with `manage_ai_credits` | `organizationId?` | Provides aggregate usage statistics; `language` not applicable. |
| `/ai/ai-credits/history` | GET | Admin or org admin with `manage_ai_credits` | `userId?`, `organizationId?`, `type?`, `startDate?`, `endDate?`, `page?`, `limit?` | Returns paginated transaction history. |
| `/ai/ai-credits/bulk-allocate` | POST | Admin or org admin with `manage_ai_credits` | `allocations[]` (entries: `instructorId`, `amount`, `reason?`) | Bulk credit distribution; response includes successes and failures. |
| `/ai/ai-credits/instructors` | GET | Admin or org admin with `manage_ai_credits` | `organizationId?`, `minCredits?`, `maxCredits?`, `hasCredits?`, `search?`, `page?`, `limit?`, `sortBy?`, `sortOrder?` | Lists instructors and credit metrics. |

## Payload Examples

### Generate Teaching Plan (Arabic)
```json
{
  "content": "درس عن مفاهيم الذكاء الاصطناعي للمرحلة الثانوية.",
  "sessionMinutes": 60,
  "studentLevel": "advanced",
  "learningObjectives": [
    "التعرف على تطبيقات الذكاء الاصطناعي",
    "تحليل آثار الذكاء الاصطناعي على المجتمع"
  ],
  "teachingStyle": "discussion-based",
  "language": "Arabic"
}
```

### Generate Questions (Auto-detect Language)
```json
{
  "content": "Explain the process of photosynthesis.",
  "courseId": "<course-id>",
  "count": 5,
  "questionTypes": ["multiple-choice", "short-answer"],
  "difficulty": "medium",
  "language": "auto",
  "autoAddToBank": true
}
```

### Grade Essay (Spanish Output)
```json
{
  "essayContent": "El ensayo completo del estudiante...",
  "rubric": "Criterios detallados...",
  "maxScore": 50,
  "submissionId": "<optional-submission-id>",
  "language": "Spanish"
}
```

## Frontend Implementation Tips
- **Language selector:** Provide a dropdown or locale picker tied to the `language` field. Offer “Same as content” mapped to `"auto"` for convenience.
- **Validation:** Ensure `sessionMinutes` is a positive integer and included before calling the teaching plan endpoint.
- **Responses:** Respect `data.language`, `data.sessionMinutes`, and `data.aiCredits` (returned via `/api/v1/auth/me`) when rendering results. For question/exam generation, rely on `data.language` to set UI context (e.g. text direction).
- **Error handling:** Expect `400` for missing inputs, `403` for insufficient credits or permissions, and parse `error.message` from the JSON body.
- **Credits awareness:** Surface balances from `/api/v1/auth/me` (for per-user dashboard displays) and `/ai/credits/balance` (for real-time checks) to keep users informed about consumption.
- **History UI:** Use `/api/v1/ai/history` to list recent AI interactions. Provide filters matching `type`, `startDate`, `endDate`, `page`, and `limit` to mirror backend capabilities.

Keep this guide aligned with backend updates; when new AI endpoints launch, extend the table and examples accordingly.

