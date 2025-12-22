import "express-session";

declare module "express-session" {
  interface SessionData {
    userId?: string;
    companyId?: string;
    locale?: "en" | "ru" | "he";
  }
}

export {};