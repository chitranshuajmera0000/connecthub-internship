export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, url } = req;
  const path = url.replace('/api', '');

  // Health check first
  if (method === 'GET' && path === '/health') {
    return res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      method,
      path,
      url
    });
  }

  // Return basic 404 for now
  return res.status(404).json({ 
    error: 'Endpoint not found', 
    path, 
    method, 
    availableEndpoints: ['/health'] 
  });
}
