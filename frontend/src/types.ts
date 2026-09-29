export interface Bookmark {
  _id: string;
  url: string;
  title: string;
  summary: string;
  tags: string[];
  category: string;
  userNotes?: string;
  ogImage?: string;
  userId: string;
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
}

export interface ChatResponse {
  response: string;
  bookmarks: Bookmark[];
}
