import { z } from 'zod';
import { FunctionTool, LlmAgent, InMemoryRunner } from '@google/adk';
import { BookmarkModel } from './db';
import { ScrapedData } from './scraper';
import { escapeRegExp } from './utils';

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
    parameters: SaveBookmarkParametersSchema as any,
    execute: async (args: any) => {
      if (savedBookmarkDoc) {
        return {
          success: true,
          bookmarkId: savedBookmarkDoc._id.toString(),
        };
      }

      const normalizedTags = (args.tags || ['#general'])
        .slice(0, 3)
        .map((t: string) => (t.startsWith('#') ? t.toLowerCase() : `#${t.toLowerCase()}`));

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
    parameters: QueryBookmarksParametersSchema as any,
    execute: async (args: any) => {
      const filter: any = { userId };

      if (args.daysAgo) {
        const since = new Date();
        since.setDate(since.getDate() - Number(args.daysAgo));
        filter.createdAt = { $gte: since };
      }

      if (args.tag) {
        const cleanTag = args.tag.replace(/^#/, '');
        filter.tags = { $regex: new RegExp(escapeRegExp(cleanTag), 'i') };
      }

      if (args.searchTerm) {
        const escaped = escapeRegExp(args.searchTerm);
        filter.$or = [
          { title: { $regex: new RegExp(escaped, 'i') } },
          { summary: { $regex: new RegExp(escaped, 'i') } },
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
          if ('text' in part && part.text && !(part as any).thought) {
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
    const keywords = message
      .split(/\s+/)
      .filter((w) => w.length > 2 && !['what', 'have', 'saved', 'show', 'find', 'with', 'about'].includes(w.toLowerCase()))
      .map(escapeRegExp);

    const orConditions =
      keywords.length > 0
        ? keywords.flatMap((kw) => [
            { title: { $regex: new RegExp(kw, 'i') } },
            { summary: { $regex: new RegExp(kw, 'i') } },
            { tags: { $regex: new RegExp(kw, 'i') } },
          ])
        : [{ title: { $regex: new RegExp(escapeRegExp(message), 'i') } }];

    const fallbackBookmarks = await BookmarkModel.find({
      userId,
      $or: orConditions,
    }).limit(5);

    return {
      response:
        fallbackBookmarks.length > 0
          ? `I found ${fallbackBookmarks.length} bookmark(s) related to your search.`
          : "I couldn't find any matching bookmarks for your request.",
      bookmarks: fallbackBookmarks,
    };
  }
}
