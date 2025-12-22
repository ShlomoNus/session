import express from "express";
import cookieParser from "cookie-parser";

import { requireJwtGlobal } from "./middleware/requireJwtGlobal";

import { authRouter } from "./routes/auth.routes";
import { companyRouter } from "./routes/company.routes";
import { sessionRouter } from "./routes/session.routes";

export const app = express();

app.use(express.json());
app.use(cookieParser());

// JWT is validated globally (no identity extracted)
app.use(requireJwtGlobal);

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use(authRouter);

// ONLY this route creates a session
app.use(companyRouter);

// Routes that require an existing company session
app.use("/session", sessionRouter);
