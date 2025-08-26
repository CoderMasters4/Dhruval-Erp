import { Router } from 'express';

const router = Router();

// Simple test route
router.get('/test', (req, res) => {
  res.json({ message: 'Visitors route is working' });
});

export default router;


