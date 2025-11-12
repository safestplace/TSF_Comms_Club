# Club Management Portal MVP

A comprehensive, production-ready platform for managing multiple college communication clubs with three distinct user roles: Members, Club Admins, and Super Admins.

## Key  Features

### Member Features
- Register/Login with email & password
- Dashboard with 4-level progression system
- View achievements, meetings, and notifications
- Request roles for specific meetings
- Download earned certificates
- Club-wide leaderboard
- View member directory with badges

### Club Admin Features
- Create club (requires Super Admin approval)
- Approve member join requests
- Assign organizers (5 per 20 members cap)
- Create and manage meetings & tasks
- Approve role requests and achievements
- Generate and issue certificates

### Super Admin Features
- Approve club creation requests
- Manage admin changes
- Add/approve States, Districts, and Institutions
- View platform-wide insights and analytics
- Monitor club activity across all clubs

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL with Row-Level Security)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **PDF Generation**: Puppeteer
- **Validation**: Zod + React Hook Form
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- Git

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd club-portal