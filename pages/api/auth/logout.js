export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // In a real application, you might want to invalidate the token on the server side
    // For now, we just send a success response and let the frontend handle token removal
    
    res.status(200).json({ 
      message: 'Logout successful' 
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      message: error.message || 'Logout failed' 
    });
  }
}