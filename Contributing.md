# Contributing Guide

## 1. Environment Setup

- **Python:** Use Python 3.10. Install via [pyenv](https://github.com/pyenv/pyenv) or from [python.org](https://www.python.org/downloads/release/python-31013/).
- **Virtual Environment:**  
  - Create: `python3.10 -m venv venv`  
  - Activate:  
    - macOS/Linux: `source venv/bin/activate`  
    - Windows: `venv\Scripts\activate`
- **Dependencies:**  
  - `pip install -r requirements.txt`  
  - `pip install --upgrade supabase`
- **Node.js (Frontend):**  
  - Install dependencies: `npm install` (in `/frontend`)
- **Environment Variables:**  
  - Check for `.env.example` in each relevant directory (e.g., `backend`, `frontend`).
  - Copy to `.env` and fill in required values.

## 2. Platform-Specific Notes

- **macOS:**  
  - Install Homebrew if needed:  
    `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`
  - Install pyenv: `brew install pyenv`
- **Linux:**  
  - Install prerequisites:  
    `sudo apt update && sudo apt install -y build-essential ...`
  - Install pyenv:  
    `curl https://pyenv.run | bash`
- **Windows:**  
  - Download Python from [python.org](https://www.python.org/downloads/release/python-31013/)  
  - Ensure “Add Python to PATH” is checked during installation.

## 3. Running the Project

### Backend Scheduler

- Navigate to `/backend`:
  ```sh
  cd backend
  ```
- Start the user profile scheduler:
  ```sh
  python -m services.user_profile_summary_job
  ```
  - This updates user profiles every hour.

### Frontend

- Navigate to `/frontend`:
  ```sh
  cd frontend
  ```
- Install dependencies:
  ```sh
  npm install
  ```
- Start the development server:
  ```sh
  npm run dev
  ```
  - The frontend will run locally.

---

**Tip:** Always activate your virtual environment before working on the project.