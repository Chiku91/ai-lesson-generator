# 🎓 NovaLearn AI — AI Lesson Generator  
### _Auto-generates lessons with explanations, visualizations, TSX code & quizzes_

NovaLearn AI is a fully-automated lesson generator built using **Next.js 16**, **Supabase**, **OpenAI**, and fully typed **TSX visualization components**.

It transforms any topic into:

- 📘 Detailed 900–1300 word explanations  
- ⚛️ Auto-generated, strictly validated TSX components  
- 🧩 Flow diagrams, Graphs, Quizzes, Image-based lessons  
- 📊 Real-time visualization previews  
- 💾 Stored lessons inside Supabase  
- 🎨 Animated futuristic UI  
- 🚀 Ready for Vercel deployment  

## 🚀 Features

- AI-generated conceptual explanation  
- Fully typed TSX component generation  
- Automatic detection of visualization type  
- Built-in TSX validator (TypeScript transpiler)  
- Multi-attempt error-resistant generation  
- Supabase integration  
- "Show Visualization Now" skip-wait button  
- Supports 6 visualization types(Variation of Agent Orchestration)
  - **Flow Diagram**
  - **Cartesian Graph**
  - **Plotly Chart**
  - **Quiz Assessment**
  - **Image-Based Lesson**
  - **Map Renderer**

## 🧠 How the System Works

### 1️⃣ User enters a topic (`index.tsx`)
- Topic is submitted to `/api/generate`
- UI shows status updates: generating, waiting, redirecting
- On success → redirects to `/lessons/[id]`

### 2️⃣ `pages/api/generate.ts` runs the AI generation pipeline
This is the engine of the project. It:

- Inserts placeholder lesson into Supabase  
- Sends specially designed **strict JSON prompt** to OpenAI  
- OpenAI must return:
  - Long (900–1300 word) explanation  
  - Valid TSX visualization component  
  - Visualization schema  
  - Visualization type  
- Validates the TSX using TypeScript compiler  
- Retries **up to 6 times** if TSX is invalid  
- Saves final validated lesson to Supabase  
- Logs everything clearly in the terminal  

### 3️⃣ Visualization selection is automatic  
Depending on keywords inside topic:

| Topic Contains | Visualization Type |
|----------------|--------------------|
| “cartesian”, “distance”, “coordinate” | cartesian |
| “quiz”, “MCQ”, “test”, “assessment” | quiz |
| “image”, “picture”, “photos” | image |
| “process”, “cycle”, “steps”, “reproduction cycle” | flow diagram |
| “map”, “country”, “location” | map |
| numeric patterns | plotly chart |

### 4️⃣ `pages/lessons/[id].tsx` displays lesson  
UI contains:

- Left panel → textual explanation  
- Right panel → visualization or TSX code (with 15 sec auto-switch + manual toggle)  
- Scrollable, responsive layout  

## 🧩 Visual Components

All rendering happens inside `/components/visuals/`.

### 🔹 **VisualHost.tsx**
Decides which visualization renderer to load:
- FlowRenderer  
- CartesianRenderer  
- QuizRenderer  
- ImageRenderer  
- PlotlyRenderer  
- MapRenderer  

### 🔹 **FlowRenderer.tsx**
- Auto-layered top-to-bottom flow layout  
- Nodes with spacing  
- Arrows between steps  
- Used for biological processes, life cycles, workflows  

### 🔹 **CartesianRenderer.tsx**
- Plots points A and B  
- Draws axes, gridlines  
- Used for coordinate geometry topics  

### 🔹 **QuizRenderer.tsx**
- Interactive options  
- Correct/incorrect feedback  

### 🔹 **ImageRenderer.tsx**
- Renders educational images with titles + captions  
- Used when user asks “explain using pictures/images”  

### 🔹 **PlotlyRenderer.tsx**
- Dynamic charts (line, bar, scatter)  
- Used for data or numeric topics  

### 🔹 **MapRenderer.tsx**
- Renders map-based educational visuals  

## 🗄️ Supabase Integration

Inside `/lib/supabase/`:

### **supabaseClient.ts**
Used on the frontend for fetching lessons.

### **serverSupabase.ts**
Used on server-side (API route) for inserting & updating lessons.

Supabase table: `lessons_v3`

Columns:
- `id`
- `title`
- `outline`
- `textual_explanation`
- `generated_code`
- `visualization_type`
- `visualization_schema`
- `status` (“generating”, “generated”, “failed”)
- `created_at`

## ⚙️ Next.js Configuration

### **next.config.ts**
- Forces Webpack mode (fixes Next.js 16 Turbopack issue)
- Adds necessary fallbacks for Supabase & OpenAI

### **vercel.json**
- Ensures deployment uses Webpack  
- Avoids Turbopack errors on Vercel  

## 🔧 Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role
OPENAI_API_KEY=your_openai_key

# 🚀 AI Lesson Generator — Setup & Deployment Guide

This project allows users to generate **AI-powered lessons**, **visualizations**, **Cartesian diagrams**, **flowcharts**, **quizzes**, and **image-based explanations** using OpenAI + Supabase + Next.js 16.

Below are complete instructions for:

- ✅ Installing dependencies  
- ✅ Running locally  
- ✅ Setting environment variables  
- ✅ Deploying to Vercel (preview & production)  

## 📦 1. Install Dependencies

Run this inside the project root:

```bash
npm install

vercel env add

SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY

touch .env.local

🧪 2. Run the Project Locally

npm run dev

Visit your local app:
http://localhost:3000/

3. Deploying to Vercel

vercel

vercel --prod

## 💖 Final Notes

Thank you for exploring the **AI Lesson Generator** project!  
This system represents the fusion of **AI**, **interactive education**, **visual learning**, and **Next.js engineering** — crafted to make learning not just informative, but truly **engaging**, **beautiful**, and **intelligent**.

If you extend it, improve it, or build something amazing on top of it…always up for suggestions and improvements
✨ **The world deserves to see what you create.**  

### 🛠 Built with passion, curiosity, and lots of ❤️  
**by Priyanshu Satapathy**

email- priyanshusat327@gmail.com
