import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username },
        ],
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        balance: 0,  // Initialize balance
        tokenBalance: 0,  // Initialize token balance
        boundTokenBalance: 0,  // Initialize bound token balance
        energyPoints: 100,  // Initialize energy points
        hashpowerVirtual: 0,  // Initialize virtual hashpower
        level: 1,  // Initialize level
        xp: 0,  // Initialize XP
      },
    });

    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred during registration' });
  }
}
