// REST routes for the students collection, written with Mongoose.
const express = require("express");
const mongoose = require("mongoose");
const { Student, BRANCHES } = require("../models/Student");

const router = express.Router();

class HttpError extends Error {
  constructor(status, message, errors) { super(message); this.status = status; this.errors = errors; }
}

router.param("id", (req, res, next, id) => {
  if (!mongoose.isValidObjectId(id)) return next(new HttpError(400, "id is not a valid MongoDB ObjectId."));
  next();
});

// Only these fields are taken from the request, so nobody can write _id, createdAt, etc.
const pick = (b) => ({ rollNo: b.rollNo, name: b.name, email: b.email, phone: b.phone, branch: b.branch, year: b.year, cgpa: b.cgpa });

// QUERY FEATURE 3 (aggregation): count and average CGPA of every branch.
// Placed before "/:id" so that "stats" is not read as an id.
router.get("/stats/branches", async (req, res, next) => {
  try {
    const data = await Student.aggregate([
      { $group: { _id: "$branch", students: { $sum: 1 }, avgCgpa: { $avg: "$cgpa" }, topCgpa: { $max: "$cgpa" } } },
      { $project: { _id: 0, branch: "$_id", students: 1, avgCgpa: { $round: ["$avgCgpa", 2] }, topCgpa: 1 } },
      { $sort: { students: -1, branch: 1 } },
    ]);
    const total = data.reduce((n, d) => n + d.students, 0);
    res.json({ success: true, total, data });
  } catch (e) { next(e); }
});

// READ all with QUERY FEATURES 1 and 2: filter (branch, year, search), sort and pagination.
// GET /api/students?branch=IT&year=3&search=an&sort=-cgpa&page=1&limit=5
router.get("/", async (req, res, next) => {
  try {
    const page = Number(req.query.page ?? 1), limit = Number(req.query.limit ?? 5);
    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 50)
      throw new HttpError(400, "page must be 1 or more and limit must be from 1 to 50.");

    const filter = {};
    if (req.query.branch) {
      if (!BRANCHES.includes(req.query.branch)) throw new HttpError(400, `branch must be one of: ${BRANCHES.join(", ")}.`);
      filter.branch = req.query.branch;
    }
    if (req.query.year) {
      const y = Number(req.query.year);
      if (![1, 2, 3, 4].includes(y)) throw new HttpError(400, "year must be 1, 2, 3 or 4.");
      filter.year = y;
    }
    if (req.query.search) {
      const safe = String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");   // search text is not a regex
      filter.$or = [{ name: new RegExp(safe, "i") }, { rollNo: new RegExp(safe, "i") }];
    }

    const sortable = ["name", "cgpa", "year", "createdAt", "rollNo"];
    const sortText = String(req.query.sort ?? "-createdAt");
    const sortField = sortText.replace(/^-/, "");
    if (!sortable.includes(sortField)) throw new HttpError(400, `sort must be one of: ${sortable.join(", ")} (add - for descending).`);

    const [total, data] = await Promise.all([
      Student.countDocuments(filter),
      Student.find(filter).sort(sortText).skip((page - 1) * limit).limit(limit).lean(),
    ]);
    res.json({ success: true, total, page, limit, pages: Math.ceil(total / limit) || 1, count: data.length, data });
  } catch (e) { next(e); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const s = await Student.findById(req.params.id).lean();
    if (!s) throw new HttpError(404, "Student not found.");
    res.json({ success: true, data: s });
  } catch (e) { next(e); }
});

router.post("/", async (req, res, next) => {
  try {
    const created = await Student.create(pick(req.body ?? {}));
    res.status(201).location(`/api/students/${created._id}`).json({ success: true, message: "Student created.", data: created });
  } catch (e) { next(e); }
});

router.put("/:id", async (req, res, next) => {
  try {
    // runValidators makes Mongoose check the schema rules again on update
    const updated = await Student.findByIdAndUpdate(req.params.id, pick(req.body ?? {}), { new: true, runValidators: true, overwrite: false });
    if (!updated) throw new HttpError(404, "Student not found.");
    res.json({ success: true, message: "Student updated.", data: updated });
  } catch (e) { next(e); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const removed = await Student.findByIdAndDelete(req.params.id);
    if (!removed) throw new HttpError(404, "Student not found.");
    res.json({ success: true, message: "Student deleted.", data: removed });
  } catch (e) { next(e); }
});

module.exports = { router, HttpError };
