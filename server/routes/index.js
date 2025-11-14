import express from "express";
import machinesRouter from "./machines.js";
import supervisorsRouter from "./supervisors.js";
import itemsRouter from "./items.js";
import doers from "./doers.js";
import entriesRouter from "./entries.js";

const router = express.Router();

router.use("/machines", machinesRouter);
router.use("/supervisors", supervisorsRouter);
router.use("/doers", doers);
router.use("/items", itemsRouter);
router.use("/entries", entriesRouter);

export default router;
