// routes/items.js
import express from "express";
import { fetchRows } from "../lib/google-sheets.js";

const router = express.Router();

/*
 ItemMaster Sheet Columns (as you said):
 A → ID
 B → TYPE
 C → CATEGORY
 ...
 F → SUBCATEGORY
 G → SIZE
*/

router.get("/", async (req, res) => {
  try {
    const { type } = req.query;

    if (!type) {
      return res.status(400).json({ error: "type is required" });
    }

    const rows = await fetchRows("ItemMaster!A2:G");

    const items = rows
      .filter((row) => row[1] === type)
      .map((row) => ({
        id: row[0],
        category: row[2],
        subCategory: row[5],
        size: row[6],
      }));

    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

export default router;

// import express from "express";
// import { fetchRows } from "../lib/google-sheets.js";

// const router = express.Router();

// router.get("/", async (req, res) => {
//   try {
//     const { machineType } = req.query;
//     if (!machineType) {
//       return res.status(400).json({ error: "machineType required" });
//     }
//     const rows = await fetchRows(
//       "ItemMaster!A2:G",
//       (row) => row[1] === machineType
//     );
//     const items = rows.map((row) => ({
//       id: row[0],
//       category: row[2],
//       subCategory: row[5],
//       size: row[6],
//     }));
//     res.json(items);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch items" });
//   }
// });

// export default router;
