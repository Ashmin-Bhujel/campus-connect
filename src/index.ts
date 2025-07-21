import { config } from "dotenv";
import { app } from "./app";

// Environment variables
config();
const port = process.env.PORT || 5000;

// Running the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
