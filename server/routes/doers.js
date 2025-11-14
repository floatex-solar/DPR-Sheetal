import express from "express";
import { fetchRows } from "../lib/google-sheets.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const rows = await fetchRows("Doers!A2:D");
    const doer = rows.map((row) => {
      return {
        id: row[0],
        name: row[1],
        email: row[2],
        phone: row[3],
      };
    });
    res.json(doer);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch doers" });
  }
});

export default router;
