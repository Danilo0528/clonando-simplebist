import { NextResponse } from 'next/server';

const history = [
  {
    id: 1,
    provider: 'Timewall',
    offer: 'Complete a 10-minute survey',
    reward: 150,
    date: '2024-07-20'
  },
  {
    id: 2,
    provider: 'Ayet-Studios',
    offer: 'Reach level 5 in "Castle Clash"',
    reward: 300,
    date: '2024-07-19'
  },
  {
    id: 3,
    provider: 'Revlum',
    offer: 'Sign up for a free trial',
    reward: 500,
    date: '2024-07-19'
  },
];

export async function GET() {
  // In a real application, you would fetch this data from a database.
  return NextResponse.json(history);
}
