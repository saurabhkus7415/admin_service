const multer = require("fastify-multer");
const Papa = require("papaparse");
const XLSX = require("xlsx");
const { validateStudent, validateTeacher } = require("../utils/validate");
const makeAudit = require("../helpers/audit");
const { uploadsCounter } = require("../metrics/business");

module.exports = async function (fastify, opts) {
  const { MisStudent, MisTeacher, AuditTrail } = fastify.models;
  const logAudit = makeAudit({ AuditTrail });

  // Register multipart plugin
  fastify.register(require("fastify-multipart"));

  const storage = multer.memoryStorage();
  const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

  function parseBuffer(buffer, filename) {
    const name = (filename || "").toLowerCase();

    if (name.endsWith(".csv") || name.endsWith(".txt")) {
      const str = buffer.toString("utf8");
      const parsed = Papa.parse(str, { header: true, skipEmptyLines: true });
      return parsed.data;
    } else if (name.endsWith(".xlsx")) {
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      let rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      // Remove completely blank rows
      rows = rows.filter((row) =>
        Object.values(row).some((val) => String(val).trim() !== "")
      );
      return rows;
    } else {
      throw new Error("Unsupported file type. Only CSV and XLSX are allowed.");
    }
  }

  // Helper: check required columns
  function checkRequiredColumns(rows, requiredColumns) {
    const headers = Object.keys(rows[0] || {});
    const missing = requiredColumns.filter((col) => !headers.includes(col));
    if (missing.length) throw { type: "missing_columns", columns: missing };
  }

  // Helper: check duplicates in file
  function checkDuplicates(rows, key) {
    const ids = new Set();
    const duplicateRows = [];
    rows.forEach((r, i) => {
      if (ids.has(r[key])) duplicateRows.push(i + 1);
      ids.add(r[key]);
    });
    if (duplicateRows.length)
      throw { type: "duplicate", key, rows: duplicateRows };
  }

  // Upload Students
  fastify.post(
    "/upload/students",
    {
      preHandler: [fastify.authenticate, upload.single("file")],
    },
    async (request, reply) => {
      try {
        const file = request.file;
        if (!file) return reply.code(400).send({ error: "file is required" });

        const rows = parseBuffer(file.buffer, file.originalname);

        console.log(request.user);

        // Check required columns
        checkRequiredColumns(rows, [
          "student_id",
          "name",
          "class",
          "academic_year",
          "school_code",
        ]);

        // Check duplicates
        checkDuplicates(rows, "student_id");

        const valid = [],
          invalid = [];
        rows.forEach((r, i) => {
          const { ok, errors } = validateStudent(r);
          if (!ok) invalid.push({ row: i + 1, errors, data: r });
          else
            valid.push({
              name: String(r.name).trim(),
              class: String(r.class).trim(),
              academic_year: String(r.academic_year).trim(),
              student_id: String(r.student_id).trim(),
              school_code: String(r.school_code).trim(),
            });
        });

        if (invalid.length)
          return reply.code(400).send({ error: "validation_failed", invalid });

        const t = await fastify.models.sequelize.transaction();
        try {
          const inserted = await MisStudent.bulkCreate(valid, {
            transaction: t,
          });
          const insertedIds = inserted.map((s) => s.id);

          await logAudit({
            action: "upload",
            entity_type: "student",
            entity_id: JSON.stringify(inserted),
            user_id: request.user?.role || null,
            remarks: `Inserted ${inserted.length} students`,
            transaction: t,
          });

          await t.commit();

          // ✅ PROMETHEUS METRIC
          uploadsCounter.inc({ type: "students" });

          return reply
            .code(201)
            .send({ message: "uploaded", count: inserted.length });
        } catch (err) {
          await t.rollback();
          return reply.code(400).send({
            error: "db_validation_error",
            message: err.message,
            details: err.errors || err.parent || err,
          });
        }
      } catch (err) {
        if (err.type === "missing_columns") {
          return reply
            .code(400)
            .send({ error: "missing_columns", columns: err.columns });
        }
        if (err.type === "duplicate") {
          return reply
            .code(400)
            .send({ error: "duplicate_student_id", rows: err.rows });
        }
        return reply.code(400).send({ error: err.message });
      }
    }
  );

  // Upload Teachers
  fastify.post(
    "/upload/teachers",
    {
      preHandler: [fastify.authenticate, upload.single("file")],
    },
    async (request, reply) => {
      try {
        const file = request.file;
        if (!file) return reply.code(400).send({ error: "file is required" });

        const rows = parseBuffer(file.buffer, file.originalname);

        // Check required columns
        checkRequiredColumns(rows, [
          "teacher_id",
          "name",
          "academic_year",
          "school_code",
          "designation",
        ]);

        // Check duplicates
        checkDuplicates(rows, "teacher_id");

        const valid = [],
          invalid = [];
        rows.forEach((r, i) => {
          const { ok, errors } = validateTeacher(r);
          if (!ok) invalid.push({ row: i + 1, errors, data: r });
          else
            valid.push({
              name: String(r.name).trim(),
              teacher_id: String(r.teacher_id).trim(),
              academic_year: String(r.academic_year).trim(),
              school_code: String(r.school_code).trim(),
              designation: String(r.designation).trim(),
            });
        });

        if (invalid.length)
          return reply.code(400).send({ error: "validation_failed", invalid });

        const t = await fastify.models.sequelize.transaction();
        try {
          const inserted = await MisTeacher.bulkCreate(valid, {
            transaction: t,
          });
          const insertedIds = inserted.map((s) => s.id);

          await logAudit({
            action: "upload",
            entity_type: "teacher",
            entity_id: JSON.stringify(inserted),
            user_id: request.user?.role || null,
            remarks: `Inserted ${inserted.length} teachers`,
            transaction: t,
          });

          await t.commit();

          uploadsCounter.inc({ type: "teachers" });
          return reply
            .code(201)
            .send({ message: "uploaded", count: inserted.length });
        } catch (err) {
          await t.rollback();
          return reply.code(400).send({
            error: "db_validation_error",
            message: err.message,
            details: err.errors || err.parent || err,
          });
        }
      } catch (err) {
        if (err.type === "missing_columns") {
          return reply
            .code(400)
            .send({ error: "missing_columns", columns: err.columns });
        }
        if (err.type === "duplicate") {
          return reply
            .code(400)
            .send({ error: "duplicate_teacher_id", rows: err.rows });
        }
        return reply.code(400).send({ error: err.message });
      }
    }
  );
};
