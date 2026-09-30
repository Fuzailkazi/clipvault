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


export function inferMetadataFromContent(url: string, title: string, description: string) {
  let domain = '';
  try {
    domain = new URL(url).hostname.replace(/^www\./, '');
  } catch {
    domain = '';
  }

  const text = `${title} ${description} ${domain}`.toLowerCase();
  const tags = new Set<string>();
  let category = 'general';

  // Domain-based tagging
  if (domain.includes('github')) {
    tags.add('#github');
    tags.add('#code');
    category = 'tools';
  } else if (domain.includes('youtube') || domain.includes('vimeo')) {
    tags.add('#video');
    category = 'article';
  } else if (domain.includes('twitter') || domain.includes('x.com')) {
    tags.add('#social');
    category = 'article';
  } else if (domain.includes('figma') || domain.includes('dribbble')) {
    tags.add('#design');
    tags.add('#ui');
    category = 'design';
  } else if (domain.includes('medium') || domain.includes('dev.to') || domain.includes('hashnode')) {
    tags.add('#article');
    tags.add('#dev');
    category = 'article';
  } else if (domain) {
    const mainHost = domain.split('.')[0];
    if (mainHost && mainHost.length > 2 && !['com', 'org', 'net', 'io', 'app', 'co'].includes(mainHost)) {
      tags.add(`#${mainHost}`);
    }
  }

  // Keyword / Topic inference
  if (/docker|container|kubernetes|k8s|devops|terraform|aws|gcp|azure/i.test(text)) {
    tags.add('#devops');
    if (/docker/i.test(text)) tags.add('#docker');
    category = 'devops';
  } else if (/react|vue|angular|svelte|frontend|css|tailwind|html|javascript|typescript/i.test(text)) {
    tags.add('#frontend');
    if (/react/i.test(text)) tags.add('#react');
    if (/typescript/i.test(text)) tags.add('#typescript');
    category = 'frontend';
  } else if (/node|express|python|rust|golang|backend|api|database|mongodb|postgres|sql/i.test(text)) {
    tags.add('#backend');
    if (/python/i.test(text)) tags.add('#python');
    category = 'backend';
  } else if (/ai|llm|gemini|openai|gpt|machine learning|deep learning|agent/i.test(text)) {
    tags.add('#ai');
    tags.add('#llm');
    category = 'ai';
  } else if (/design|ui|ux|typography|color|figma/i.test(text)) {
    tags.add('#design');
    category = 'design';
  }

  // Ensure 1-3 tags
  const tagList = Array.from(tags).slice(0, 3);
  if (tagList.length === 0) {
    tagList.push('#read');
  }

  const summary = description.trim() || `Bookmark for ${title || domain || url}`;

  return {
    tags: tagList,
    category,
    summary,
  };
}

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
Always call the saveBookmark tool with an accurate title, a concise 2-sentence summary, exactly 3 relevant hashtags based on the actual page content, and a primary category.
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
    const inferred = inferMetadataFromContent(url, scrapedData.title, scrapedData.description);
    return await BookmarkModel.create({
      url,
      title: scrapedData.title,
      summary: inferred.summary,
      tags: inferred.tags,
      category: inferred.category,
      userNotes: userNotes || '',
      ogImage: scrapedData.ogImage,
      userId,
    });
  } catch (error) {
    console.error('Agent runner error, using fallback:', error);
    const inferred = inferMetadataFromContent(url, scrapedData.title, scrapedData.description);
    return await BookmarkModel.create({
      url,
      title: scrapedData.title,
      summary: inferred.summary,
      tags: inferred.tags,
      category: inferred.category,
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
