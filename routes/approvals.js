const makeAudit = require("../helpers/audit");
const { validateStudent, validateTeacher } = require("../utils/validate");

module.exports = async function (fastify, opts) {
  const { ApprovalRequest, MisStudent, MisTeacher, AuditTrail } =
    fastify.models;
  const logAudit = makeAudit({ AuditTrail });
  fastify.get(
    "/approvals",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const { status } = request.query;
      const whereCondition = status
        ? { status }
        : { status: ["Pending", "Rejected"] };
      const approvals = await ApprovalRequest.findAll({
        where: whereCondition,
      });
      return reply.send({ count: approvals.length, data: approvals });
    }
  );

  fastify.post(
    "/approvals/:id/approve",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const id = request.params.id;
      const reqRec = await ApprovalRequest.findByPk(id);
      if (!reqRec) return reply.code(404).send({ error: "not_found" });
      if (reqRec.status !== "Pending")
        return reply.code(400).send({ error: "not_pending" });

      const data = reqRec.data_fields;
      const t = await fastify.models.sequelize.transaction();
      try {
        let created;
        if (reqRec.entity_type === "student") {
          const { ok, errors } = validateStudent(data);
          if (!ok) {
            await t.rollback();
            return reply.code(400).send({ error: "validation_failed", errors });
          }
          created = await MisStudent.create(
            {
              name: data.name,
              class: data.class,
              academic_year: data.academic_year,
              student_id: data.student_id,
              school_code: data.school_code,
            },
            { transaction: t }
          );
        } else {
          const { ok, errors } = validateTeacher(data);
          if (!ok) {
            await t.rollback();
            return reply.code(400).send({ error: "validation_failed", errors });
          }
          created = await MisTeacher.create(
            {
              name: data.name,
              teacher_id: data.teacher_id,
              academic_year: data.academic_year,
              school_code: data.school_code,
              designation: data.designation,
            },
            { transaction: t }
          );
        }

        reqRec.status = "Approved";
        await reqRec.save({ transaction: t });

        await logAudit({
          action: "approve",
          entity_type: reqRec.entity_type,
          entity_id: JSON.stringify([created]),
          user_id: request.user?.role || null,
          remarks: `Approved request ${id}`,
          transaction: t,
        });

        await t.commit();
        return reply.send({ message: "approved" });
      } catch (err) {
        await t.rollback();
        return reply
          .code(500)
          .send({ error: "db_error", details: err.message });
      }
    }
  );

  fastify.post(
    "/approvals/:id/reject",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const id = request.params.id;
      const { remarks } = request.body || {};
      const reqRec = await ApprovalRequest.findByPk(id);
      if (!reqRec) return reply.code(404).send({ error: "not_found" });
      if (reqRec.status !== "Pending")
        return reply.code(400).send({ error: "not_pending" });

      reqRec.status = "Rejected";
      reqRec.remarks = remarks || null;
      await reqRec.save();

      await logAudit({
        action: "reject",
        entity_type: reqRec.entity_type,
        entity_id: JSON.stringify([reqRec]),
        user_id: request.user?.role || null,
        remarks: remarks || "Rejected via API",
      });

      return reply.send({ message: "rejected" });
    }
  );
};
