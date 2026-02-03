import { registerUser } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ 
        message: 'Username, email, and password are required' 
      });
    }

    // Additional validation
    if (typeof username !== 'string' || username.length < 3 || username.length > 50) {
      return res.status(400).json({ 
        message: 'Username must be between 3 and 50 characters' 
      });
    }

    if (typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ 
        message: 'Valid email is required' 
      });
    }

    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters long' 
      });
    }

    const result = await registerUser({ username, email, password });

    // Remove password from response
    const { passwordHash, ...userWithoutPassword } = result.user;

    res.status(201).json({ 
      message: 'User registered successfully', 
      user: userWithoutPassword,
      token: result.token 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ 
      message: error.message || 'Registration failed' 
    });
  }
}