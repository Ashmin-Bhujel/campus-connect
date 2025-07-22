import { eq, getTableColumns } from "drizzle-orm";
import { UserInsert, UserSelect } from "../types/user.type";
import { APIError } from "../utils/apiError";
import { APIResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { usersTable } from "../db/schema";
import { db } from "../db";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/tokenGenerator";
import { comparePassword } from "../utils/passwordHasher";
import { CookieOptions } from "express";
import { config } from "dotenv";

// Accessing environment variables
config();
const nodeEnvironment = process.env.NODE_ENV;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
const cookiesOptions: CookieOptions = {
  httpOnly: true,
  secure: nodeEnvironment === "production",
  sameSite: nodeEnvironment === "production" ? "none" : "lax",
};

// Tokens generator
async function generateTokens(userId: number) {
  try {
    // Get user from database
    const { password, refresh_token, ...remainingColumns } =
      getTableColumns(usersTable);
    const response: Omit<UserSelect, "password" | "refresh_token">[] = await db
      .select({ ...remainingColumns })
      .from(usersTable)
      .where(eq(usersTable.id, userId));
    const user = response[0];

    // Check user exist or not
    if (!user) {
      throw new APIError(404, "Failed to get user");
    }

    // Generate access and refresh tokens
    const accessToken = generateAccessToken(
      user.id,
      user.fullname,
      user.email,
      user.role
    );
    const refreshToken = generateRefreshToken(user.id);

    // Check if the tokens are generated or not
    if (!accessToken || !refreshToken) {
      throw new APIError(500, "Failed to generate tokens");
    }

    // Save the refresh token in database
    await db
      .update(usersTable)
      .set({ refresh_token: refreshToken })
      .where(eq(usersTable.id, user.id));

    // Return the generated tokens
    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  } catch (error) {
    throw new APIError(
      500,
      error instanceof Error
        ? error.message
        : "Something went wrong while generating tokens"
    );
  }
}

// Create user controller
const createUser = asyncHandler(async (req, res) => {
  // Get new user data from request body
  const { fullname, email, password, address, contact_no, dob, role } =
    req.body;

  // Validate the received data
  if (
    !fullname ||
    !email ||
    !password ||
    !address ||
    !contact_no ||
    !dob ||
    !role
  ) {
    throw new APIError(400, "Please provide all the required data");
  }

  // Check for existing user
  const queryResponse = await db
    .select({
      id: usersTable.id,
      fullname: usersTable.fullname,
      email: usersTable.email,
      role: usersTable.role,
    })
    .from(usersTable)
    .where(eq(usersTable.email, email));
  const existingUser: Pick<UserSelect, "id" | "fullname" | "email" | "role"> =
    queryResponse[0];
  if (existingUser) {
    throw new APIError(409, "User with same email already exists");
  }

  // Create a new user
  const newUser: UserInsert = {
    fullname: req.body?.fullname,
    email: req.body?.email,
    password: req.body?.password,
    roll_no: req.body?.roll_no,
    programme: req.body?.programme,
    semester: req.body?.semester,
    shift: req.body?.shift,
    address: req.body?.address,
    contact_no: req.body?.contact_no,
    dob: req.body?.dob,
    role: req.body?.role,
  };
  const insertedUserId = await db
    .insert(usersTable)
    .values(newUser)
    .$returningId();

  // Get created user
  const {
    password: createdUserPassword,
    refresh_token: createdUserRefreshToken,
    ...remainingColumns
  } = getTableColumns(usersTable);
  const response: Omit<UserSelect, "password" | "refresh_token">[] = await db
    .select({ ...remainingColumns })
    .from(usersTable)
    .where(eq(usersTable.id, insertedUserId[0].id));
  const createdUser = response[0];

  // Check created user
  if (!createdUser) {
    throw new APIError(400, "Failed to get created user");
  }

  // Send response back
  res.status(201).json(
    new APIResponse(201, "Successfully created a new user", {
      createdUser: createdUser,
    })
  );
});

// Login user controller
const loginUser = asyncHandler(async (req, res) => {
  // Get fullname/email and password from request body
  const { fullname, email, password } = req.body;

  // Validate received data
  if (!fullname && !email) {
    throw new APIError(400, "Username or email is required");
  }
  if (!password) {
    throw new APIError(400, "Password is required");
  }

  // Get user from database
  const response = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));
  const user = response[0];

  // Check if user exist or not
  if (!user) {
    throw new APIError(404, "Invalid user credentials or user does not exits");
  }

  // Validate with original password
  const isValidPassword = await comparePassword(password, user.password);
  if (!isValidPassword) {
    throw new APIError(401, "Incorrect password");
  }

  // Generate JWT tokens
  const { accessToken, refreshToken } = await generateTokens(user.id);

  // Get the logged in user
  const {
    password: userPassword,
    refresh_token: userRefreshToken,
    ...remainingColumns
  } = getTableColumns(usersTable);
  const loggedInUserResponse:
    | Omit<UserSelect, "password" | "refresh_token">[]
    | null = await db
    .select({ ...remainingColumns })
    .from(usersTable)
    .where(eq(usersTable.id, user.id));
  const loggedInUser = loggedInUserResponse[0];

  // Send back response
  res
    .status(200)
    .cookie("accessToken", accessToken, cookiesOptions)
    .cookie("refreshToken", refreshToken, cookiesOptions)
    .json(
      new APIResponse(200, "User logged in successfully", {
        user: loggedInUser,
        accessToken: accessToken,
        refreshToken: refreshToken,
      })
    );
});

export { createUser };
