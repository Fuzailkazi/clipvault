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
