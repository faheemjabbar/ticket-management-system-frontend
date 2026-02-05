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

## Backend

Requires a NestJS backend API. See backend repository for setup instructions.

## License

MIT
