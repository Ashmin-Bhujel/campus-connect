import { eq, getTableColumns } from "drizzle-orm";
import { UserInsert, UserSelect } from "../types/user.type";
import { APIError } from "../utils/apiError";
import { APIResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { usersTable } from "../db/schema";
import { db } from "../db";

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

export { createUser };
