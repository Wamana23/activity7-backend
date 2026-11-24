const router = require("express").Router();
const pool = require("../db");

const STATUSES = ["Pending", "In progress", "Completed"];
const COLUMNS = "id, title, category, description, status";
const MAX_ID = 2147483647; // largest value a Postgres integer id can hold

// Returns a positive whole number, or null if the id is not valid
function parseId(value) {
  if (!/^[1-9]\d*$/.test(value)) return null;
  const number = Number(value);
  return number <= MAX_ID ? number : null;
}

// Checks the four editable fields. Any client-supplied id is ignored.
function validateBody(body) {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Request body must be a JSON object with title, category, description and status." };
  }

  const rules = [
    ["title", "Title", 3, 80],
    ["category", "Category", 2, 40],
    ["description", "Description", 5, 300]
  ];

  const clean = {};
  for (const [field, label, min, max] of rules) {
    const value = body[field];
    if (typeof value !== "string") {
      return { error: `${label} is required and must be text.` };
    }
    const trimmed = value.trim();
    if (trimmed.length < min || trimmed.length > max) {
      return { error: `${label} must have ${min} to ${max} characters.` };
    }
    clean[field] = trimmed;
  }

  if (typeof body.status !== "string" || !STATUSES.includes(body.status.trim())) {
    return { error: "Status must be Pending, In progress or Completed." };
  }
  clean.status = body.status.trim();

  return { value: clean };
}

const BAD_ID = { message: "Id must be a positive whole number." };

// GET all records
router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(`SELECT ${COLUMNS} FROM records ORDER BY id`);
    res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
});

// GET one record
router.get("/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json(BAD_ID);

    const result = await pool.query(
      `SELECT ${COLUMNS} FROM records WHERE id = $1`, [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Record not found." });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// POST create a record
router.post("/", async (req, res, next) => {
  try {
    const { error, value } = validateBody(req.body);
    if (error) return res.status(400).json({ message: error });

    const result = await pool.query(
      `INSERT INTO records (title, category, description, status)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [value.title, value.category, value.description, value.status]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// PUT update a record (replaces all four fields, never creates)
router.put("/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json(BAD_ID);

    const { error, value } = validateBody(req.body);
    if (error) return res.status(400).json({ message: error });

    const result = await pool.query(
      `UPDATE records
       SET title = $1, category = $2, description = $3, status = $4
       WHERE id = $5 RETURNING *`,
      [value.title, value.category, value.description, value.status, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Record not found." });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// DELETE a record
router.delete("/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json(BAD_ID);

    const result = await pool.query(
      "DELETE FROM records WHERE id = $1 RETURNING id", [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Record not found." });
    }
    res.status(200).json({ message: "Record deleted." });
  } catch (error) {
    next(error);
  }
});

module.exports = router;