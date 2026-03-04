⚠️ Prerequisites

This repository depends on a separate NestJS backend API. Make sure you clone and configure the backend project first and follow its setup instructions before running this app.

Access Flow:
- First user must register as SuperAdmin
- SuperAdmin can create Organizations
- Organizations can create Admins
- Admins can create Members (QA/Dev) and Projects

# TickFlo

A modern ticket management system for software development teams built with Next.js and TypeScript.

## Tech Stack

- Next.js 16.1.5
- React 19.2.3
- TypeScript
- Tailwind CSS 4
- Socket.IO (real-time updates)
- React Hook Form + Zod (validation)

## Features

- Kanban board with drag-and-drop
- Real-time notifications
- Role-based access control (Admin, Developer, QA, SuperAdmin)
- Project and user management
- Ticket history and activity tracking
- File upload support
- Password reset with email verification

## Installation

```bash
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5050
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Build

```bash
npm run build
npm start
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment instructions and troubleshooting.

## License

MIT
