import { config } from "dotenv";
import jwt, { SignOptions } from "jsonwebtoken";
import { APIError } from "../utils/apiError";

// Accessing environment variables
config();
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
const refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRY;

// Access token generator
export function generateAccessToken(
  id: number,
  fullname: string,
  email: string,
  role: string
): string {
  if (!accessTokenSecret || !accessTokenExpiry) {
    throw new APIError(400, "JWT configurations are missing");
  }

  return jwt.sign(
    {
      id,
      fullname,
      email,
      role,
    },
    accessTokenSecret,
    {
      expiresIn: accessTokenExpiry,
    } as SignOptions
  );
}

// Refresh token generator
export function generateRefreshToken(id: number): string {
  if (!refreshTokenSecret || !refreshTokenExpiry) {
    throw new APIError(400, "JWT configurations are missing");
  }

  return jwt.sign(
    {
      id,
    },
    refreshTokenSecret,
    {
      expiresIn: refreshTokenExpiry,
    } as SignOptions
  );
}
