# clipvault

Smart URL & Bookmark Organizer powered by Google Agent Development Kit (`@google/adk`), Express, TypeScript, and MongoDB.

## Overview

ClipVault solves the "200+ forgotten browser bookmarks" problem. When you save a link:
1. **Scrapes Metadata**: Extracts OpenGraph tags (`og:title`, `og:description`, `og:image`) and semantic body text using Cheerio.
2. **AI Summarization & Tagging**: A Single `LlmAgent` powered by `@google/adk` and Gemini (`gemini-2.5-flash`) generates a 2-sentence summary, 3 relevant hashtags, and classifies the category.
3. **Conversational Search (Chat Mode)**: Ask natural language questions like *"Show me the bookmarks I saved last week about Docker"*, and the agent resolves queries using MongoDB tool calls.

---

## Architecture

clipvault/
└── backend/
    ├── src/
    │   ├── agent.ts          # Single LlmAgent with Google ADK FunctionTools
    │   ├── config.ts         # Environment configuration
    │   ├── db.ts             # Mongoose schemas (UserModel, BookmarkModel)
    │   ├── index.ts          # Express API server (/api/v1)
    │   ├── middleware.ts     # JWT authentication middleware
    │   ├── scraper.ts        # Cheerio & fetch metadata scraper with fallbacks
    │   └── utils.ts          # Utility functions
    └── tests/
        └── verify-api.ts     # End-to-end integration test suite
```

---

## Tech Stack

- **Runtime:** Node.js (v18+) & TypeScript
- **Framework:** Express.js
- **Database:** MongoDB & Mongoose
- **AI / Agent:** `@google/adk` (Google Agent Development Kit) & Gemini
- **HTML Scraping:** Cheerio
- **Validation:** Zod
- **Authentication:** JSON Web Tokens (JWT)

---

## Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) running locally or a MongoDB Atlas URI

### 2. Installation
```bash
cd backend
npm install
```

### 3. Environment Variables
Create a `.env` file in the `backend/` directory:
```env
PORT=3000
MONGODB_URL=mongodb://localhost:27017/clipvaultDB
JWT_PASSWORD=your_secret_jwt_key
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Running the Backend
Development mode:
```bash
npm run dev
```

Build & Start:
```bash
npm run build
npm start
```

### 5. Running Verification Tests
```bash
npm run test
```

---

## API Endpoints

All endpoints use the `/api/v1` prefix:

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/v1/signup` | Register a new user | No |
| `POST` | `/api/v1/signin` | Sign in and retrieve JWT token | No |
| `POST` | `/api/v1/bookmarks` | Scrape, summarize, and save bookmark | Yes |
| `GET` | `/api/v1/bookmarks` | List bookmarks (optional `tag` / `search` filters) | Yes |
| `DELETE` | `/api/v1/bookmarks/:id` | Delete a bookmark by ID | Yes |
| `POST` | `/api/v1/chat` | Natural language conversational query | Yes |

---

## License

ISC
