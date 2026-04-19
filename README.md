# Gururaj Coaching Classes (Abacus & Vedic Maths Platform)

A full-stack, responsive web application built for Gururaj Coaching Classes to manage student profiles, conduct interactive Abacus and Vedic Maths tests, and track real-time analytics.

## 🚀 Tech Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS, Lucide Icons
- **Backend:** Next.js API Routes (Serverless)
- **Database:** PostgreSQL (hosted on Supabase)
- **ORM:** Prisma
- **Authentication:** Custom JWT-based authentication using `jose`

## ✨ Features

### Student Portal
- **Dashboard:** View current level, global/class rank, and performance metrics.
- **Testing:** Take dynamically generated 200-question arithmetic tests with a time limit.
- **Scoring System:** Automated scoring calculating accuracy and speed.
- **Rankings:** Dynamic ranking algorithm calculated via `(0.6 * Average Marks) + (0.4 * Latest Test Score)`.

### Admin Dashboard
- **Student Management:** View and manage all registered students, monitor their current levels, and track their rankings.
- **Test Generation:** Easily generate new level-specific Abacus or Vedic Maths tests which are automatically distributed to the relevant students.
- **Analytics Overview:** Birds-eye view of academy performance.

## 💻 Running Locally

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### 2. Clone and Install
```bash
git clone https://github.com/ruturaj0917/Abacus_coaching_classes.git
cd Abacus_coaching_classes/abacus-app
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory and add the following variables:
```env
DATABASE_URL="your-supabase-postgres-connection-string"
DIRECT_URL="your-supabase-direct-connection-string"
NEXTAUTH_SECRET="any-secure-random-string"
```

### 4. Database Setup (Prisma)
Push the database schema to your Postgres database:
```bash
npx prisma db push
```

### 5. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🌐 Deployment

This application is optimized for deployment on **Vercel**.
1. Push your code to GitHub.
2. Import the repository into Vercel.
3. Add the `.env` variables into the Vercel project settings.
4. Deploy!

---
*Built with modern web technologies to simplify mental mathematics practice and management.*
