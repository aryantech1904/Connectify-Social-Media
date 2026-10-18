# Connectify – Social Media Platform

Connectify is a full-stack social media web application that allows users to connect with others, share posts, interact through likes and comments, and manage their social profiles.

The project was developed as part of the **CodeAlpha Full Stack Developer Virtual Internship**.

## 🚀 Live Demo

- **Frontend:** https://connectify-social-media-murex.vercel.app/
- **Backend:** https://connectify-social-media-46jw.onrender.com
- **GitHub Repository:** https://github.com/aryantech1904/Connectify-Social-Media

## ✨ Features

- **User Authentication:** User registration and login.
- **User Profiles:** View profiles with usernames, names, and bios.
- **Create Posts:** Share text-based posts with the community.
- **Like System:** Like and unlike posts.
- **Comments:** Add comments to posts.
- **Follow & Unfollow:** Follow or unfollow other users.
- **Followers & Following:** View follower and following lists.
- **Search:** Search posts and usernames.
- **Persistent Database:** Store user and post data using MongoDB Atlas.
- **Responsive Interface:** Clean, modern interface built with React.

## 🛠️ Tech Stack

### Frontend
- React.js
- Vite
- JavaScript
- CSS
- Axios
- Lucide React

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JSON Web Token (JWT)
- bcryptjs
- dotenv

### Tools & Deployment
- Git and GitHub
- Vercel – Frontend Deployment
- Render – Backend Deployment
- MongoDB Atlas – Database Hosting

## 📁 Project Structure

```text
Connectify-Social-Media/
├── backend/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── api/
    │   ├── App.jsx
    │   ├── App.css
    │   ├── AuthTemp.jsx
    │   └── main.jsx
    ├── package.json
    └── index.html
```

## ⚙️ Installation & Setup

### Prerequisites

- Node.js and npm
- MongoDB Atlas account or MongoDB connection string
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/aryantech1904/Connectify-Social-Media.git
cd Connectify-Social-Media
```

### 2. Setup the Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Replace the placeholder values with your own credentials. Never upload real secrets to GitHub.

Start the backend:

```bash
npm run dev
```

The backend will run at `http://localhost:5000`.

### 3. Setup the Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed in your terminal to use the application.

For local development, configure the frontend API URL to point to your local backend as required by the project setup.

## 🔐 Security

- Passwords are hashed using bcryptjs.
- Protected routes use JWT authentication.
- Environment variables are used for sensitive configuration.
- Database credentials and secret keys should not be committed to the repository.

## 🎯 Project Objective

The objective of Connectify is to build a practical full-stack social media application and gain hands-on experience with frontend development, REST APIs, authentication, database integration, and deployment.

## 👨‍💻 Internship

**Program:** CodeAlpha Full Stack Developer Virtual Internship

**Project:** Social Media Platform

## 📄 License

This project was developed for educational and internship purposes.
