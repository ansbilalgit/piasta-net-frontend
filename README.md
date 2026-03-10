# 🎮 Piasta Net - Game Event Management System

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0-06B6D4?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Playwright](https://img.shields.io/badge/Playwright-Testing-2EAD33?style=flat&logo=playwright)](https://playwright.dev/)

A modern, full-stack web application for managing game nights and events. Users can create and join game events, track participants, and manage their gaming community.

## ✨ Features

### 🔐 Authentication & Authorization
- Secure JWT-based authentication
- User registration and login
- Role-based access control (event owners vs participants)
- Protected routes and API endpoints

### 🎲 Game Event Management
- Create, edit, and delete game events
- Real-time participant tracking
- Automatic weekly event reset (every Tuesday at 23:59)
- Game overlap protection
- Participant limit management

### 🎨 Modern UI/UX
- Responsive design with Tailwind CSS
- Glass-morphism design elements
- Toast notifications for user feedback
- Interactive dialogs and modals
- Loading states and error handling

### 📊 Game Library
- Browse available games with thumbnails
- Game details (players, duration, category)
- "Always interested" feature for favorite games
- Read more functionality for long descriptions

## 🚀 Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16.1.6 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 |
| **UI Components** | Lucide React Icons |
| **Notifications** | React Hot Toast |
| **API** | REST API with OpenAPI spec |
| **State Management** | React Hooks (useState, useEffect, useCallback) |

## 🛠️ Getting Started

### Prerequisites

- **Node.js** 18.x or 20.x (LTS recommended)
- **npm** (comes with Node.js)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd piasta-net-frontend-2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm run start
```

## 🧪 Testing

This project uses [Playwright](https://playwright.dev/) for end-to-end (E2E) testing.

### Run Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with interactive UI
npm run test:e2e:ui

# Run tests in debug mode
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

### Test Coverage

- **Homepage** - Hero section, navigation, content
- **Authentication** - Login/signup forms, validation, GDPR modal
- **Games Library** - Filters, search, sorting, responsive design
- **Navigation** - Page routing, links
- **Accessibility** - ARIA roles, keyboard navigation, focus management

📖 **For detailed testing documentation**, see [`e2e/README.md`](./e2e/README.md)

## 🔌 API Integration

This frontend connects to the **Piasta Net API**:

```
https://piasta-net-app.azurewebsites.net
```

### Authentication Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/Auth/signup` | POST | Create new account |
| `/api/Auth/login` | POST | Authenticate and receive JWT |

### Game Event Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/GameEvents` | GET | List all game events |
| `/api/GameEvents` | POST | Create new game event |
| `/api/GameEvents` | PUT | Update game event |
| `/api/GameEvents/add-participant` | POST | Join an event |
| `/api/GameEvents/remove-participant` | POST | Leave an event |


## 📁 Project Structure

```
piasta-net-frontend-2/
├── app/                          # Next.js app directory
│   ├── components/               # React components
│   │   ├── Card.tsx             # Game card component
│   │   ├── GameEvents.tsx       # Event management
│   │   ├── ParticipantsCard.tsx # Weekly participants
│   │   ├── header.tsx           # Navigation header
│   │   └── footer.tsx           # Site footer
│   ├── login/                   # Authentication pages
│   ├── games/                   # Game library pages
│   └── page.tsx                 # Home page
├── e2e/                         # Playwright E2E tests
│   ├── homepage.spec.ts         # Homepage tests
│   ├── login.spec.ts            # Authentication tests
│   ├── games.spec.ts            # Game library tests
│   ├── accessibility.spec.ts    # Accessibility tests
│   └── README.md                # Testing documentation
├── lib/                         # Utility functions & services
│   ├── participantsService.ts   # Participant API service
│   ├── gameEventsService.ts     # Game event API service
│   └── types.ts                 # TypeScript types
├── openapi/                     # OpenAPI specification
│   ├── swagger.json             # API spec
│   └── types.ts                 # Generated types
└── public/                      # Static assets
```

## 🔐 Authentication Flow

1. **Registration**: User creates account via `/api/Auth/signup`
2. **Login**: User authenticates via `/api/Auth/login`
3. **Token Storage**: JWT stored in localStorage
4. **Authorized Requests**: Token used for protected API calls
5. **Logout**: Token removed, state reset

### Password Requirements
- Minimum 6 characters
- Validated client-side before submission

## 🎨 Design System

- **Primary Colors**: Cyan (`#0da2e7`), Purple (`#9b4dff`)
- **Background**: Dark slate gradient with glass-morphism effects
- **Typography**: Geist font family
- **Spacing**: Tailwind CSS spacing scale
- **Animations**: CSS transitions and transforms

## 🐛 Troubleshooting

### Clean Installation
```bash
# Remove dependencies and reinstall
rmdir /s /q node_modules && del package-lock.json && npm install

# Clear npm cache
npm cache clean --force
```

### Code Style
- Follow existing TypeScript patterns
- Use functional components with hooks
- Maintain consistent formatting
- Add error handling for async operations
---

<p align="center">
  Built with ❤️ for the gaming community
</p>
