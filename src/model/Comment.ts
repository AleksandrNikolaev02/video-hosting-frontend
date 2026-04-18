
type Like = {
  count: number;
  belong: boolean;
};

type Dislike = {
  count: number;
  belong: boolean;
};

export type Comment = {
  id: number;
  createdAt: string;
  content: string;
  creatorId: number;
  belong: boolean;
  like: Like;
  dislike: Dislike;

  replies?: Comment[];
};