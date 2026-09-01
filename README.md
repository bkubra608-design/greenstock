# GreenStock AI

**Smarter Inventory. Better Decisions.**

AI-powered inventory management dashboard for small and medium-sized businesses. Manage products, monitor stock levels, receive low-stock alerts, track activity, and predict future demand — all in one place.

## Description

GreenStock AI is a complete inventory management system built entirely with HTML5, CSS3, and Vanilla JavaScript. It provides a professional SaaS-style dashboard experience with real-time stock monitoring, AI-powered demand prediction, and an integrated AI assistant.

## Features

- **Inventory Dashboard** — Overview of total products, current stock, low-stock and out-of-stock counts, inventory value, and health score
- **Product Management** — Full CRUD (add, edit, delete) with search, category/status filters, and sorting
- **Stock Management** — Increase/decrease stock with +/- controls; automatic status updates
- **Low Stock Alerts** — Dedicated alert cards for low-stock and out-of-stock products with reorder recommendations
- **AI Demand Prediction** — Weighted-average algorithm using historical sales data; predicts future demand and recommends reorder quantities with confidence scores
- **Inventory Analytics** — Category breakdown (donut chart), inventory health score (circular progress), and inventory overview chart (7/30/90 days)
- **Activity Tracking** — Full log of all inventory actions with timestamps
- **AI Assistant** — Chatbot interface that answers inventory questions (low stock, reorder suggestions, demand, value, etc.)
- **LocalStorage Persistence** — Products, activities, and settings persist across page reloads
- **Dark Mode** — Full light/dark theme with localStorage preference
- **Responsive Design** — Works on desktop, tablet, and mobile (sidebar becomes hamburger menu)
- **Toast Notifications** — Success, warning, error, and AI notifications
- **Interactive Charts** — Built with Canvas API (no external chart library)

## Technologies

- HTML5
- CSS3 (custom design system, CSS variables, animations)
- Vanilla JavaScript (no frameworks)
- LocalStorage (data persistence)
- Canvas API (charts)

## Installation

### Option 1: Open directly

1. Download the project files
2. Open `index.html` in your web browser

### Option 2: VS Code Live Server

1. Open the project folder in VS Code
2. Install the "Live Server" extension
3. Right-click `index.html` and select "Open with Live Server"

### Option 3: Vite dev server

```bash
npm install
npm run dev
```

Then open the URL shown in your terminal.

## File Structure

```text
stockpilot-ai/
├── index.html      # Application structure
├── style.css       # All styling, themes, responsive design, animations
├── script.js       # All application logic
└── README.md       # This file
```

## Usage

1. **Dashboard** — View summary statistics, charts, and recent activity
2. **Products** — Add, edit, delete, search, filter, and sort products
3. **Inventory** — Adjust stock levels with +/- buttons
4. **Low Stock** — View products that need restocking
5. **Demand Prediction** — Run AI predictions and view reorder recommendations
6. **Activity** — Review full activity history
7. **Settings** — Configure default minimum stock, currency, theme, and reset data
8. **AI Assistant** — Click "Ask GreenStock AI" in the sidebar to chat with the assistant

## Data Safety Notice

This is a frontend prototype:

- **localStorage** is used for demo persistence — data is stored in your browser only
- There is **no real authentication** or user accounts
- Demand prediction is a **demo algorithm** (weighted average), not a trained ML model
- No real inventory database is connected
- No real AI model is used unless configured via an external API
- **Production use** would require a secure backend, database, and authentication system

## Future Integration

The code is structured for easy future integration with:

- **n8n AI Agent** — The `askGreenStockAI()` function is ready to connect to an n8n webhook
- **Real AI/ML API** — Replace `calculateDemand()` with an API call to a prediction service
- **Backend database** — Replace localStorage functions with API calls
- **Authentication** — Add user accounts and role-based access

No API keys should ever be placed in frontend JavaScript. Use environment variables or a proxy endpoint.
