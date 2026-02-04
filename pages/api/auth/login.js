import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key'; // Use an environment variable for the secret key

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, password } = req.body;

  try {
    // Find the user by username or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { email: username },
        ],
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create a JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      SECRET_KEY,
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred during login' });
  }
}
