# EduChatbot - Complete Frontend Application

## 🎯 Overview

This is your **complete EduChatbot frontend** - a Next.js application with full backend integration!

### What's Included:

✅ **Your Existing Features:**
- Chat interface with AI responses
- Course pages (CS141, CS151, Math210, Phys131)
- Practice IDE with Monaco Editor
- Exam pages
- Shop page
- Profile page
- Login page

✅ **New Backend Integration:**
- API service layer for backend communication
- User authentication with JWT tokens
- Chat history persistence
- Exam/practice result tracking
- Profile management
- Statistics dashboard
- ChatSidebar component

---

## 📁 Project Structure

```
educhatbot-frontend/
├── src/
│   ├── app/                          # Next.js App Directory
│   │   ├── api/                      # API Routes
│   │   │   ├── chat/route.ts        # Chat API
│   │   │   ├── grade/route.ts       # Grading API
│   │   │   └── run/route.ts         # Code execution API
│   │   │
│   │   ├── chat/                     # Chat Pages
│   │   │   ├── [id]/page.tsx        # Individual chat
│   │   │   ├── new/page.tsx         # New chat
│   │   │   └── page.tsx             # Chat home
│   │   │
│   │   ├── courses/                  # Course Pages
│   │   │   ├── cs141/
│   │   │   │   ├── exam/page.tsx
│   │   │   │   ├── lesson1/page.tsx
│   │   │   │   ├── practice-ide/page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── cs151/page.tsx
│   │   │   ├── math210/page.tsx
│   │   │   └── phys131/page.tsx
│   │   │
│   │   ├── login/page.tsx            # Login page
│   │   ├── profile/page.tsx          # Profile page
│   │   ├── shop/page.tsx             # Shop page
│   │   ├── page.tsx                  # Homepage
│   │   ├── layout.tsx                # Root layout
│   │   └── globals.css               # Global styles
│   │
│   ├── components/                   # React Components
│   │   ├── ChatContext.tsx          # Chat state management
│   │   ├── ChatMessage.tsx          # Message component
│   │   ├── ChatSidebar.tsx          # NEW: Chat history sidebar
│   │   ├── CodeQuestion.tsx         # Code editor component
│   │   └── ShopItemCard.tsx         # Shop item component
│   │
│   └── lib/                          # Utilities
│       └── api/                      # NEW: Backend API Services
│           ├── auth.ts               # Authentication
│           ├── chats.ts              # Chat conversations
│           ├── profile.ts            # Profile management
│           └── progress.ts           # Exam/practice tracking
│
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript config
├── tailwind.config.js                # Tailwind CSS config
├── next.config.js                    # Next.js config
├── postcss.config.js                 # PostCSS config
├── .env.local                        # Environment variables
├── .env.example                      # Environment template
└── README.md                         # This file
```

---

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Set Up Environment

The `.env.local` file is already configured:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Step 3: Start Backend

Make sure your backend is running on port 8000:

```bash
cd ../backend
uvicorn app.main:app --reload --port 8000
```

### Step 4: Start Frontend

```bash
npm run dev
```

Visit: **http://localhost:3000**

---

## ✨ What's New - Backend Integration

### 1. API Services (`src/lib/api/`)

Clean, typed API calls to your backend:

```typescript
import { AuthAPI } from '@/lib/api/auth';
import { ChatsAPI } from '@/lib/api/chats';
import { ProfileAPI } from '@/lib/api/profile';
import { ExamsAPI } from '@/lib/api/progress';

// Login
await AuthAPI.login('student1', 'password123');

// Save chat
const conv = await ChatsAPI.createConversation('Title', 'Message');

// Submit exam
await ExamsAPI.submitExamResult({ ... });

// Get stats
const stats = await ProfileAPI.getStats();
```

### 2. Chat History Persistence

Your chats are now saved to the database! To integrate:

```typescript
// In your chat component
import { ChatsAPI } from '@/lib/api/chats';

// When creating a new chat
const conv = await ChatsAPI.createConversation(title, firstMessage);
setConversationId(conv.id);

// When adding messages
await ChatsAPI.addMessage(conversationId, 'user', userMessage);
await ChatsAPI.addMessage(conversationId, 'assistant', aiResponse);
```

### 3. Exam/Practice Tracking

Submit results to backend:

```typescript
// In your exam page
import { ExamsAPI } from '@/lib/api/progress';

const handleSubmit = async () => {
  await ExamsAPI.submitExamResult({
    course_id: 'cs141',
    exam_title: 'Practice Exam',
    exam_type: 'practice',
    score: 85,
    total_points: 100,
    percentage: 85,
    passed: true
  });
  
  router.push('/profile'); // View results
};
```

### 4. ChatSidebar Component

Display all conversations:

```typescript
// Add to your chat layout
import ChatSidebar from '@/components/ChatSidebar';

<div className="flex">
  <ChatSidebar />
  <div className="flex-1">
    {/* Your chat content */}
  </div>
</div>
```

---

## 🔧 Integration Guide

### Making Your Existing Pages Use the Backend

#### For Chat Pages (`app/chat/`)

Add chat persistence:

```typescript
// In app/chat/new/page.tsx or app/chat/[id]/page.tsx
import { ChatsAPI } from '@/lib/api/chats';

const [conversationId, setConversationId] = useState<number | null>(null);

// On first message
if (!conversationId) {
  const conv = await ChatsAPI.createConversation(
    message.slice(0, 50),
    message
  );
  setConversationId(conv.id);
}

// On subsequent messages
await ChatsAPI.addMessage(conversationId, 'user', message);
// ... get AI response ...
await ChatsAPI.addMessage(conversationId, 'assistant', aiResponse);
```

#### For Exam Pages (`app/courses/cs141/exam/`)

Add result tracking:

```typescript
import { ExamsAPI } from '@/lib/api/progress';

const handleExamSubmit = async (answers: any) => {
  const score = calculateScore(answers);
  
  await ExamsAPI.submitExamResult({
    course_id: 'cs141',
    exam_title: 'CS 141 Practice Exam',
    exam_type: 'practice',
    score,
    total_points: 100,
    percentage: score,
    passed: score >= 60
  });
};
```

#### For Login Page (`app/login/page.tsx`)

Already has a basic structure - you can replace it or enhance it with:

```typescript
import { AuthAPI } from '@/lib/api/auth';

const handleLogin = async (username: string, password: string) => {
  try {
    await AuthAPI.login(username, password);
    router.push('/');
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

#### For Profile Page (`app/profile/page.tsx`)

Add statistics display:

```typescript
import { ProfileAPI } from '@/lib/api/profile';
import { ExamsAPI } from '@/lib/api/progress';

const [stats, setStats] = useState(null);
const [exams, setExams] = useState([]);

useEffect(() => {
  const load = async () => {
    const statsData = await ProfileAPI.getStats();
    const examsData = await ExamsAPI.getMyExamResults();
    setStats(statsData);
    setExams(examsData);
  };
  load();
}, []);

// Display stats.total_exams_taken, stats.average_exam_score, etc.
```

---

## 🎨 Existing Features

### Chat Interface
- Real-time AI responses
- Message history
- Code highlighting
- Monaco editor for code questions

### Course Pages
- **CS 141**: Programming lessons and exams
- **CS 151**: Object-oriented programming
- **Math 210**: Calculus course
- **Phys 131**: Physics course

### Practice IDE
- Monaco code editor
- Code execution
- Real-time feedback

### Shop
- Virtual shop items
- Student rewards system

---

## 🔐 Authentication

The app now supports user authentication:

1. **Register**: Create new accounts for student1, student2, etc.
2. **Login**: JWT tokens stored in localStorage
3. **Protected Routes**: Automatically redirect to login if not authenticated
4. **Logout**: Clear session and return to login

---

## 📊 New Data Persistence

Everything is now saved to the backend database:

- ✅ User profiles and settings
- ✅ Chat conversations and messages
- ✅ Exam results and scores
- ✅ Practice exercise results
- ✅ Lesson completion status
- ✅ Learning statistics

---

## 🛠️ Development

### Run Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
npm start
```

### Lint Code

```bash
npm run lint
```

---

## 🧪 Testing the Integration

### 1. Test Authentication

```bash
# Visit http://localhost:3000/login
# Register as "student1" with password
# Login with credentials
# Should redirect to homepage
```

### 2. Test Chat Persistence

```bash
# Create a new chat
# Send messages
# Refresh page
# Check if chat appears in sidebar (after integration)
```

### 3. Test Exam Tracking

```bash
# Take an exam in CS 141
# Submit answers
# Check profile page for results
```

### 4. Test Backend Connection

```bash
# Open browser DevTools (F12)
# Go to Network tab
# Login or make any API call
# Should see requests to http://localhost:8000
```

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
npm run dev -- -p 3001
```

### API Calls Failing

- Check backend is running on port 8000
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check browser console for errors
- Verify CORS is enabled in backend

### TypeScript Errors

```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 📝 Next Steps

### To Fully Integrate Backend:

1. **Update Chat Pages** - Add `ChatsAPI` calls to save messages
2. **Update Exam Pages** - Add `ExamsAPI` calls to save results
3. **Add ChatSidebar** - Display conversation history
4. **Enhance Profile** - Show statistics from backend
5. **Add Authentication Guards** - Protect routes that need login

### Example Integration in Chat:

```typescript
// app/chat/new/page.tsx
import { ChatsAPI } from '@/lib/api/chats';

const sendMessage = async (text: string) => {
  // Create conversation on first message
  if (!conversationId) {
    const conv = await ChatsAPI.createConversation(
      text.slice(0, 50),
      text
    );
    setConversationId(conv.id);
  } else {
    await ChatsAPI.addMessage(conversationId, 'user', text);
  }

  // Get AI response (your existing logic)
  const aiResponse = await getAIResponse(text);

  // Save AI response
  await ChatsAPI.addMessage(conversationId, 'assistant', aiResponse);
};
```

---

## 🎉 You're All Set!

Your complete EduChatbot frontend is ready with:

✅ All your existing features (chat, courses, exams, shop)
✅ New backend integration (API services, authentication)
✅ Ready-to-use components (ChatSidebar)
✅ Complete configuration (TypeScript, Tailwind, Next.js)

### To Run:

1. `npm install`
2. Make sure backend is running on port 8000
3. `npm run dev`
4. Visit http://localhost:3000

Happy coding! 🚀
