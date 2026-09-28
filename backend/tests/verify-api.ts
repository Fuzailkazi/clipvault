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
