import axios from 'axios';
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '../util/auth';

const url = 'http://localhost:8084'

export const api = axios.create({
  baseURL: url, // хост api-gateway
});

export const getBaseUrl = () => {
  return url;
}

api.interceptors.request.use(config => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  res => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await axios.post('noauth/auth-service/token/refresh', {
          token: getRefreshToken()
        });

        const { accessToken, refreshToken } = res.data;

        setTokens(accessToken, refreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return api(originalRequest);

      } catch (e) {
        clearTokens();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// если передан X-user-id, то рекомендации, если нет - самые популярные видео
export const getRecommendations = async () => {
  let res = null;
  if (getAccessToken() != null) {
    res = await api.get('auth/business-service/video/get_popular');
  } else {
    res = await api.get('noauth/business-service/video/get_popular');
  }
  return res.data;
};

// потоковый стриминг видео
export const getVideo = async (filename: string, user_id: number) => {
  const res = await api.get(`noauth/file-service/file_chunk?filename=${filename}&user_id=${user_id}`);
  return res.data;
};


// поставить лайк или дизлайк видео
export const reactVideo = async (
  filename: string,
  evaluateType: 'LIKE' | 'DISLIKE'
) => {
  return api.post('auth/business-service/video/react', {
    filename,
    evaluateType,
  });
};

// получить лайки и дизлайки видео
export const getReactions = async (filename: string) => {
  const res = await api.get(`noauth/business-service/video/get_evaluates/${filename}`);
  return res.data;
};

// Проверить принадлежность лайка и дизлайка видео
export const checkEvaluate = async (filename: string) => {
  const res = await api.post('auth/business-service/video/check_evaluate', { filename });
  return res.data;
};

// получить комментарии к видео
export const getComments = async (filename: string, page: number, size: number) => {
  const res = await api.get(`noauth/business-service/comment/get-comments-video/${filename}?page=${page}&size=${size}`)
  return res.data;
};

// добавить комментарий к видео
export const addComment = async (content: string, videoId: string, commentId?: number) => {
  const res = await api.post('auth/business-service/comment/add', 
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
  const res = await api.post('auth/business-service/comment/react', {
    commentId,
    evaluateType
  });
  return res.data;
};

// редактировать комментарий
export const editComment = async (commentId: number, content: string) => {
  const res = await api.put('auth/business-service/comment/edit', {
    content,
    commentId
  });
  return res.data;
};

// удалить комментарий
export const deleteComment = async (commentId: number) => {
  const res = await api.delete(`auth/business-service/comment/delete/${commentId}`);
  return res.data;
};

// получить подкомментарии к комментарию
export const getSubComments = async (parentId: number, page: number,
                                     size: number, filename: string) => {
  const res = await api.post(`noauth/business-service/comment/get-sub-comments-video?page=${page}&size=${size}`,
    {
      filename,
      parentId
    }
  );
  return res.data;
};

// проверить наличие канала пользователя
export const getMyChannel = async () => {
  const res = await api.get('auth/business-service/channel/my');
  return res.data;
};

export const hasChannel = async (): Promise<boolean> => {
  const res = await api.get('auth/business-service/channel/my');
  return !!res.data;
};

// создать канал пользователя
export const createChannel = async (name: string) => {
  await api.post('auth/business-service/channel/create', {
    name
  });
};

// создать базовое видео
export const createVideo = async (dto: {
  title: string;
  description: string;
}) => {
  const res = await api.post('auth/business-service/video/create', dto);
  return res.data;
};

// загрузить видео по частям
export const uploadChunk = async (formData: FormData) => {
  return api.post('auth/file-service/save_chunk', formData);
};

// сохранить видео после загрузки всех частей
export const saveAllChunks = async (key: string, filename: string, userId: number) => {
  return api.post('auth/file-service/save_all', { userId, key, filename });
};

// опубликовать видео
export const postVideo = async (filename: string) => {
  return api.post(`auth/business-service/video/post?filename=${filename}`);
};

// релевантный поиск видео по запросу
export const searchVideos = async (query: string) => {
  const res = await api.get(`noauth/business-service/video/search?query=${query}`);
  return res.data;
};

// получить список своих видео
export const getMyVideos = async () => {
  const res = await api.get('auth/business-service/video/get_videos');
  return res.data;
};

// удалить свое видео
export const deleteVideo = async (filename: string) => {
  await api.delete('auth/business-service/video/delete', {
    data: {
      filename: filename
    }
  });
};

// получить информацию о канале
export const getChannel = async (id: number) => {
  const res = await api.get(`noauth/business-service/channel/channel/${id}`);
  return res.data;
};

// получить видео с канала пользователя
export const getChannelVideos = async (id: number) => {
  const res = await api.get(`noauth/business-service/video/get_videos_by_channel/${id}`);
  return res.data;
};

// получить информацию о видео
export const getVideoInfo = async (filename: string) => {
  const res = await api.get(`noauth/business-service/video/get_video/${filename}`);
  return res.data;
};

// подписаться на канал
export const subscribe = async (channelId: number) => {
  await api.post('auth/business-service/subscription/subscribe', {
    channelId
  });
};

// отписаться от канала
export const unsubscribe = async (channelId: number) => {
  await api.post('auth/business-service/subscription/unsubscribe', {
    channelId
  });
};

// получить список каналов, на которые подписан пользователь
export const getMySubscriptions = async () => {
  const res = await api.get('auth/business-service/subscription/list-channels');
  return res.data;
};

// добавить просмотр к видео
export const addViewing = async (filename: string) => {
  let res = null;
  
  if (getAccessToken() != null) {
    res = await api.post(`auth/business-service/viewing/add/${filename}`);
  } else {
    res = await api.post(`noauth/business-service/viewing/add/${filename}`);
  }
  
  return res;
};

// создать бизнес сущность превью
export const createPreview = async (videoId: string) => {
  const res = await api.post('auth/business-service/preview/create', {
    videoId
  });
  return res.data;
};

// загрузить превью в Minio
export const uploadPreview = async (file: File, filename: string, originalFilename: string) => {
  const formData = new FormData();

  formData.append('file', file);

  formData.append(
    'dto',
    new Blob(
      [JSON.stringify({ filename, originalFilename })],
      { type: 'application/json' }
    )
  );

  const res = await api.post(
    'auth/file-service/save_preview',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  );

  return res.data;
};

// получить url превью
export const getPreviewUrl = (filename: string | undefined) => {
  return `${url}/noauth/file-service/get_preview/${filename}`;
};

// редактировать видео
export const updateVideo = async (filename: string, data: {
  title: string;
  description: string;
}) => {
  await api.put(`auth/business-service/video/update/${filename}`, data);
};

// обновить превью видео
export const updatePreview = async (file: File, filename: string, originalFilename: string) => {
  const formData = new FormData();

  formData.append(
    'dto',
    new Blob([JSON.stringify({ filename, originalFilename })], {
      type: 'application/json'
    })
  );

  formData.append('file', file);

  await api.put('auth/file-service/update_preview', formData);
};

// добавить коллекцию тегов
export const addTags = async (filename: string, names: string[]) => {
  await api.post('auth/business-service/tag/add', {
    filename,
    names
  });
};

// удалить коллекцию тегов
export const deleteTags = async (filename: string, names: string[]) => {
  await api.delete('auth/business-service/tag/delete', {
    data: { 
      filename: filename,
      names: names
    }
  });
};

// аутентификация пользователя
export const login = async (data: { email: string; password: string }) => {
  const res = await api.post('noauth/auth-service/login', data);
  return res.data;
}

// двухфакторная аутентификация
export const twoFactor = async (data: { email: string; code: string }) => {
  const dto = {
    code: data.code,
    login: data.email
  }
  
  const res = await api.post('noauth/auth-service/twoFactor', dto);
  return res.data;
}