// routes/machines.js
import express from "express";
import { fetchRows } from "../lib/google-sheets.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { type } = req.query;

    if (!type) {
      return res.status(400).json({ error: "type is required" });
    }

    const rows = await fetchRows("MachineMaster!A2:C");

    const machines = rows
      .filter((row) => row[2] === type)
      .map((row) => ({
        id: row[0],
        name: row[1],
        type: row[2],
      }));

    res.json(machines);
  } catch {
    res.status(500).json({ error: "Failed to fetch machines" });
  }
});

export default router;

// import express from "express";
// import { fetchRows } from "../lib/google-sheets.js";

// const router = express.Router();

// router.get("/", async (req, res) => {
//   try {
//     const rows = await fetchRows("MachineMaster!A2:C");
//     console.log(rows);
//     const machines = rows.map((row) => ({
//       id: row[0],
//       name: row[1],
//       type: row[2],
//     }));
//     res.json(machines);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch machines" });
//   }
// });

// export default router;
