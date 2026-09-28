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

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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
    const cleanTag = escapeRegExp(String(tag).replace(/^#/, ''));
    filter.tags = { $regex: new RegExp(cleanTag, 'i') };
  }

  if (search) {
    const escapedSearch = escapeRegExp(String(search));
    filter.$or = [
      { title: { $regex: new RegExp(escapedSearch, 'i') } },
      { summary: { $regex: new RegExp(escapedSearch, 'i') } },
    ];
  }

  try {
    const bookmarks = await BookmarkModel.find(filter).sort({ createdAt: -1 });
    res.json({
      bookmarks,
    });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    res.status(500).json({ message: 'Failed to fetch bookmarks' });
  }
});

// Bookmark: Delete
app.delete('/api/v1/bookmarks/:id', userMiddleware, async (req, res) => {
  const bookmarkId = req.params.id;
  const userId = req.userId;

  try {
    const deleted = await BookmarkModel.deleteOne({
      _id: bookmarkId,
      userId,
    });

    if (deleted.deletedCount > 0) {
      res.json({ message: 'Bookmark deleted' });
    } else {
      res.status(404).json({ message: 'Bookmark not found' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Invalid bookmark ID' });
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
