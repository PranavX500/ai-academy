# 🚀 AI Academy

AI Academy is a modern AI-powered learning platform built to help students learn Artificial Intelligence concepts through an interactive learning experience powered by web learning modules and a WhatsApp AI assistant.

---

# ✨ Features

## 📚 Learning Platform
- Structured AI learning modules
- Learning units with text, videos, and quizzes
- Module progression tracking
- Course completion tracking
- Protected paid modulessss

---

## 🤖 WhatsApp AI Assistant
Integrated WhatsApp chatbot powered through Whapi.

Users can:
- View modules
- Check pricing
- Ask for course help
- Access learning support instantly

---

## 📈 Progress Tracking
- Tracks completed learning units
- Module-level progress
- Course-level progress
- Global completion percentage

---

## 🏆 Certificates
- Auto-generated certificates
- PDF certificate generation
- Automatic email delivery via Brevo
- Triggered when course completion reaches 100%

---

## 🔐 Authentication
- JWT Authentication
- Secure protected routes
- Password hashing using bcrypt

---

# 🛠 Tech Stack

## Frontend
- React
- TypeScript
- Tailwind CSS
- React Router DOM

---

## Backend
- Node.js
- Express.js
- MongoDB
- Mongoose

---

## Integrations
- WhatsApp Bot (Whapi)
- Brevo Email API

---

# 📂 Project Structure

```bash
AI-ACADEMY/
│
├── frontend/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── models/
│   │   ├── middlewares/
│   │   ├── utils/
│   │   └── config/
│
└── README.md


⚙️ Environment Variables

Create .env inside backend:

PORT=5000

MONGO_URI=your_mongodb_url

JWT_SECRET=your_secret

BREVO_API_KEY=your_brevo_api_key

BREVO_SENDER_EMAIL=your_verified_email

WHAPI_TOKEN=your_whapi_token


