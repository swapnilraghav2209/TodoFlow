# 🚀 ToDoFlow

A modern, full-stack task management application built with React, TypeScript, and Supabase. Features include user authentication, recurring tasks, file attachments, smart filtering, and real-time statistics.

[![Live Demo](https://img.shields.io/badge/Demo-Live-success?style=for-the-badge&logo=vercel)](https://todo-flow-seven.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?style=for-the-badge&logo=github)](https://github.com/swapnilraghav2209/TodoFlow)

**🌐 Live Application:** [https://todo-flow-seven.vercel.app](https://todo-flow-seven.vercel.app)

## 📖 Project Overview

ToDoFlow is a production-ready task management system that demonstrates modern web development practices, secure authentication, database design with Row-Level Security, and a polished user interface. The application enables users to create, manage, and organize tasks with advanced features like recurring task patterns, file attachments, due date tracking, and comprehensive filtering options.

## 🛠️ Tech Stack

**Frontend:**
- **React 18.3** with **TypeScript 5.8** for type-safe component development
- **Vite 5.4** for fast builds and optimal developer experience
- **React Router 6.30** for client-side routing and navigation
- **TanStack Query 5.83** for efficient data fetching, caching, and state management
- **React Hook Form 7.61** + **Zod 3.25** for robust form handling and validation

**Backend & Database:**
- **Supabase** (PostgreSQL) for database, authentication, and file storage
- Row-Level Security (RLS) policies for user data isolation
- Supabase Storage for secure file attachments
- Real-time subscriptions for live data updates

**UI & Styling:**
- **Tailwind CSS 3.4** for utility-first styling
- **shadcn/ui** component library built on Radix UI primitives
- **Lucide React** for icons
- **next-themes** for dark mode support
- **Sonner** for toast notifications

**Additional Libraries:**
- **date-fns** for date manipulation and formatting
- **clsx** + **tailwind-merge** for conditional class handling

## 🏗️ Development Process

This project was built following a structured, modern development workflow:

1. **Architecture Design**: Planned the application structure, database schema, and component hierarchy
2. **Database Setup**: Designed and implemented PostgreSQL schema with proper relationships, indexes, and RLS policies
3. **Authentication Flow**: Integrated Supabase Auth with protected routes and session management
4. **Component Development**: Built reusable, type-safe components following React best practices
5. **State Management**: Implemented custom hooks for authentication and todo management with TanStack Query
6. **UI/UX Polish**: Created a responsive, accessible interface with loading states, error handling, and smooth animations

### Database Schema

**Todos Table:**
- User-scoped tasks with title, description, completion status
- Due date tracking with automatic overdue detection
- Recurring task support (daily, weekly, monthly patterns)
- Timestamps for creation and updates

**Attachments Table:**
- File metadata linked to todos
- Secure storage with user-based access control
- File type and size tracking

**Security:**
- Row-Level Security ensures users can only access their own data
- Storage bucket policies prevent unauthorized file access
- All database operations validate user authentication

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account ([free tier available](https://supabase.com))

### Setup

1. **Clone and Install**
```bash
git clone https://github.com/swapnilraghav2209/TodoFlow.git
cd To_Do_Flow
npm install
```

2. **Configure Supabase**
   - Create a new Supabase project
   - Run the SQL schema (see `Database Schema` section)
   - Copy your project URL and anon key

3. **Environment Variables**
   
   Create `.env.local`:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start Development Server**
```bash
npm run dev
```

Visit `http://localhost:5173` to see the application.

### Database Setup SQL

```sql
-- Create todos table
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  due_date TIMESTAMPTZ,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT CHECK (recurrence_pattern IN ('daily', 'weekly', 'monthly')),
  recurrence_interval INTEGER,
  next_occurrence TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create attachments table
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  todo_id UUID REFERENCES todos(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users manage own todos" ON todos FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own attachments" ON attachments FOR ALL USING (auth.uid() = user_id);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('task-attachments', 'task-attachments', false);

-- Storage policies
CREATE POLICY "Users manage own files" ON storage.objects FOR ALL 
USING (bucket_id = 'task-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Indexes
CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_due_date ON todos(due_date);
```

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## ✨ Key Features

- **Smart Filtering**: All, Active, Completed, and Overdue task views with real-time counts
- **Recurring Tasks**: Set daily, weekly, or monthly recurring patterns with custom intervals
- **File Attachments**: Secure file uploads with Supabase Storage
- **Search**: Real-time task search across titles and descriptions
- **Statistics Dashboard**: Live task metrics and completion tracking
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Dark Mode**: Theme switching support
- **Loading States**: Skeleton screens and loading indicators for better UX

## 🤖 AI-Assisted Development

This project was developed following an **AI-first methodology**, leveraging AI tools throughout the entire development lifecycle while maintaining full understanding and ownership of the codebase.

### How AI Enhanced Development

**Architecture & Planning:**
- Collaborated with AI to design the database schema, ensuring proper normalization, relationships, and indexing strategies
- Used AI to evaluate different state management approaches and select optimal patterns (custom hooks + TanStack Query)
- Discussed security best practices and implemented RLS policies with AI guidance

**Code Generation & Implementation:**
- Generated boilerplate code for React components, reducing repetitive setup time
- Used AI to write TypeScript type definitions and Zod validation schemas
- Accelerated SQL query writing and Supabase integration code
- Generated authentication flow implementation with proper error handling

**Problem Solving:**
- Debugged complex issues by discussing symptoms with AI and receiving targeted solutions
- Optimized database queries and component re-renders through AI suggestions
- Resolved TypeScript type errors and React Hook dependency warnings efficiently

**Best Practices & Code Quality:**
- Received real-time suggestions for code improvements and refactoring opportunities
- Ensured accessibility compliance in UI components
- Implemented proper error boundaries and loading states based on AI recommendations

### AI Tools Used

- **Cursor AI / GitHub Copilot**: For intelligent code completion and inline suggestions
- **ChatGPT / Claude**: For architecture discussions, debugging, and implementation planning
- **AI-assisted SQL generation**: For database schema and complex queries

### Understanding & Ownership

While AI significantly accelerated development, I maintained complete understanding of:
- **Database design**: Why each table exists, how RLS policies work, and the purpose of every index
- **React patterns**: Component lifecycle, custom hooks, state management, and performance optimization
- **TypeScript**: Type safety benefits, generics usage, and proper type definitions
- **Authentication flow**: Session management, token handling, and security implications
- **Supabase integration**: Client-side SDK usage, real-time subscriptions, and storage APIs

**I can confidently explain**:
- Any architectural decision and its trade-offs
- How data flows through the application
- Security measures implemented and why they matter
- Performance optimizations and their impact
- Every line of code and its purpose

### Benefits of AI-First Approach

✅ **Faster Development**: Reduced time spent on boilerplate and repetitive tasks  
✅ **Higher Quality**: AI suggestions often highlighted edge cases and best practices  
✅ **Learning Accelerator**: Exposure to alternative approaches and modern patterns  
✅ **Focus on Logic**: More time spent on business logic and user experience  
✅ **Reduced Bugs**: AI caught potential issues during implementation  

This AI-assisted workflow mirrors modern development practices where developers leverage AI as a powerful productivity tool while maintaining deep technical understanding and decision-making authority.

## 🚢 Deployment

**Production Deployment:** This application is currently deployed on Vercel at [https://todo-flow-seven.vercel.app](https://todo-flow-seven.vercel.app)

### Deploy Your Own

The application can be deployed to any static hosting platform:

**Vercel (Used for this project):**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard:
# VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

**Other Platforms:**
- **Netlify**: Build command `npm run build`, publish directory `dist`
- **Cloudflare Pages, AWS Amplify, Render**: All compatible with static React apps
