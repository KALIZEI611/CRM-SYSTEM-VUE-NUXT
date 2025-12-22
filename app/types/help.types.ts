export interface Category {
  id: string;
  name: string;
  count: number;
}
export interface Article {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  content: string;
  readTime: number;
  updated?: string;
  related: number[];
}

export interface QuickAction {
  id: number;
  icon: string;
  title: string;
  description: string;
  article: number;
}

export interface PopularArticle {
  id: number;
  title: string;
}

export interface FeedbackForm {
  type: "question" | "suggestion" | "problem" | "other";
  message: string;
  email: string;
}
