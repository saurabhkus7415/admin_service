const bcrypt = require("bcrypt");

module.exports = async ({ sequelize, User, ApprovalRequest }, fastify) => {
  try {
    const adminUser = process.env.ADMIN_USER || "admin";
    const adminPass = process.env.ADMIN_PASS || "admin123";

    const hash = await bcrypt.hash(adminPass, 10);

    const [admin] = await User.upsert(
      { username: adminUser, password_hash: hash, role: "admin" },
      { returning: true }
    );

    const adminId = admin.id || 1;

    function randomClass() {
      const grade = Math.floor(Math.random() * 12) + 1;
      const section = String.fromCharCode(65 + Math.floor(Math.random() * 5));
      return `Class ${grade}${section}`;
    }
    function randomSchoolCode() {
      return `SCH${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")}`;
    }
    function randomDesignation() {
      const options = [
        "Teacher",
        "Senior Teacher",
        "Head Teacher",
        "Assistant Teacher",
      ];
      return options[Math.floor(Math.random() * options.length)];
    }

    const studentRequests = Array.from({ length: 10 }).map((_, i) => ({
      name: `Student ${i + 1}`,
      entity_type: "student",
      data_fields: {
        student_id: `S${100 + i}`,
        name: `Student ${i + 1}`,
        class: randomClass(),
        academic_year: "2025-2026",
        school_code: randomSchoolCode(),
      },
      status: "Pending",
      remarks: `Dummy student request ${i + 1}`,
      requested_by: adminId,
    }));

    const teacherRequests = Array.from({ length: 10 }).map((_, i) => ({
      name: `Teacher ${i + 1}`,
      entity_type: "teacher",
      data_fields: {
        teacher_id: `T${100 + i}`,
        name: `Teacher ${i + 1}`,
        academic_year: "2025-2026",
        school_code: randomSchoolCode(),
        designation: randomDesignation(),
      },
      status: "Pending",
      remarks: `Dummy teacher request ${i + 1}`,
      requested_by: adminId,
    }));

    // Bulk create
    await ApprovalRequest.bulkCreate([...studentRequests, ...teacherRequests]);

    // Use Fastify's logger for the final success message
    fastify.log.info(
      "Seed data inserted successfully (Admin user and 20 requests created)"
    );
  } catch (err) {
    fastify.log.error(" Seed script failed during execution:", err);
    throw err;
  }
};
