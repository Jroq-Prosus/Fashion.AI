### Personal Repo for Deployment Purpose
Since Vercel is free for personal account but not for organization account, the deployment is actually based on this repo:
https://github.com/ShuhaoZQGG/Fashion.AI

### Slide Presentation
See our [slide presentation here](./assets/Raise%20Your%20Hackathon%20Team%20Jroq-Prosus.pdf) 

### Getting Started
Refer to [Contribution.md](./Contributing.md)

### Introduction
Fashion.AI, A fashion-focused AI-powered E-commerce platform using Bolt.new, structured into three clear modules: frontend, backend, and ai-model.

### 🎯 Objective:
Build a revolutionary e-commerce experience for fashion-forward users. Instead of using clicks or purchase history, the platform enables users to upload an image or use voice commands to receive personalized fashion recommendations based on style compatibility and trend awareness.

### 📁 Project Structure:
`frontend/` 
- React + Tailwind UI with image uploader and voice control.

`backend/`
- FastAPI orchestration layer for model routing, metadata, and API coordination.
- **Background Scheduler:** `user_profile_summary_job.py` runs every hour to summarize user sessions and update user profiles using AI.

### 🗂️ Main Backend API Handlers

- **User:** Upload profile images, fetch user profiles, and look up users by email.
- **Auth:** Login and signup endpoints for user authentication.
- **Product:** Retrieve product metadata and list all products (with pagination).
- **AI:**
  - Object detection (YOLO) and image retrieval (FAISS).
  - Multimodal and text-only fashion advisor responses.
  - Online search agent for trend validation.
- **Voice:** Audio-to-text conversion for voice queries.
- **Trend Geo:** Recommend trendy local stores based on user style and location.
- **User Profile Scheduler:** Periodically summarizes user sessions and updates user profiles using AI (see `backend/services/user_profile_summary_job.py`).

### 🖥️ Main Frontend Pages

- **Home:** Landing page with trending items and AI chat.
- **Product:** Product detail view.
- **User Profile:** View user profile by ID or email.
- **Login/Signup:** Unified authentication page.
- **404:** Not found page for invalid routes.

---

### 🧠 Core Features: 
#### 🖼️ Image & Voice Interaction
Users can upload an image of themselves or use voice to activate search.
System identifies fashion objects (hat, shoes, pants, etc.) using object detection.
Items are matched semantically, stylistically, and trend-wise.
#### 🤖 AI Workflow (Image-to-Style-Match Inference Chain)

1. User uploads an image or uses a voice command.

2. Backend invokes YOLOv8 Object Detector (tuned for fashion domain).

3. Cropped fashion items are extracted from the image.

4. Each object is embedded using DINOv2 (preferred) or CLIP.

5. Perform vector similarity search in FAISS against a product catalog.

6. Apply threshold to exclude out-of-domain or low-similarity matches.
For each top match:

7. Extract metadata: descriptions, reviews, tactile/material info.

8. Construct multimodal context pairs (<cropped image, metadata>).

9. Invoke LLaVA-13B variant (e.g. LLAVA-MORE from Agentverse) for analysis.

10. Understand textures, colors, trends, and generate styled recommendations.

11. Optionally route to reasoning agents like DeepSeek R1, Gemini.

12. Use Tavily or ASI-One for trend validation via web.

13. Use Google Maps Places Agent for nearby store results.

14. Use Groq-powered TTS for audio feedback (if needed).

15. Output curated product matches with styling explanation and links.

### 🔗 Tech Stack & Tools 
#### `frontend/`
- Framework: 
  - Next.js + TypeScript
- Styling:
  - Tailwind CSS
- Voice:
  - Web Speech API
- Features:
  - File upload
  - voice-controlled input
  - styled results

#### `backend/`
- Framework: FastAPI
- DB:
  - Supabase for metadata
  - FAISS for vector search
- Modules:
  - upload_handler.py
  - object_detector.py
  - embedder.py
  - vector_search.py with threshold filter
  - catalog_parser.py,
  - multimodal_router.py,
  - agent_orchestrator.py
- Logic:
  - Orchestrates model inference pipeline
  - trend validation
  - feedback loop

#### `ai-model/`
- Detectors:
  - YOLOv8 (custom head)
- Embedders:
  - DINOv2 (or CLIP fallback)
- LLMs:
  - LLAVA-MORE (LLaVA-LLaMA-13B variant)
- Agents:
  - Reasoning: DeepSeek R1 or Gemini (Agentverse)
  - Trend/Web: Tavily or ASI-One
  - Local Map: Google Maps Places Agent
  - Hosting: Snowflake for compute + vector DB + scalable model serving
  - TTS: Groq for voice output


### ✅ Success Metrics
⏱️ Latency < 2s end-to-end
🧠 ≥80% user-rated match accuracy
🔁 ≥40% voice feature usage
🛒 ≥10% conversion from AI-styled bundles

### 🧍 Target User Persona
Style-Conscious Consumers – highly visual, trend-aware users who:

Prefer style cohesion over brand loyalty.
Make purchase decisions based on how items complement their current look.
Engage more through visuals and natural language than text or category filters.

---

This MVP should be built with modularity, agent flexibility, and cloud-scalable AI at its core, enabling multimodal style recognition, personalized recommendations, and local shopping discovery through cutting-edge tools and agents.

Here is an architecture of ai workflow (image 1) and an architecture of computational structure (image 2)
