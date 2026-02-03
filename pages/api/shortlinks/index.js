import { authenticateUser } from '../../../lib/middleware';
import { createShortlink, getShortlinkByCode, processShortlinkVisit, getUserShortlinks, getShortlinkConfig } from '../../../lib/shortlinks';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Get user's shortlinks
    return authenticateUser(req, res, async () => {
      try {
        const shortlinks = await getUserShortlinks(req.user.id);
        
        res.status(200).json({ 
          shortlinks,
          config: getShortlinkConfig()
        });
      } catch (error) {
        console.error('Get shortlinks error:', error);
        res.status(500).json({ 
          message: error.message || 'Failed to get shortlinks' 
        });
      }
    });
  } else if (req.method === 'POST') {
    // Create a new shortlink
    return authenticateUser(req, res, async () => {
      try {
        const { url } = req.body;

        if (!url) {
          return res.status(400).json({ 
            message: 'URL is required' 
          });
        }

        const shortlink = await createShortlink(url, req.user.id);
        
        res.status(201).json({ 
          message: 'Shortlink created successfully',
          shortlink
        });
      } catch (error) {
        console.error('Create shortlink error:', error);
        res.status(500).json({ 
          message: error.message || 'Failed to create shortlink' 
        });
      }
    });
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}