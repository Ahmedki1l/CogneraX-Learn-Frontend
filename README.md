
# AI Education Platform Revamp

This is a production-ready AI Education Platform with both frontend and backend. The original design is available at https://www.figma.com/design/CmiF1964jY7xaBc07DPRkC/AI-Education-Platform-Revamp.

## Features

- 🎓 Complete Learning Management System
- 🤖 AI-Powered Content Analysis and Question Generation (Google Gemini)
- 👥 Multi-role Support (Admin, Instructor, Student)
- 📊 Comprehensive Analytics
- 💳 Shopping Cart and Payment Processing
- 🌐 Multi-language Support (EN/AR with RTL)
- 🔒 JWT Authentication with Role-Based Access Control
- 📱 Real-time Features with Socket.io

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development
- Radix UI Components
- Tailwind CSS
- React Hook Form
- Recharts for analytics

### Backend
- Node.js with Express
- MongoDB with Mongoose
- Redis for caching
- Socket.io for real-time features
- Google Gemini AI integration
- JWT authentication
- Bull for job queues

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or cloud)
- Redis (optional, for caching)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
- MongoDB connection string
- JWT secret
- API keys for services (Gemini AI, SendGrid, Stripe, etc.)

5. Start the backend server:
```bash
npm run dev
```

The backend will run on http://localhost:5000

### Frontend Setup

1. In the root directory, install dependencies:
```bash
npm install
```

2. Create `.env.development` file:
```bash
VITE_API_URL=http://localhost:5000/api/v1
```

3. Start the frontend:
```bash
npm run dev
```

The frontend will run on http://localhost:5173

## Default Login Credentials

For development/testing:

- **Admin**: admin@cognerax.edu / password123
- **Instructor**: instructor@cognerax.edu / password123
- **Student**: student@cognerax.edu / password123

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Quick setup guide
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Complete feature overview
- **[backend/SETUP_GUIDE.md](./backend/SETUP_GUIDE.md)** - Production deployment guide
- **[GEMINI_AI_IMPLEMENTATION.md](./GEMINI_AI_IMPLEMENTATION.md)** - AI integration details
- **[BACKEND_REQUIREMENTS.md](./BACKEND_REQUIREMENTS.md)** - Full backend specifications

## 🔌 API Documentation

The backend provides comprehensive RESTful APIs:

### Authentication
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user

### Courses & Lessons
- `GET /api/v1/courses` - List courses
- `POST /api/v1/courses` - Create course
- `GET /api/v1/courses/:id/lessons` - Get lessons
- `POST /api/v1/lessons/:id/complete` - Mark lesson complete

### Quizzes & Assessments
- `POST /api/v1/quizzes/:id/start` - Start quiz
- `POST /api/v1/quizzes/:id/submit` - Submit quiz
- `GET /api/v1/quizzes/:id/results/:attemptId` - Get results

### AI Features
- `POST /api/v1/ai/analyze-content` - Analyze content (10 credits)
- `POST /api/v1/ai/recreate-content` - Enhance content (25 credits)
- `POST /api/v1/ai/generate-teaching-plan` - Generate plan (50 credits)
- `POST /api/v1/ai/generate-questions` - Generate questions (1 credit/question)
- `POST /api/v1/ai/generate-exam` - Generate exam (1 credit/question)
- `POST /api/v1/ai/grade-essay` - Grade essay (2 credits/essay)
- `GET /api/v1/ai/credits/balance` - Check credits

### E-Commerce
- `GET /api/v1/cart` - Get cart
- `POST /api/v1/cart/items` - Add to cart
- `POST /api/v1/payments/create-intent` - Create payment
- `POST /api/v1/payments/confirm` - Confirm payment
- `POST /api/v1/payments/enroll-free/:courseId` - Free enrollment

### Analytics
- `GET /api/v1/analytics/student/dashboard` - Student analytics
- `GET /api/v1/analytics/instructor/dashboard` - Instructor analytics
- `GET /api/v1/analytics/platform` - Platform analytics (Admin)

### File Upload
- `POST /api/v1/upload/:type` - Upload file
- `POST /api/v1/upload/avatar` - Upload avatar
- `POST /api/v1/upload/course-thumbnail/:courseId` - Upload thumbnail

## 🚀 Production Deployment

### Quick Deploy Options

#### 1. Traditional VPS/EC2
```bash
# Install dependencies
npm install --production

# Use PM2
pm2 start src/server.js --name "ai-education-api"
pm2 save
pm2 startup
```

#### 2. Docker
```bash
docker-compose up -d
```

#### 3. Cloud Platforms
- **Heroku**: `git push heroku main`
- **Railway**: Connect GitHub repo
- **Render**: Connect GitHub repo

See `backend/SETUP_GUIDE.md` for detailed instructions including:
- Database optimization
- Security configurations
- Scaling strategies
- Monitoring setup
- SSL/HTTPS configuration
- Load balancing

## ✅ Implementation Status

### Completed Features (13/15 - 87%)
- ✅ Authentication & Authorization
- ✅ User Management
- ✅ Course Management
- ✅ Lesson System
- ✅ Quiz & Assessment
- ✅ Question Bank
- ✅ AI Integration (6 features)
- ✅ Shopping Cart
- ✅ Payment Processing
- ✅ File Upload
- ✅ Analytics
- ✅ Real-time Features
- ✅ Frontend Integration

### Pending (Optional)
- ⏳ Unit & Integration Tests
- ⏳ Advanced Forums

## 🎯 Key Achievements

1. **Production-Ready Architecture** - Clean MVC pattern
2. **Complete Authentication** - JWT with refresh tokens, RBAC
3. **Full Course Management** - CRUD, enrollment, progress
4. **Advanced Quiz System** - Anti-cheating, auto-grading
5. **AI Integration** - 6 major features with Google Gemini
6. **Real-time Features** - Socket.io for live updates
7. **Payment System** - Stripe integration
8. **Analytics Engine** - Comprehensive dashboards
9. **File Management** - Multi-format uploads
10. **Security Hardened** - Multiple protection layers

## 🛡️ Security Features

- JWT authentication with RS256
- Password hashing (bcrypt)
- CORS configuration
- Helmet.js security headers
- Rate limiting (100 req/15min)
- MongoDB sanitization
- Input validation (Joi)
- XSS prevention
- HTTPS ready

## 📊 Performance

- Redis caching for frequent queries
- Database indexing
- Query optimization
- Pagination support
- Compression middleware
- Background job processing (Bull)

## 🧪 Testing

### Manual Testing
```bash
# Start development servers
npm run dev    # Frontend
cd backend && npm run dev    # Backend

# Test endpoints
curl http://localhost:5000/health
```

### API Testing
```bash
# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@cognerax.edu","password":"password123"}'
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 💬 Support

For issues or questions:
- Check documentation in `/docs`
- Review `QUICK_START.md` for setup help
- See `backend/SETUP_GUIDE.md` for deployment
- Contact: support@yourdomain.com

---

**Built with ❤️ using React, Node.js, MongoDB, and Google Gemini AI**
  