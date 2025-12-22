import { Router } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/requireJwtGlobal";

export const authRouter = Router();

authRouter.post("/login", (_req, res) => {
  const user = { id: "user-123", role: "admin" };

  const accessToken = jwt.sign(
    { sub: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );

  res.json({
    accessToken,
    tokenType: "Bearer",
    expiresIn: JWT_EXPIRES_IN,
  });
});
