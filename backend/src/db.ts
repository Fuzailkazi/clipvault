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
