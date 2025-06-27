declare global {
  namespace NodeJS {
    interface ProcessEnv {
      JWT_SECRET: string;
      JWT_EXPIRES_IN?: string;
      NODE_ENV: 'development' | 'production' | 'test';
      PORT?: string;
      DATABASE_URL?: string;
    }
  }
}

export {};