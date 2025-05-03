// Use the correct server URL based on the environment
export const server = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-domain.com' 
  : 'http://localhost:5000'; 