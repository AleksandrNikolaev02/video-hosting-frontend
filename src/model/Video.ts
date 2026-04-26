type Preview = {
  path: string
  previewId: string
};

export type Video = {
  filename: string;
  userId: number;
  description: string;
  title: string;
  path: string;
  videoStatus: string;
  date: Date;
  countViewing: number;
  video_preview: Preview;
  tags: string[];
  channelId: number;
  subscribersCount: number;
  channelName: string;
};