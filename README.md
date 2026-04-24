# Nexus SEL Learning Platform

A Social-Emotional Learning (SEL) and Wellbeing platform designed for students at NTUST. This application serves as a digital hub for course materials, student personas, and interactive learning modules.

## Features
- **Interactive SEL Modules:** Focused on Wellbeing Science and Digital Social-Emotional Learning.
- **Resource Hub:** Access to research papers, lecture slides, and course materials.
- **Dynamic Personas:** View student personas and their learning journeys.
- **Mood Tracking & Stats:** Log moods and track progress through different lessons.

## Tech Stack
- **Frontend:** HTML, CSS (Vanilla), JavaScript
- **Backend:** Node.js with Express
- **Database:** SQLite (nexus.db)

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)

### Installation
1. Clone the repository:
   ```bash
   git clone <your-repository-url>
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. Open your browser and navigate to `http://localhost:3000`

## Deployment (Render.com)

This app is configured for deployment on **Render.com** as a Web Service.

- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Port:** Uses `process.env.PORT` (automatically assigned by Render)

## Project Structure
- `server.js`: Express server and API routes.
- `database.js`: SQLite database connection and initialization.
- `nexus.db`: SQLite database file.
- `sel-lms-platform.html`: Main application entry point.
- `Digital Learning/`: Course documents and research materials.
