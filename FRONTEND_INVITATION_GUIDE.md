# Frontend Invitation System Integration Guide

## 📋 Overview

This guide explains how to integrate the invitation system in your frontend application. The system supports role-based invitations (instructor and student) with multi-use links and automatic organization assignment.

### Key Features

- **Role-Based Invitations**: Admin creates separate invitations for instructors and students
- **Multi-Use Links**: One invitation link can be used by multiple people (up to maxUses)
- **Security**: Role is determined by the invitation token, not user input
- **Auto-Verification**: Invited users are automatically email-verified
- **Organization Assignment**: Users are automatically assigned to the admin's organization

### Flow Diagram

```
Admin Dashboard → Create Invitation → Get Invitation URL → Share URL
                                                              ↓
User Receives URL → Opens Signup Page → Fills Form → Creates Account
                                                              ↓
Backend: Assigns Role & Organization → Returns JWT Token → Redirect to Dashboard
```

---

## 🔐 Admin Dashboard - Creating Invitations

### API Endpoint

**POST** `/api/v1/invitations`

### Authentication

All admin endpoints require a valid JWT token in the Authorization header.

### Request

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "role": "instructor",        // Required: "instructor" or "student"
  "message": "Welcome message", // Optional: Message to display on signup page
  "description": "Join us",     // Optional: Additional description
  "expiresInDays": 7,           // Optional: Default 7 days
  "maxUses": 50                 // Optional: Default 50 uses
}
```

### Response

**Success (201 Created):**
```json
{
  "success": true,
  "data": {
    "invitation": {
      "id": "67890abcdef1234567890",
      "token": "abc123def456ghi789jkl012mno345pqr678stu901vwx234yz",
      "role": "instructor",
      "organization": {
        "id": "68df97e055c4cf64009c9401",
        "name": "CogneraX Education",
        "logo": "https://example.com/logo.png",
        "primaryColor": "#1a73e8",
        "secondaryColor": "#34a853"
      },
      "invitationUrl": "http://localhost:3000/invite/abc123def456ghi789jkl012mno345pqr678stu901vwx234yz",
      "expiresAt": "2024-02-15T00:00:00.000Z",
      "status": "active",
      "maxUses": 50,
      "currentUses": 0,
      "remainingUses": 50
    }
  }
}
```

**Error (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "message": "Role must be either student or instructor"
  }
}
```

### UI Components Needed

1. **Create Invitation Buttons**
   - "Invite Instructors" button
   - "Invite Students" button

2. **Configuration Modal**
   - Role selector (hidden, auto-filled by button)
   - Message textarea (optional)
   - Description input (optional)
   - Expiration days input (default: 7)
   - Max uses input (default: 50)

3. **Invitation URL Display**
   - Show generated URL
   - Copy to clipboard button
   - QR code generator (optional)

4. **Invitation Table**
   - List all invitations
   - Filter by role and status
   - Show remaining uses
   - Actions: View, Resend, Revoke

### React Component Example

```jsx
import { useState } from 'react';

function CreateInvitationButton({ role }) {
  const [isOpen, setIsOpen] = useState(false);
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/v1/invitations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          role: role,
          message: formData.message,
          description: formData.description,
          expiresInDays: formData.expiresInDays || 7,
          maxUses: formData.maxUses || 50
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setInvitation(result.data.invitation);
        setIsOpen(false);
      } else {
        setError(result.error.message);
      }
    } catch (err) {
      setError('Failed to create invitation');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="btn btn-primary"
      >
        Invite {role === 'instructor' ? 'Instructors' : 'Students'}
      </button>
      
      {isOpen && (
        <InvitationModal 
          role={role}
          onSubmit={handleSubmit}
          onClose={() => setIsOpen(false)}
          loading={loading}
          error={error}
        />
      )}
      
      {invitation && (
        <InvitationUrlDisplay 
          url={invitation.invitationUrl}
          onClose={() => setInvitation(null)}
        />
      )}
    </>
  );
}

// Usage in Admin Dashboard
function AdminInvitations() {
  return (
    <div className="invitation-buttons">
      <CreateInvitationButton role="instructor" />
      <CreateInvitationButton role="student" />
    </div>
  );
}
```

---

## 📊 Admin Dashboard - Managing Invitations

### Get All Invitations

**GET** `/api/v1/invitations`

**Query Parameters:**
- `status` - Filter by status (pending, active, exhausted, expired, revoked)
- `role` - Filter by role (instructor, student)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Example Request:**
```
GET /api/v1/invitations?status=active&role=instructor&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "invitations": [
      {
        "_id": "67890abcdef1234567890",
        "token": "abc123...",
        "role": "instructor",
        "status": "active",
        "maxUses": 50,
        "currentUses": 12,
        "remainingUses": 38,
        "expiresAt": "2024-02-15T00:00:00.000Z",
        "createdAt": "2024-01-15T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

### Get Invitation Statistics

**GET** `/api/v1/invitations/stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 45,
    "totalAcceptedUsers": 320,
    "byStatus": {
      "active": 28,
      "exhausted": 5,
      "expired": 8,
      "revoked": 4
    },
    "byRole": {
      "students": 280,
      "instructors": 40
    }
  }
}
```

### Resend/Get Invitation URL

**POST** `/api/v1/invitations/:id/resend`

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Invitation link retrieved successfully",
    "invitationUrl": "http://localhost:3000/invite/abc123...",
    "remainingUses": 38
  }
}
```

### Revoke Invitation

**DELETE** `/api/v1/invitations/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Invitation revoked successfully"
  }
}
```

---

## 👤 Public Signup Page - Invitation Flow

### Step 1: Extract Token from URL

**URL Format:**
```
http://yourdomain.com/invite/abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

**React Router Example:**
```jsx
import { useParams } from 'react-router-dom';

function InvitationSignupPage() {
  const { token } = useParams(); // Extract token from URL
  // ... rest of component
}
```

**Next.js Example:**
```jsx
export default function InvitationSignupPage() {
  const router = useRouter();
  const { token } = router.query;
  // ... rest of component
}
```

### Step 2: Fetch Invitation Details

**GET** `/api/v1/invitations/token/:token`

**Example:**
```javascript
const fetchInvitation = async () => {
  try {
    const response = await fetch(`/api/v1/invitations/token/${token}`);
    const result = await response.json();
    
    if (result.success) {
      setInvitation(result.data.invitation);
    } else {
      setError(result.error.message);
    }
  } catch (err) {
    setError('Failed to load invitation');
  }
};
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "invitation": {
      "role": "instructor",
      "organization": {
        "id": "68df97e055c4cf64009c9401",
        "name": "CogneraX Education",
        "logo": "https://example.com/logo.png",
        "primaryColor": "#1a73e8",
        "secondaryColor": "#34a853"
      },
      "invitedBy": {
        "name": "Ahmed Alaa",
        "email": "info@cognerax.com"
      },
      "expiresAt": "2024-02-15T00:00:00.000Z",
      "maxUses": 50,
      "currentUses": 12,
      "remainingUses": 38,
      "message": "Welcome to our platform!",
      "description": "Join us as an instructor to create amazing courses."
    }
  }
}
```

**Error Responses:**

- **404 Not Found** - Invalid token:
```json
{
  "success": false,
  "error": {
    "message": "Invitation not found"
  }
}
```

- **400 Bad Request** - Expired invitation:
```json
{
  "success": false,
  "error": {
    "message": "This invitation has expired"
  }
}
```

- **400 Bad Request** - Exhausted invitation:
```json
{
  "success": false,
  "error": {
    "message": "This invitation link has reached its maximum uses"
  }
}
```

### Step 3: Display Signup Form

**UI Components:**

1. **Organization Branding**
   - Logo (from invitation.organization.logo)
   - Organization name
   - Use organization colors (primaryColor, secondaryColor)

2. **Role Badge**
   - Display "Instructor" or "Student" badge
   - Use appropriate icon

3. **Invitation Details**
   - Remaining uses count
   - Expiration countdown
   - Custom message (if provided)

4. **Signup Form**
   - Full Name input
   - Email input (pre-fill from invitation if available)
   - Password input (with strength indicator)
   - Confirm Password input
   - Terms and Conditions checkbox
   - Submit button

### Step 4: Submit Signup

**POST** `/api/v1/auth/register/invitation`

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "invitationToken": "abc123def456ghi789jkl012mno345pqr678stu901vwx234yz"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": "607d1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "instructor",
    "avatar": "https://via.placeholder.com/200x200"
  }
}
```

**Error Responses:**

- **400 Bad Request** - Email already exists:
```json
{
  "success": false,
  "error": {
    "message": "An account with this email already exists. Please use a different email or login."
  }
}
```

### Complete React Component Example

```jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function InvitationSignup() {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  
  useEffect(() => {
    fetchInvitation();
  }, [token]);
  
  const fetchInvitation = async () => {
    try {
      const response = await fetch(`/api/v1/invitations/token/${token}`);
      const result = await response.json();
      
      if (result.success) {
        setInvitation(result.data.invitation);
        // Pre-fill email if available
        if (result.data.invitation.email) {
          setFormData(prev => ({ ...prev, email: result.data.invitation.email }));
        }
      } else {
        setError(result.error.message);
      }
    } catch (err) {
      setError('Failed to load invitation');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    if (!formData.acceptTerms) {
      setError('You must accept the terms and conditions');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await fetch('/api/v1/auth/register/invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          invitationToken: token
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Store tokens
        localStorage.setItem('token', result.token);
        localStorage.setItem('refreshToken', result.refreshToken);
        localStorage.setItem('user', JSON.stringify(result.user));
        
        // Redirect based on role
        if (result.user.role === 'instructor') {
          navigate('/instructor/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      } else {
        setError(result.error.message);
      }
    } catch (err) {
      setError('Failed to create account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return <div className="loading-spinner">Loading invitation...</div>;
  }
  
  if (error && !invitation) {
    return (
      <div className="error-message">
        <h2>Invalid Invitation</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
  }
  
  if (!invitation) return null;
  
  return (
    <div className="invitation-signup" style={{ '--primary-color': invitation.organization.primaryColor }}>
      <div className="branding">
        {invitation.organization.logo && (
          <img src={invitation.organization.logo} alt="Organization Logo" />
        )}
        <h1>{invitation.organization.name}</h1>
      </div>
      
      <div className="role-badge">
        Join as {invitation.role}
      </div>
      
      {invitation.message && (
        <div className="welcome-message">
          {invitation.message}
        </div>
      )}
      
      <div className="invitation-stats">
        <span>Remaining Uses: {invitation.remainingUses}</span>
        <span>Expires: {new Date(invitation.expiresAt).toLocaleDateString()}</span>
      </div>
      
      <form onSubmit={handleSubmit} className="signup-form">
        <input
          type="text"
          placeholder="Full Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
        
        <input
          type="password"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          required
        />
        
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={formData.acceptTerms}
            onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
          />
          I accept the terms and conditions
        </label>
        
        {error && <div className="error-message">{error}</div>}
        
        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
    </div>
  );
}

export default InvitationSignup;
```

---

## ⚠️ Error Handling

### Common Error Cases

1. **Invalid Token (404)**
   - Message: "Invitation not found"
   - Action: Redirect to home or show error page

2. **Expired Invitation (400)**
   - Message: "This invitation link has expired"
   - Action: Show error with contact information

3. **Exhausted Invitation (400)**
   - Message: "This invitation link has reached its maximum uses"
   - Action: Contact admin for new invitation

4. **Revoked Invitation (400)**
   - Message: "This invitation link has been revoked"
   - Action: Contact admin

5. **Email Already Exists (400)**
   - Message: "An account with this email already exists"
   - Action: Show login link

6. **User Already in Organization (400)**
   - Message: "You are already a member of this organization"
   - Action: Redirect to login

### Error Response Format

All errors follow this format:
```json
{
  "success": false,
  "error": {
    "message": "Error description"
  }
}
```

---

## 🎨 UI/UX Best Practices

### Visual Design

1. **Organization Branding**
   - Use organization colors throughout the signup page
   - Display logo prominently
   - Maintain brand consistency

2. **Clear Role Indication**
   - Use distinct badges/icons for instructor vs student
   - Color-code by role
   - Display role prominently in header

3. **Progress Indicators**
   - Show remaining uses as a progress bar
   - Display expiration countdown timer
   - Use visual feedback for form validation

4. **Accessibility**
   - Proper form labels
   - ARIA attributes
   - Keyboard navigation
   - Screen reader support

### User Experience

1. **Copy to Clipboard**
   ```javascript
   const copyToClipboard = async (text) => {
     try {
       await navigator.clipboard.writeText(text);
       alert('Invitation URL copied to clipboard!');
     } catch (err) {
       console.error('Failed to copy:', err);
     }
   };
   ```

2. **QR Code Generation** (Optional)
   - Generate QR code for invitation URLs
   - Use libraries like `qrcode` or `qrcode.react`
   - Allow easy sharing via QR code

3. **Email Invitation** (Optional)
   - Send invitation URL via email
   - Use backend email service
   - Track email delivery status

4. **Invitation Analytics**
   - Track invitation views
   - Monitor signup conversion rate
   - Display stats in admin dashboard

### Form Validation

```javascript
const validateForm = (formData) => {
  const errors = {};
  
  if (!formData.name || formData.name.length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }
  
  if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = 'Valid email is required';
  }
  
  if (!formData.password || formData.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }
  
  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  if (!formData.acceptTerms) {
    errors.acceptTerms = 'You must accept the terms and conditions';
  }
  
  return errors;
};
```

---

## 🔒 Security Considerations

### Frontend Security

1. **Never Log Tokens**
   - Don't log invitation tokens
   - Don't expose tokens in console
   - Use secure storage for sensitive data

2. **Validate on Backend**
   - Frontend validation is for UX only
   - Backend must validate all inputs
   - Never trust client-side data

3. **HTTPS Only**
   - Always use HTTPS in production
   - Enforce secure connections
   - Display security warnings for HTTP

4. **Rate Limiting**
   - Implement client-side rate limiting
   - Show appropriate error messages
   - Provide user feedback

5. **Token Management**
   - Store JWT tokens securely
   - Use httpOnly cookies when possible
   - Implement token refresh flow

### Data Handling

1. **Clear Sensitive Data**
   ```javascript
   // Clear form data after submission
   const clearForm = () => {
     setFormData({
       name: '',
       email: '',
       password: '',
       confirmPassword: '',
       acceptTerms: false
     });
   };
   ```

2. **Auto-Logout**
   - Logout after signup if needed
   - Clear localStorage/sessionStorage
   - Redirect to appropriate page

3. **CSRF Protection**
   - Use CSRF tokens for all requests
   - Validate origin headers
   - Implement SameSite cookies

---

## ✅ Testing Checklist

### Admin Dashboard

- [ ] Create instructor invitation with custom settings
- [ ] Create student invitation with default settings
- [ ] Copy invitation URL to clipboard
- [ ] View invitation list with filters
- [ ] Test invitation stats display
- [ ] Resend invitation URL
- [ ] Revoke invitation
- [ ] Verify role is correctly assigned

### Public Signup Page

- [ ] Open invitation URL with valid token
- [ ] Verify organization branding displays
- [ ] Verify role badge shows correctly
- [ ] Display remaining uses and expiration
- [ ] Complete signup form successfully
- [ ] Verify validation errors display
- [ ] Test password strength indicator
- [ ] Accept terms and conditions
- [ ] Submit form and redirect to dashboard
- [ ] Verify user created with correct role
- [ ] Verify user assigned to organization
- [ ] Verify email is auto-verified

### Error Scenarios

- [ ] Test expired invitation link
- [ ] Test exhausted invitation (max uses reached)
- [ ] Test revoked invitation
- [ ] Test invalid token
- [ ] Test duplicate email signup
- [ ] Test user already in organization
- [ ] Test network errors
- [ ] Test malformed request data

### Security Tests

- [ ] Verify tokens are not logged
- [ ] Verify HTTPS is enforced in production
- [ ] Test rate limiting on signup endpoint
- [ ] Verify sensitive data is cleared after submission
- [ ] Test CSRF protection
- [ ] Verify JWT tokens are stored securely

---

## 🚀 Quick Start Example

### Admin Creates Invitation

```javascript
// Admin Dashboard
const createInstructorInvitation = async () => {
  const response = await fetch('/api/v1/invitations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      role: 'instructor',
      message: 'Welcome! Join us to create amazing courses.',
      expiresInDays: 30,
      maxUses: 100
    })
  });
  
  const result = await response.json();
  return result.data.invitation.invitationUrl;
  // Returns: "http://localhost:3000/invite/abc123..."
};
```

### User Signs Up via Invitation

```javascript
// Public Signup Page
const signupWithInvitation = async (token, userData) => {
  const response = await fetch('/api/v1/auth/register/invitation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      invitationToken: token
    })
  });
  
  const result = await response.json();
  
  if (result.success) {
    // Store token and redirect
    localStorage.setItem('token', result.token);
    window.location.href = `/dashboard`;
  }
};
```

---

## 📞 Support

For additional help or questions:

- Check the API documentation in `API_ENDPOINTS_DOCUMENTATION.md`
- Review the backend controllers in `src/controllers/`
- Contact the development team

---

*Last Updated: January 2025*
*Version: 1.0*
