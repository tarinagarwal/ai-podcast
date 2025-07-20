export interface Podcast {
  id: number;
  title: string;
  description?: string;
  knowledge_base: string;
  length: 'Short' | 'Medium' | 'Long';
  script?: string;
  audio_path?: string;
  video_path?: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePodcastRequest {
  title: string;
  description?: string;
  length: 'Short' | 'Medium' | 'Long';
  knowledgeText?: string;
  knowledgeFile?: File;
}