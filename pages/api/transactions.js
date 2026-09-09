import { getUserFromRequest } from '../../lib/auth';

export default async function handler(req, res) {
  const user = await getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // For now, return an empty array since we don't have a Transaction model
  // In production, you would have a Transaction model and query it here
  if (req.method === 'GET') {
    res.status(200).json([]);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
  