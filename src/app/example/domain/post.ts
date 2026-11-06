export interface Post {
  id: number;
  title: string;
  body: string;
  authorId: number;
}

export interface PostResponse {
  id: number;
  title: string;
  body: string;
  userId: number;
}

export interface CreatePostRequest {
  title: string;
  body: string;
  userId: number;
}
