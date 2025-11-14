import express from "express";
import { fetchRows } from "../lib/google-sheets.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const rows = await fetchRows("MachineMaster!A2:C");
    console.log(rows);
    const machines = rows.map((row) => ({
      id: row[0],
      name: row[1],
      type: row[2],
    }));
    res.json(machines);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch machines" });
  }
});

export default router;
