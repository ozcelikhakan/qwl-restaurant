# QWL Restaurant

A full-stack restaurant application featuring a public-facing website for visitors and a
separate management panel for administrators. The frontend is built with Angular and the
backend with a .NET Web API.

## Contents

- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Features](#features)
- [Testing](#testing)

## Architecture

The project consists of two main parts:

- **`qwl-restaurant/`** – An Angular 19 single-page application (SPA). Pages are loaded as
  lazy-loaded standalone components. Authorization is handled through route guards and an
  HTTP interceptor that attaches the auth token to outgoing requests.
- **`backend/`** – A .NET Web API built with a layered architecture, split into four
  projects: API, Business, DataAccess and Entities. Authentication is done with JWT, and
  EF Core over SQLite is used for data storage.

## Tech stack

**Frontend**

- Angular 19 (standalone components, lazy loading)
- PrimeNG and PrimeIcons (UI components)
- Tailwind CSS (styling)
- Swiper (gallery / slider)
- RxJS

**Backend**

- .NET Web API (layered architecture)
- Entity Framework Core + SQLite
- ASP.NET Core Identity + JWT
- Swagger (API documentation)

## Project structure

```
qwl-restaurant/
├── backend/                     # .NET Web API
│   ├── qwl-restaurant.API/         # Controllers, Program.cs, configuration
│   ├── qwl-restaurant.Business/    # Business rules, services
│   ├── qwl-restaurant.DataAccess/  # DbContext, repositories
│   └── qwl-restaurant.Entities/    # Data models
│
└── qwl-restaurant/              # Angular application
    └── src/app/
        ├── core/      # services, guards, interceptors, models
        ├── features/  # visitor pages (home, menu, events, blog, reservation...)
        ├── admin/     # management panel (dashboard, messages, reservations, menu...)
        └── shared/    # shared components and directives
```

## Getting started

### Backend

```bash
cd backend/qwl-restaurant.API
dotnet restore
dotnet run
```

On startup the database migrations are applied automatically, and the initial roles and an
admin user are seeded. In the development environment the Swagger UI is available at
`/swagger`.

### Frontend

```bash
cd qwl-restaurant
npm install
ng serve
```

Then open `http://localhost:4200/` in your browser. The app reloads automatically whenever
you change any of the source files.

> Note: the API URL is managed through the environment files under `src/environments`. If
> you run the backend on a different port, just update it there.

## Features

**Visitor side**

- Home, about, menu, events and blog pages
- Event and blog detail pages
- Reservation booking and contact form
- Member login, profile and "my tickets" pages

**Management panel**

- Token-based login and authorization (admin guard)
- Dashboard
- Menu, event, blog and reservation management
- Viewing messages submitted through the contact form
- Administrator profile

## Testing

Unit tests run with Karma + Jasmine:

```bash
cd qwl-restaurant
ng test
```

End-to-end tests use Playwright:

```bash
npm run e2e        # headless run
npm run e2e:ui     # run with the UI
```
