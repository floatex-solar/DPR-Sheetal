import express from "express";
import { sheets } from "../lib/google-sheets.js";
import appConfig from "../config/appConfig.js";
const router = express.Router();

const { GOOGLE_SHEET_ID } = appConfig;

function formatForSheets(passedDate) {
  const date = passedDate ? new Date(passedDate) : new Date();
  const pad = (n) => n.toString().padStart(2, "0");

  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    " " +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes()) +
    ":" +
    pad(date.getSeconds())
  );
}

router.post("/", async (req, res) => {
  try {
    const body = req.body;
    console.log(body);

    const finalData = body.machineSections.flatMap((machineSection) =>
      machineSection.productionEntries.map((entry) => [
        formatForSheets(),
        formatForSheets(body.productionDate) || "-",
        body.shift || "-",
        body.supervisor || "-",
        body.doer || "-",
        machineSection.machine?.name || "-",
        entry.category || "-",
        entry.subCategory || "-",
        entry.size || "-",
        entry.uom || "-",
        entry.okQty || "-",
        entry.okWeight || "-",
        entry.rejectedQty || "-",
        entry.rejectedWeight || "-",
      ])
    );

    // 2. Google Sheets Entry
    await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEET_ID,
      range:
        body.shift === "A+B"
          ? "DailyProductionReport!A:N"
          : "ShiftProductionReport!A:N",
      valueInputOption: "RAW",
      requestBody: { values: finalData },
    });

    res.json({ success: true, message: "Entry saved successfully" });
  } catch (error) {
    console.error("Save error:", error);
    res.status(500).json({ error: "Failed to save entry" });
  }
});

export default router;
