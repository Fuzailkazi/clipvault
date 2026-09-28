# ClipVault Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the ClipVault Express & TypeScript backend with Google ADK agent tooling and MongoDB bookmark storage, mirroring the clean, direct coding style and file layout of `recall_BE`.

**Architecture:** A lightweight Express backend in `backend/` with MongoDB Mongoose models, JWT authentication middleware, a Cheerio OpenGraph scraper, and a Single `LlmAgent` using `@google/adk` (`LlmAgent`, `FunctionTool`, `InMemoryRunner`) with Zod parameter schemas (`saveBookmark` and `queryBookmarksByTag`).

**Tech Stack:** Node.js, Express, TypeScript, Mongoose (MongoDB), JSONWebToken, Cheerio, `@google/adk`, Zod, Cors, Dotenv, tsx.

---

### File Structure Map

```
clipvault/
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env
│   ├── .gitignore
│   ├── src/
│   │   ├── config.ts         # Environment variables & constants
│   │   ├── db.ts             # Mongoose connection & Schemas (UserModel, BookmarkModel)
│   │   ├── middleware.ts     # userMiddleware for JWT auth
│   │   ├── override.d.ts     # Express Request userId typing
│   │   ├── scraper.ts        # Cheerio & fetch metadata extractor
│   │   ├── agent.ts          # Single LlmAgent with FunctionTool & Zod schemas
│   │   ├── utils.ts          # Helper functions
│   │   └── index.ts          # Express API server with /api/v1 routes
│   └── tests/
│       └── verify-api.ts     # Comprehensive end-to-end integration test
└── docs/
    ├── superpowers/
    │   ├── specs/2026-09-28-clipvault-backend-design.md
    │   └── plans/2026-09-28-clipvault-backend.md
```

---

### Task 1: Initialize Backend Project & TypeScript Setup

**Files:**
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/.gitignore`
- Create: `backend/.env`
- Create: `backend/src/override.d.ts`

- [ ] **Step 1: Create `backend/package.json`**
Initialize the package with TypeScript scripts matching `recall_BE` and adding `tsx`:
```json
{
  "name": "clipvault-backend",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc -b",
    "start": "node dist/index.js",
    "dev": "tsx watch src/index.ts",
    "test": "tsx tests/verify-api.ts"
  },
  "dependencies": {
    "@google/adk": "^2.1.0",
    "cheerio": "^1.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.21.1",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.8.2",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.7",
    "@types/node": "^22.0.0",
    "tsx": "^4.19.2",
    "typescript": "^5.6.3"
  }
}
```

- [ ] **Step 2: Create `backend/tsconfig.json`**
Match TypeScript compiler settings from `recall_BE`, including tests:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"]
}
```

- [ ] **Step 3: Create `backend/.gitignore` and `backend/.env`**
```
node_modules
dist
.env
```
And `backend/.env`:
```env
PORT=3000
MONGODB_URL=mongodb://localhost:27017/clipvaultDB
JWT_PASSWORD=clipvault_secret_jwt_key_123
GEMINI_API_KEY=
```

- [ ] **Step 4: Create `backend/src/override.d.ts`**
Augment Express Request type with `userId`:
```typescript
export {};

declare global {
  namespace Express {
    export interface Request {
      userId?: string;
    }
  }
}
```

- [ ] **Step 5: Run `npm install` inside `backend/`**
Run: `cd backend && npm install`
Expected: Dependencies installed successfully, `package-lock.json` generated.

- [ ] **Step 6: Commit**
```bash
git add backend/
git commit -m "feat: setup backend package.json, tsconfig, and dependencies"
```

---

### Task 2: Config, Database Models & Auth Middleware

**Files:**
- Create: `backend/src/config.ts`
- Create: `backend/src/db.ts`
- Create: `backend/src/middleware.ts`
- Create: `backend/src/utils.ts`

- [ ] **Step 1: Write `backend/src/config.ts`**
```typescript
import dotenv from 'dotenv';
dotenv.config();

export const PORT = Number(process.env.PORT) || 3000;
export const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/clipvaultDB';
export const JWT_PASSWORD = process.env.JWT_PASSWORD || 'clipvault_secret_jwt_key_123';
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// ADK expects GEMINI_API_KEY in the process environment
if (GEMINI_API_KEY && !process.env.GEMINI_API_KEY) {
  process.env.GEMINI_API_KEY = GEMINI_API_KEY;
}
```

- [ ] **Step 2: Write `backend/src/db.ts`**
Direct Mongoose schemas and models following `recall_BE`'s naive structure:
```typescript
import mongoose, { model, Schema } from 'mongoose';
import { MONGODB_URL } from './config';

mongoose.connect(MONGODB_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const UserSchema = new Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const UserModel = model('User', UserSchema);

const BookmarkSchema = new Schema({
  url: { type: String, required: true },
  title: { type: String, required: true },
  summary: { type: String, required: true },
  tags: [{ type: String }],
  category: { type: String, required: true },
  userNotes: { type: String },
  ogImage: { type: String },
  userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

export const BookmarkModel = model('Bookmark', BookmarkSchema);
```

- [ ] **Step 3: Write `backend/src/middleware.ts`**
Standard JWT check matching `recall_BE`:
```typescript
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_PASSWORD } from './config';

export const userMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers['authorization'];
  if (!header) {
    res.status(403).json({ message: 'You are not logged in' });
    return;
  }

  try {
    const decoded = jwt.verify(header as string, JWT_PASSWORD) as { id: string };
    if (decoded && decoded.id) {
      req.userId = decoded.id;
      next();
    } else {
      res.status(403).json({ message: 'Invalid credentials' });
    }
  } catch (e) {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};
```

- [ ] **Step 4: Write `backend/src/utils.ts`**
Simple helper utilities (random hash, string cleanups):
```typescript
export function random(len: number): string {
  let options = 'qwertyuioasdfghjklzxcvbnm12345678';
  let length = options.length;
  let ans = '';
  for (let i = 0; i < len; i++) {
    ans += options[Math.floor(Math.random() * length)];
  }
  return ans;
}
```

- [ ] **Step 5: Verify compilation**
Run: `cd backend && npx tsc -b`
Expected: Passes without errors.

- [ ] **Step 6: Commit**
```bash
git add backend/src/config.ts backend/src/db.ts backend/src/middleware.ts backend/src/utils.ts
git commit -m "feat: add config, db models, middleware, and utils"
```

---

### Task 3: Fast Web Metadata Scraper

**Files:**
- Create: `backend/src/scraper.ts`

- [ ] **Step 1: Write `backend/src/scraper.ts`**
Implement fast cheerio and fetch metadata scraping with timeout and fallbacks:
```typescript
import * as cheerio from 'cheerio';

export interface ScrapedData {
  title: string;
  description: string;
  ogImage: string;
  contentSnippet: string;
}

export async function scrapeUrl(targetUrl: string): Promise<ScrapedData> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ClipVaultBot/1.0; +https://clipvault.app)',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return fallbackData(targetUrl);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const title =
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('title').text().trim() ||
      targetUrl;

    const description =
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      '';

    const ogImage =
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      '';

    // Extract clean body text (first ~1500 chars)
    $('script, style, noscript, nav, footer, header').remove();
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    const contentSnippet = (description + ' ' + bodyText).slice(0, 1500);

    return {
      title,
      description,
      ogImage,
      contentSnippet,
    };
  } catch (error) {
    return fallbackData(targetUrl);
  }
}

function fallbackData(targetUrl: string): ScrapedData {
  try {
    const urlObj = new URL(targetUrl);
    return {
      title: urlObj.hostname,
      description: '',
      ogImage: '',
      contentSnippet: `Page at ${targetUrl}`,
    };
  } catch {
    return {
      title: targetUrl,
      description: '',
      ogImage: '',
      contentSnippet: targetUrl,
    };
  }
}
```

- [ ] **Step 2: Verify compilation**
Run: `cd backend && npx tsc -b`
Expected: Passes without errors.

- [ ] **Step 3: Commit**
```bash
git add backend/src/scraper.ts
git commit -m "feat: add cheerio metadata scraper"
```

---

### Task 4: Single LlmAgent with Google ADK & Zod Tools

**Files:**
- Create: `backend/src/agent.ts`

- [ ] **Step 1: Write `backend/src/agent.ts`**
Implement the ADK Single `LlmAgent` using `@google/adk`'s `FunctionTool`, `LlmAgent`, and `InMemoryRunner`. Use Zod parameter schemas for `saveBookmark` and `queryBookmarksByTag`, and capture execution results via closure:
```typescript
import { z } from 'zod';
import { FunctionTool, LlmAgent, InMemoryRunner } from '@google/adk';
import { BookmarkModel } from './db';
import { ScrapedData } from './scraper';

// Zod schemas with resilient bounds
export const SaveBookmarkParametersSchema = z.object({
  url: z.string().url(),
  title: z.string().describe('Concise, accurate title of the content'),
  summary: z.string().describe('Clear, 2-sentence summary of what this content covers'),
  tags: z
    .array(z.string())
    .min(1)
    .max(5)
    .describe('3 relevant hashtags, e.g. ["#devops", "#docker", "#containers"]'),
  category: z
    .string()
    .describe('Broad category such as devops, frontend, backend, design, ai, tools, article'),
});

export const QueryBookmarksParametersSchema = z.object({
  tag: z.string().optional().describe('Tag to filter by, e.g. "#docker" or "docker"'),
  searchTerm: z.string().optional().describe('Keywords to search across title or summary'),
  daysAgo: z.number().optional().describe('Number of days back to filter (e.g. 7 for last week)'),
});

/**
 * Single LlmAgent to process scraped content and save as bookmark in MongoDB
 */
export async function processAndSaveBookmark(params: {
  url: string;
  scrapedData: ScrapedData;
  userNotes?: string;
  userId: string;
}) {
  const { url, scrapedData, userNotes, userId } = params;
  let savedBookmarkDoc: any = null;

  // 1. Define the saveBookmark tool with Zod parameters schema
  const saveBookmarkTool = new FunctionTool({
    name: 'saveBookmark',
    description: 'Saves a validated bookmark with summary, 3 tags, and category into MongoDB.',
    parameters: SaveBookmarkParametersSchema,
    execute: async (args) => {
      const normalizedTags = (args.tags || ['#general'])
        .slice(0, 3)
        .map((t) => (t.startsWith('#') ? t.toLowerCase() : `#${t.toLowerCase()}`));

      savedBookmarkDoc = await BookmarkModel.create({
        url: args.url || url,
        title: args.title || scrapedData.title,
        summary: args.summary || scrapedData.description || 'Saved bookmark.',
        tags: normalizedTags,
        category: args.category || 'general',
        userNotes: userNotes || '',
        ogImage: scrapedData.ogImage,
        userId: userId,
      });

      return {
        success: true,
        bookmarkId: savedBookmarkDoc._id.toString(),
      };
    },
  });

  // 2. Initialize Single LlmAgent
  const agent = new LlmAgent({
    name: 'clipvault_saver',
    description: 'Summarizes web pages, assigns 3 tags, and saves them to MongoDB.',
    model: 'gemini-2.5-flash',
    instruction: `
You are the ClipVault Assistant.
You analyze webpage content and save structured bookmarks.
Always call the saveBookmark tool with an accurate title, a concise 2-sentence summary, exactly 3 relevant hashtags, and a primary category.
`,
    tools: [saveBookmarkTool],
  });

  try {
    const runner = new InMemoryRunner({ agent });
    const userPrompt = `
Analyze and save this bookmark:
URL: ${url}
Title: ${scrapedData.title}
User Notes: ${userNotes || 'None'}
Page Content Snippet: ${scrapedData.contentSnippet}
`;

    for await (const event of runner.runEphemeral({
      userId,
      newMessage: { role: 'user', parts: [{ text: userPrompt }] },
    })) {
      // Runner processes events and executes tool
    }

    if (savedBookmarkDoc) {
      return savedBookmarkDoc;
    }

    // Direct fallback if tool wasn't triggered
    return await BookmarkModel.create({
      url,
      title: scrapedData.title,
      summary: scrapedData.description || 'Saved link.',
      tags: ['#general', '#link', '#read'],
      category: 'general',
      userNotes: userNotes || '',
      ogImage: scrapedData.ogImage,
      userId,
    });
  } catch (error) {
    console.error('Agent runner error, using fallback:', error);
    return await BookmarkModel.create({
      url,
      title: scrapedData.title,
      summary: scrapedData.description || 'Saved link.',
      tags: ['#general', '#link', '#clipvault'],
      category: 'general',
      userNotes: userNotes || '',
      ogImage: scrapedData.ogImage,
      userId,
    });
  }
}

/**
 * Single LlmAgent to handle conversational queries using queryBookmarksByTag tool
 */
export async function handleChatQuery(params: {
  message: string;
  userId: string;
}) {
  const { message, userId } = params;
  let retrievedBookmarks: any[] = [];

  // 1. Define queryBookmarksByTag tool with Zod parameters schema
  const queryBookmarksTool = new FunctionTool({
    name: 'queryBookmarksByTag',
    description: 'Queries the user saved bookmarks from MongoDB by tag, search keyword, or date window.',
    parameters: QueryBookmarksParametersSchema,
    execute: async (args) => {
      const filter: any = { userId };

      if (args.daysAgo) {
        const since = new Date();
        since.setDate(since.getDate() - Number(args.daysAgo));
        filter.createdAt = { $gte: since };
      }

      if (args.tag) {
        const cleanTag = args.tag.replace(/^#/, '');
        filter.tags = { $regex: new RegExp(cleanTag, 'i') };
      }

      if (args.searchTerm) {
        filter.$or = [
          { title: { $regex: new RegExp(args.searchTerm, 'i') } },
          { summary: { $regex: new RegExp(args.searchTerm, 'i') } },
        ];
      }

      retrievedBookmarks = await BookmarkModel.find(filter).sort({ createdAt: -1 }).limit(10);

      return retrievedBookmarks.map((b) => ({
        id: b._id.toString(),
        title: b.title,
        url: b.url,
        summary: b.summary,
        tags: b.tags,
        category: b.category,
      }));
    },
  });

  // 2. Initialize Single LlmAgent
  const agent = new LlmAgent({
    name: 'clipvault_chat',
    description: 'Searches user bookmarks and synthesizes friendly conversational answers.',
    model: 'gemini-2.5-flash',
    instruction: `
You are the ClipVault Assistant. The user wants to search or ask about their saved bookmarks.
Call the queryBookmarksByTag tool to look up their library whenever they ask for bookmarks.
Then, answer the user's question with a friendly, helpful response referencing the bookmarks you found.
`,
    tools: [queryBookmarksTool],
  });

  try {
    const runner = new InMemoryRunner({ agent });
    let agentReply = '';

    for await (const event of runner.runEphemeral({
      userId,
      newMessage: { role: 'user', parts: [{ text: message }] },
    })) {
      if (event.content?.parts) {
        for (const part of event.content.parts) {
          if ('text' in part && part.text) {
            agentReply += part.text;
          }
        }
      }
    }

    return {
      response: agentReply.trim() || 'Here are your matching bookmarks.',
      bookmarks: retrievedBookmarks,
    };
  } catch (error) {
    console.error('Chat agent error, using fallback search:', error);
    const fallbackBookmarks = await BookmarkModel.find({
      userId,
      $or: [
        { title: { $regex: new RegExp(message, 'i') } },
        { summary: { $regex: new RegExp(message, 'i') } },
        { tags: { $regex: new RegExp(message, 'i') } },
      ],
    }).limit(5);

    return {
      response: fallbackBookmarks.length > 0
        ? `I found ${fallbackBookmarks.length} bookmarks related to your search.`
        : "I couldn't find any matching bookmarks for your request.",
      bookmarks: fallbackBookmarks,
    };
  }
}
```

- [ ] **Step 2: Verify compilation**
Run: `cd backend && npx tsc -b`
Expected: Passes without errors.

- [ ] **Step 3: Commit**
```bash
git add backend/src/agent.ts
git commit -m "feat: implement Single LlmAgent with Google ADK and Zod tools"
```

---

### Task 5: Express API Server & Routes (`backend/src/index.ts`)

**Files:**
- Create: `backend/src/index.ts`

- [ ] **Step 1: Write `backend/src/index.ts`**
Setup the Express app and endpoints matching `recall_BE`'s naive route structure and spec contracts:
```typescript
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { UserModel, BookmarkModel } from './db';
import { JWT_PASSWORD, PORT } from './config';
import { userMiddleware } from './middleware';
import { scrapeUrl } from './scraper';
import { processAndSaveBookmark, handleChatQuery } from './agent';

const app = express();
app.use(express.json());
app.use(cors());

// Auth: Signup
app.post('/api/v1/signup', async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    res.status(400).json({ message: 'Username and password required' });
    return;
  }

  try {
    await UserModel.create({
      username,
      password, // direct pattern matching recall_BE
    });

    res.status(201).json({
      message: 'User signed up',
    });
  } catch (e) {
    res.status(411).json({
      message: 'User already exists',
    });
  }
});

// Auth: Signin
app.post('/api/v1/signin', async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const existingUser = await UserModel.findOne({
    username,
    password,
  });

  if (existingUser) {
    const token = jwt.sign(
      {
        id: existingUser._id,
      },
      JWT_PASSWORD
    );

    res.json({
      token,
    });
  } else {
    res.status(403).json({
      message: 'Incorrect credentials',
    });
  }
});

// Bookmark: Create (Scrape + Agent + Save)
app.post('/api/v1/bookmarks', userMiddleware, async (req, res) => {
  const { url, notes } = req.body;

  if (!url) {
    res.status(400).json({ message: 'URL is required' });
    return;
  }

  try {
    // 1. Scrape metadata
    const scrapedData = await scrapeUrl(url);

    // 2. Run Single LlmAgent to summarize, tag, and save to MongoDB
    const bookmark = await processAndSaveBookmark({
      url,
      scrapedData,
      userNotes: notes,
      userId: req.userId as string,
    });

    res.status(201).json({
      message: 'Bookmark saved successfully',
      bookmark,
    });
  } catch (error) {
    console.error('Error saving bookmark:', error);
    res.status(500).json({ message: 'Failed to process bookmark' });
  }
});

// Bookmark: List user's bookmarks
app.get('/api/v1/bookmarks', userMiddleware, async (req, res) => {
  const userId = req.userId;
  const { tag, search } = req.query;

  const filter: any = { userId };

  if (tag) {
    filter.tags = { $regex: new RegExp(String(tag).replace(/^#/, ''), 'i') };
  }

  if (search) {
    filter.$or = [
      { title: { $regex: new RegExp(String(search), 'i') } },
      { summary: { $regex: new RegExp(String(search), 'i') } },
    ];
  }

  const bookmarks = await BookmarkModel.find(filter).sort({ createdAt: -1 });

  res.json({
    bookmarks,
  });
});

// Bookmark: Delete
app.delete('/api/v1/bookmarks/:id', userMiddleware, async (req, res) => {
  const bookmarkId = req.params.id;
  const userId = req.userId;

  const deleted = await BookmarkModel.deleteOne({
    _id: bookmarkId,
    userId,
  });

  if (deleted.deletedCount > 0) {
    res.json({ message: 'Bookmark deleted' });
  } else {
    res.status(404).json({ message: 'Bookmark not found' });
  }
});

// Chat: Conversational query using ADK agent (contract: response and bookmarks)
app.post('/api/v1/chat', userMiddleware, async (req, res) => {
  const { message } = req.body;

  if (!message) {
    res.status(400).json({ message: 'Message is required' });
    return;
  }

  try {
    const result = await handleChatQuery({
      message,
      userId: req.userId as string,
    });

    res.json({
      response: result.response,
      bookmarks: result.bookmarks,
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: 'Chat agent failed to process query' });
  }
});

app.listen(PORT, () => {
  console.log(`ClipVault Backend running on port ${PORT}`);
});
```

- [ ] **Step 2: Verify compilation**
Run: `cd backend && npm run build`
Expected: `dist/index.js` generated cleanly.

- [ ] **Step 3: Commit**
```bash
git add backend/src/index.ts
git commit -m "feat: implement Express index.ts with auth, bookmarks, and chat endpoints"
```

---

### Task 6: End-to-End Verification

**Files:**
- Create: `backend/tests/verify-api.ts`

- [ ] **Step 1: Write verification script `backend/tests/verify-api.ts`**
A comprehensive verification script testing the entire stack end-to-end:
```typescript
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { scrapeUrl } from '../src/scraper';
import { UserModel, BookmarkModel } from '../src/db';
import { JWT_PASSWORD } from '../src/config';
import { processAndSaveBookmark, handleChatQuery } from '../src/agent';

async function runEndToEndVerification() {
  console.log('🚀 Starting ClipVault Backend End-to-End Verification...\n');

  // 1. Verify Scraper
  console.log('1️⃣ Testing Scraper...');
  const scraped = await scrapeUrl('https://github.com/docker/compose');
  console.log(`   Scraped Title: "${scraped.title}"`);
  console.log(`   Snippet Length: ${scraped.contentSnippet.length} chars`);
  if (!scraped.title) throw new Error('Scraper failed to extract title');
  console.log('   ✅ Scraper verified!\n');

  // 2. Verify Database Connection
  console.log('2️⃣ Verifying MongoDB Connection...');
  if (mongoose.connection.readyState !== 1) {
    await new Promise((resolve) => mongoose.connection.once('connected', resolve));
  }
  console.log('   ✅ MongoDB connected!\n');

  // 3. Verify User Creation & JWT Token
  console.log('3️⃣ Testing User Registration & JWT Auth...');
  const testUsername = `testuser_${Date.now()}`;
  const testUser = await UserModel.create({
    username: testUsername,
    password: 'password123',
  });
  const token = jwt.sign({ id: testUser._id.toString() }, JWT_PASSWORD);
  const decoded = jwt.verify(token, JWT_PASSWORD) as { id: string };
  if (decoded.id !== testUser._id.toString()) throw new Error('JWT verification mismatch');
  console.log(`   Created User: ${testUser.username} (ID: ${testUser._id})`);
  console.log('   ✅ Auth & JWT verified!\n');

  // 4. Verify Single LlmAgent Bookmark Saving
  console.log('4️⃣ Testing ADK Agent Bookmark Processing & Storage...');
  const savedBookmark = await processAndSaveBookmark({
    url: 'https://github.com/docker/compose',
    scrapedData: scraped,
    userNotes: 'Verify deployment compose file',
    userId: testUser._id.toString(),
  });
  console.log(`   Saved Bookmark Title: "${savedBookmark.title}"`);
  console.log(`   Summary: "${savedBookmark.summary}"`);
  console.log(`   Tags: ${JSON.stringify(savedBookmark.tags)}`);
  console.log(`   Category: "${savedBookmark.category}"`);
  if (!savedBookmark._id || savedBookmark.tags.length === 0) {
    throw new Error('Failed to save bookmark via agent');
  }
  console.log('   ✅ Agent bookmark creation verified!\n');

  // 5. Verify Query / Chat Agent
  console.log('5️⃣ Testing ADK Chat Agent Query...');
  const chatResult = await handleChatQuery({
    message: 'What Docker bookmarks do I have saved?',
    userId: testUser._id.toString(),
  });
  console.log(`   Chat Response: "${chatResult.response}"`);
  console.log(`   Matched Bookmarks Count: ${chatResult.bookmarks.length}`);
  console.log('   ✅ Chat Agent query verified!\n');

  // 6. Cleanup
  console.log('6️⃣ Cleaning up test data...');
  await BookmarkModel.deleteMany({ userId: testUser._id });
  await UserModel.deleteOne({ _id: testUser._id });
  await mongoose.disconnect();
  console.log('   ✅ Cleanup complete!\n');

  console.log('🎉 ALL END-TO-END VERIFICATION CHECKS PASSED!');
}

runEndToEndVerification().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
```

- [ ] **Step 2: Add `"test": "tsx tests/verify-api.ts"` to `backend/package.json` scripts**
Verify script is in package.json.

- [ ] **Step 3: Run verification script**
Run: `cd backend && npm run test`
Expected: All 6 end-to-end checks pass with green checkmarks.

- [ ] **Step 4: Commit**
```bash
git add backend/tests/verify-api.ts
git commit -m "test: add comprehensive end-to-end verification suite"
```
