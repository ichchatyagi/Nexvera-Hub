export const getSocketUrl = (namespace: string) => {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';
  // Strip the /api/v1 or similar suffix to get the base host
  const wsBase = apiBase.replace(/\/api\/v\d+\/?$/, '');
  
  // Ensure we don't have double slashes
  const cleanNamespace = namespace.startsWith('/') ? namespace : `/${namespace}`;
  return `${wsBase}${cleanNamespace}`;
};
