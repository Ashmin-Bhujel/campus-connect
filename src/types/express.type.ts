import { UserSelect } from "./user.type";

// Extending request object to have user property
declare global {
  namespace Express {
    interface Request {
      user?: Omit<UserSelect, "password" | "refresh_token">;
    }
  }
}
