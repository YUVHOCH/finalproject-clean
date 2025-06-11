# Final Project - Full Stack E-commerce & AI Semantic Search

This project is a full-stack application developed as a final project.  
It combines a modern React-based frontend, a Node.js + Express backend, and advanced AI-based semantic search functionality using OpenAI embeddings.

The project structure:

- **Frontend:** React app (`/client`)
- **Backend:** Node.js + Express API (`/server`)
- **AI Search Utilities:** Embedding generation scripts (`generateEmbeddings.js`, CSV files)

---

## Features

- Modern B2C/B2B E-commerce site with React frontend
- Node.js backend with MongoDB database
- AI-based semantic search using OpenAI embeddings
- JWT-based authentication
- Dynamic product catalog with categories, filtering, and search
- Admin tools for product and user management
- Optimized for performance and responsive UX
- Embedding scripts for generating and processing product embeddings

---

## Installation & Running the Project

### 1️⃣ Clone the repository

```bash
git clone https://github.com/YUVOCH/finalproject-clean.git
cd finalproject-clean
```

### 2️⃣ Install root dependencies

```bash
npm install
```

### 3️⃣ Install client and server dependencies

```bash
cd client
npm install

cd ../server
npm install
```

### 4️⃣ Environment Variables

In the `/server` folder, create a `.env` file with the following variables:

```env
MONGO_URI=your-mongodb-uri
JWT_SECRET=your-jwt-secret
OPENAI_API_KEY=your-openai-api-key
```

### 5️⃣ Running the project

To run both server and client concurrently:

```bash
npm run dev
```

Alternatively, you can run them separately:

**Client (React):**

```bash
npm run client
```

**Server (Node.js + Express):**

```bash
npm run server
```

---

## AI Semantic Search Utilities

The project includes a script to generate AI embeddings for products:

- `generateEmbeddings.js` — Generates product embeddings using OpenAI API.
- `input_embeddings.csv` — Input CSV with product data.
- `output_embeddings.csv` — Output CSV with generated embeddings.

To run the embedding script:

```bash
node generateEmbeddings.js
```

*Make sure your `OPENAI_API_KEY` is set in the `.env` file.*

---

## Client README

For more details on working with the React client app, see: [client/README.md](client/README.md)

---

## Notes

- `node_modules/` is excluded from version control (`.gitignore`).
- `.env` file is required to run the server.
- The project can be started with one command: `npm run dev`.

---

## License

MIT

---

## About the Project

This project was developed as part of my Full Stack Development course, combining my experience in E-commerce (B2C/B2B) with hands-on Full Stack development.  
More improvements and features will be added in future versions.

---
