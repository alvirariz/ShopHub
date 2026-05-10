export const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  // If the backend runs on port 3000, we prepend it for relative uploaded images
  // For production, this should be an environment variable.
  const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
  return `${backendUrl}${url}`;
};
