import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/requireJwtGlobal';
import { users } from '../db';

export const authRouter = Router();

// In-memory “database” of users – in production you’d use a real database


authRouter.post('/login', (req, res) => {
  console.log('Login request body:', req.body);
  const { username, password } = req.body;

  // Find the user with matching username and password
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const accessToken = jwt.sign(
    { username: user.username, companyId: user.companyId },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  res.json({
    accessToken,
    tokenType: 'Bearer',
    expiresIn: JWT_EXPIRES_IN
  });
});
