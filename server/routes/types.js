// routes/types.js
import express from "express";
import { fetchRows } from "../lib/google-sheets.js";

const router = express.Router();

/*
 MachineMaster Sheet Columns:
 A → ID
 B → NAME
 C → TYPE (Blow, Roto, etc)
*/

router.get("/", async (req, res) => {
  try {
    const rows = await fetchRows("MachineMaster!A2:C");

    const types = [...new Set(rows.map((row) => row[2]))].filter(Boolean);

    res.json(types); // e.g. ["Blow", "Roto"]
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch types" });
  }
});

export default router;
