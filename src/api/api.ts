import axios from 'axios';

const url = 'http://localhost:8084'

export const api = axios.create({
  baseURL: url, // хост api-gateway
});

export const getBaseUrl = () => {
  return url;
}

api.interceptors.request.use(config => {
  localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJQcm9qZWN0Iiwic3ViIjoiYWRtaW5AbWFpbC5ydSIsInJvbGUiOiJBRE1JTiIsImlkIjoxLCJleHAiOjE3NzA2Mzc0MDQsImlhdCI6MTczOTEwMTQwNH0.bR-N-fUFKUb-FyHRc76gjKM-Lot6bCqXU0ZcHEG2wTI');
  // убрать потом

  config.headers['X-user-id'] = '1'; // для теста, потом убрать

  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// если передан X-user-id, то рекомендации, если нет - самые популярные видео
export const getRecommendations = async () => {
  const res = await api.get('business-service/video/get_popular');
  return res.data;
};

// потоковый стриминг видео
export const getVideo = async (filename: string, user_id: number) => {
  const res = await api.get(`/file-service/file_chunk?filename=${filename}&user_id=${user_id}`);
  return res.data;
};


// поставить лайк или дизлайк видео
export const reactVideo = async (
  filename: string,
  evaluateType: 'LIKE' | 'DISLIKE'
) => {
  return api.post('/business-service/video/react', {
    filename,
    evaluateType,
  });
};

// получить лайки и дизлайки видео
export const getReactions = async (filename: string) => {
  const res = await api.get(`business-service/video/get_evaluates/${filename}`);
  return res.data;
};

// Проверить принадлежность лайка и дизлайка видео
export const checkEvaluate = async (filename: string) => {
  const res = await api.post('business-service/video/check_evaluate', { filename });
  return res.data;
};

// получить комментарии к видео
export const getComments = async (filename: string, page: number, size: number) => {
  const res = await api.get(`business-service/comment/get-comments-video/${filename}?page=${page}&size=${size}`)
  return res.data;
};

// добавить комментарий к видео
export const addComment = async (content: string, videoId: string, commentId?: number) => {
  const res = await api.post('business-service/comment/add', 
    {
      content,
      videoId,
      commentId
    }
  );
  return res.data;
};

// поставить лайк или дизлайк комментарию
export const reactComment = async (commentId: number, evaluateType: 'LIKE' | 'DISLIKE') => {
  const res = await api.post('business-service/comment/react', {
    commentId,
    evaluateType
  });
  return res.data;
};

// редактировать комментарий
export const editComment = async (commentId: number, content: string) => {
  const res = await api.put('business-service/comment/edit', {
    content,
    commentId
  });
  return res.data;
};

// удалить комментарий
export const deleteComment = async (commentId: number) => {
  const res = await api.delete(`business-service/comment/delete/${commentId}`);
  return res.data;
};

// получить подкомментарии к комментарию
export const getSubComments = async (parentId: number, page: number,
                                     size: number, filename: string) => {
  const res = await api.post(`business-service/comment/get-sub-comments-video?page=${page}&size=${size}`,
    {
      filename,
      parentId
    }
  );
  return res.data;
};

// проверить наличие канала пользователя
export const getMyChannel = async () => {
  const res = await api.get('business-service/channel/my');
  return res.data;
};

export const hasChannel = async (): Promise<boolean> => {
  const res = await api.get('business-service/channel/my');
  return !!res.data;
};

// создать канал пользователя
export const createChannel = async (name: string) => {
  await api.post('business-service/channel/create', {
    name
  });
};

// создать базовое видео
export const createVideo = async (dto: {
  title: string;
  description: string;
}) => {
  const res = await api.post('business-service/video/create', dto);
  return res.data;
};

// загрузить видео по частям
export const uploadChunk = async (formData: FormData) => {
  return api.post('file-service/save_chunk', formData);
};

// сохранить видео после загрузки всех частей
export const saveAllChunks = async (key: string, filename: string, userId: number) => {
  return api.post('file-service/save_all', { userId, key, filename });
};

// опубликовать видео
export const postVideo = async (filename: string) => {
  return api.post(`business-service/video/post?filename=${filename}`);
};

// релевантный поиск видео по запросу
export const searchVideos = async (query: string) => {
  const res = await api.get(`business-service/video/search?query=${query}`);
  return res.data;
};

// получить список своих видео
export const getMyVideos = async () => {
  const res = await api.get('business-service/video/get_videos');
  return res.data;
};

// удалить свое видео
export const deleteVideo = async (filename: string) => {
  await api.delete('business-service/video/delete', {
    data: {
      filename: filename
    }
  });
};

// получить информацию о канале
export const getChannel = async (id: number) => {
  const res = await api.get(`business-service/channel/channel/${id}`);
  return res.data;
};

// получить видео с канала пользователя
export const getChannelVideos = async (id: number) => {
  const res = await api.get(`business-service/video/get_videos_by_channel/${id}`);
  return res.data;
};

// получить информацию о видео
export const getVideoInfo = async (filename: string) => {
  const res = await api.get(`business-service/video/get_video/${filename}`);
  return res.data;
};

// подписаться на канал
export const subscribe = async (channelId: number) => {
  await api.post('business-service/subscription/subscribe', {
    channelId
  });
};

// отписаться от канала
export const unsubscribe = async (channelId: number) => {
  await api.post('business-service/subscription/unsubscribe', {
    channelId
  });
};

// получить список каналов, на которые подписан пользователь
export const getMySubscriptions = async () => {
  const res = await api.get('business-service/subscription/list-channels');
  return res.data;
};