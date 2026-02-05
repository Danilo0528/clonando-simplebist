import { NextResponse } from 'next/server';
import { FaPoll, FaMobileAlt, FaRocket } from 'react-icons/fa';

const offerwalls = [
  {
    id: 'timewall',
    name: 'Timewall',
    description: 'Complete tasks, surveys, and more. Wide variety of offers.',
    reward: 'Up to 10,000 tokens',
    icon: 'FaPoll' // Using string identifiers for icons
  },
  {
    id: 'ayetstudios',
    name: 'Ayet-Studios',
    description: 'Explore new apps and games. Get rewarded for playing.',
    reward: 'Up to 5,000 tokens',
    icon: 'FaMobileAlt'
  },
  {
    id: 'revlum',
    name: 'Revlum',
    description: 'High-paying surveys and exclusive app trials.',
    reward: 'Up to 15,000 tokens',
    icon: 'FaRocket'
  },
];

export async function GET() {
  // In a real application, you would fetch this data from a database.
  // The component objects cannot be passed directly through the API.
  return NextResponse.json(offerwalls);
}
