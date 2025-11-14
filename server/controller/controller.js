import { enquirySchema } from "../helper/validator.js";
import { z } from "zod";
import { sheets } from "../lib/google-sheets.js";
import appConfig from "../config/appConfig.js";

const { GOOGLE_SHEET_ID } = appConfig;

export const enquiryController = async (req, res) => {
  try {
    // 1. Body validation
    const body = enquirySchema.parse(req.body);
    const { name, category, message, emailAddress } = body;
    console.log(name, category, message, emailAddress);

    // 2. Google Sheets Entry
    await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: "Sheet4!A:D",
      valueInputOption: "RAW",
      requestBody: {
        values: [[name, emailAddress, category, message]],
      },
    });

    // 3. Response Send
    return res.status(201).json({
      success: true,
      message: "Success",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({
        success: false,
        message: error.errors,
      });
    }

    console.error("Error in enquiryController:", error);

    // Don't send response if headers already sent
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        error: "Failed to save enquiry",
      });
    }
  }
};
