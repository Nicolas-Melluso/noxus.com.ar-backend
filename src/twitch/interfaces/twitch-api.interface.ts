// src/twitch/interfaces/twitch-api.interface.ts
export interface TwitchTokenResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
  }
  
  export interface TwitchStream {
    id: string;
    user_id: string;
    user_login: string;
    user_name: string;
    game_id: string;
    game_name: string;
    type: 'live' | 'vod';
    title: string;
    viewer_count: number;
    started_at: string;
    language: string;
    thumbnail_url: string;
    tag_ids: string[];
  }
  
  export interface TwitchStreamsResponse {
    data: TwitchStream[];
  }