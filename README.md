# Textile Facility Admin Dashboard – Frontend

A modern React-based frontend for textile manufacturing management, built with TypeScript, Vite, and Tailwind CSS and seamless integration with the backend API.

## Features

### Authentication & User Management
- Login/register with JWT authentication and role-based access
- Profile management with avatar upload
- Password reset functionality
- Session management with automatic logout

### Dashboard & Analytics
- Comprehensive dashboard with real-time metrics and charts
- Performance analytics with Recharts integration
- Production insights and KPI tracking
- Interactive data visualizations

### Worker Management
- Worker CRUD operations with search and filtering
- CSV import/export for bulk worker management
- Worker profile management and role assignment
- Performance tracking and analytics per worker

### Production Management
- Production line management with status controls
- Assignment scheduling with calendar view
- Shift management and conflict detection
- Product catalog with image management

### Real-Time Communication
- Live chat system with Socket.IO integration
- Group and direct messaging capabilities
- File sharing (images, documents, videos)
- Real-time notifications
- Message read receipts

### UI/UX Features
- Dark/light theme support with system preference detection
- Responsive design for all screen sizes
- Modern component library with Radix UI primitives
- Smooth animations with Framer Motion
- Form validation with React Hook Form and Zod
- Loading states with React Top Loading Bar
- Toast notifications with Sonner

### Data Management
- SWR for efficient data fetching and caching
- Zustand for global state management
- Axios for HTTP requests with interceptors
- Real-time data updates via WebSocket
- Optimistic updates for better UX

### Tables & Data Display
- Advanced data tables with TanStack React Table
- Sorting, filtering, and pagination
- Export functionality for reports
- Search capabilities across all data


## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS with custom components
- **UI Components**: shadcn/ui
- **State Management**: Zustand, SWR
- **Forms**: React Hook Form with Zod validation  
- **Charts**: Recharts for data visualization
- **Real-time**: Socket.IO Client
- **Routing**: React Router DOM
- **Animations**: Framer Motion


## 🛠️ Getting Started
1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure API URL:**

   Add this to your `.env` file:
   ```env
   VITE_API_URL=<your-backend-api-url>
   ```

3. **Start the dev server:**

   ```bash
   npm run dev
   ```



## Backend Integration

This frontend connects to the [Textile Backend](https://github.com/Njahi98/textile-backend) for complete functionality including authentication, data management, and real-time features.
