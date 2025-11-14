import dotenv from "dotenv";
dotenv.config();

export default Object.freeze({
  PORT: process.env.PORT || 3001,
  GOOGLE_SHEETS_CLIENT_EMAIL: process.env.GOOGLE_CLIENT_EMAIL,
  GOOGLE_SHEETS_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY,
  GOOGLE_SHEET_ID: process.env.GOOGLE_SHEET_ID,
  FRONTEND_URL: process.env.FRONTEND_URL,
});
