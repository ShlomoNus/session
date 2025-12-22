import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/requireJwtGlobal';

export const authRouter = Router();

// In-memory “database” of users – in production you’d use a real database
const users = [
  { id: 'admin-1', password: 'pass1', role: 'admin' },
  { id: 'user-2',  password: 'pass2', role: 'user'  },
  { id: 'user-3',  password: 'pass3', role: 'user'  },
  { id: 'user-4',  password: 'pass4', role: 'user'  },
  { id: 'user-5',  password: 'pass5', role: 'user'  },
  { id: 'user-6',  password: 'pass6', role: 'user'  },
  { id: 'user-7',  password: 'pass7', role: 'user'  },
  { id: 'user-8',  password: 'pass8', role: 'user'  },
  { id: 'user-9',  password: 'pass9', role: 'user'  },
  { id: 'user-10', password: 'pass10', role: 'user'  }
];

authRouter.post('/login', (req, res) => {
  const { id, password } = req.body;

  // Find the user with matching id and password
  const user = users.find(u => u.id === id && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Sign JWT with user id (sub) and role
  const accessToken = jwt.sign(
    { sub: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  res.json({
    accessToken,
    tokenType: 'Bearer',
    expiresIn: JWT_EXPIRES_IN
  });
});
