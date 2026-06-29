export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  bodyLimit: '1mb',
  dbPath: process.env.DB_PATH || 'easymock.db',
};
