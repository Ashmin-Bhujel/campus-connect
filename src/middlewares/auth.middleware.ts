import { config } from "dotenv";
import { APIError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt, { JwtPayload } from "jsonwebtoken";
import "../types/express.type";
import { UserSelect } from "../types/user.type";
import { db } from "../db";
import { eq, getTableColumns } from "drizzle-orm";
import { usersTable } from "../db/schema";

// Accessing environment variables
config();
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
if (!accessTokenSecret) {
  throw new APIError(400, "JWT configurations are missing");
}

const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    // Get access token from cookies for request header (authorization header)
    const accessToken =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    // Check if have accessToken or not
    if (!accessToken) {
      throw new APIError(401, "Unauthorized request");
    }

    // Decode the accessToken
    const decodedAccessToken = jwt.verify(
      accessToken,
      accessTokenSecret
    ) as JwtPayload;

    // Get user from database
    const { password, refresh_token, ...remainingColumns } =
      getTableColumns(usersTable);
    const response: Omit<UserSelect, "password" | "refresh_token">[] = await db
      .select({ ...remainingColumns })
      .from(usersTable)
      .where(eq(usersTable.id, decodedAccessToken.id));
    const user = response[0];

    // Check for user
    if (!user) {
      throw new APIError(401, "Invalid access token");
    }

    // Add user to request object
    req.user = user;

    // Pass the control to next
    next();
  } catch (error) {
    // If it's already an APIError, re-throw it
    if (error instanceof APIError) {
      throw error;
    }

    // Handle JWT-specific errors
    if (error instanceof jwt.JsonWebTokenError) {
      throw new APIError(401, "Invalid access token");
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new APIError(401, "Access token expired");
    }

    // Handle other errors (likely database errors)
    throw new APIError(500, "Internal server error");
  }
});

export { verifyJWT };
