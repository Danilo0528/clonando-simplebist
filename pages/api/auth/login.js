import { loginUser } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ 
        message: 'Username and password are required' 
      });
    }

    const result = await loginUser({ username, password });

    // Remove password from response
    const { passwordHash, ...userWithoutPassword } = result.user;

    res.status(200).json({ 
      message: 'Login successful', 
      user: userWithoutPassword,
      token: result.token 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ 
      message: error.message || 'Login failed' 
    });
  }
}