import { google } from "googleapis";
import { GoogleAuth } from "google-auth-library";
import keys from "../keys.json" with { type: "json" };
import appConfig from "../config/appConfig.js";

const { GOOGLE_SHEET_ID } = appConfig;

// Validate that keys are loaded
if (!keys || !keys.client_email || !keys.private_key) {
  console.error("Error: keys.json is missing required fields (client_email, private_key)");
  throw new Error("Google Sheets credentials are missing");
}

// Use GoogleAuth with credentials - this is the recommended approach
// It automatically handles JWT token generation and refresh
// Pass the entire keys object as it contains all necessary service account fields
const auth = new GoogleAuth({
  credentials: keys,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

// Create the sheets client - it will use the auth instance automatically
// The auth will be resolved when the first API call is made
export const sheets = google.sheets({ version: "v4", auth });

export async function fetchRows(range, filter = null) {
  try {
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID,
      range,
    });
    const rows = result.data.values || [];
    console.log(`${rows.length} rows retrieved.`);
    if (filter && typeof filter === "function") {
      return rows.filter(filter);
    }
    return rows;
  } catch (error) {
    console.error(`Error fetching rows from range "${range}":`, error);
    throw new Error(`Failed to fetch rows from Google Sheets: ${error.message}`);
  }
}