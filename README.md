# Textile Facility Admin Dashboard – Frontend

A modern React (Vite) dashboard for managing textile production, workers, users, and performance data. Built for speed, usability, and seamless integration with the backend API.

## 🚀 Tech Stack
- **React 19** + **Vite** – Lightning-fast, modern frontend
- **TypeScript** – Type-safe codebase
- **Tailwind CSS** – Utility-first, beautiful UI
- **@tanstack/react-table** – Powerful, flexible tables
- **react-hook-form** + **zod** – Effortless forms & validation
- **SWR** – Blazing fast data fetching & caching
- **Lucide React** – Crisp, open-source icons
- **shadcn/ui** – Beautiful, accessible UI components
- **Sonner** – Toast notifications
- **zustand** – Minimal, scalable state management

## ✨ Features
- **Authentication** (login, register, password reset with Zustand Auth store)
- **User & Worker Management** (CRUD, CSV import)
- **Production Line Oversight** (CRUD, toggle active/inactive, live metrics)
- **Performance Data Entry & Visualization**
- **Role-based Access Control**
- **Responsive, accessible UI**

## 🔗 API Integration
- Connects to the [Textile Backend API](https://github.com/Njahi98/textile-backend) for all data operations
- Endpoints used:
  - `/api/auth` – Auth flows
  - `/api/users` – User CRUD
  - `/api/workers` – Worker CRUD, CSV import
  - `/api/production-lines` – Production line CRUD, metrics, toggle status

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


## 📦 Folder Structure
- `src/features/` – Feature modules (auth, workers, users, production lines)
- `src/services/` – API clients
- `src/components/` – UI building blocks

## 🤝 Backend
See [`Textile Backend`](https://github.com/Njahi98/textile-backend) for backend setup and API details.

---


