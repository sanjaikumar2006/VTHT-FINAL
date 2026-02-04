# Vel Tech High Tech - AI & DS Department Portal

## Prerequisites
- Python 3.8+
- Node.js 16+

## Setup

### Backend
1. Navigate to the root directory.
2. Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
3. Seed the database:
   ```bash

   .\venv\Scripts\Activate.ps1

   
    python -m backend.seed
   ```
4. Run the server:
   ```bash
   uvicorn backend.main:app --reload
   ```
   The API will be available at `http://localhost:8000`.

### Frontend
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

## Features
- **Authentication**: Role-based login (Admin, Faculty, Student).
- **Dashboards**: tailored views for each role.
- **Curriculum**: View courses by semester.
- **Announcements**: Global and Department-specific announcements.
