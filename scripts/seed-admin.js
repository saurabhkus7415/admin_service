// require('dotenv').config();
// const { Sequelize, DataTypes } = require('sequelize');
// const bcrypt = require('bcrypt');

// const sequelize = new Sequelize(
//   process.env.DB_NAME || 'school_admin_panel',
//   process.env.DB_USER || 's_1',
//   process.env.DB_PASSWORD || '1234567',
//   {
//     host: process.env.DB_HOST || 'localhost',
//     port: Number.parseInt(process.env.DB_PORT || '3306'),
//     dialect: 'mysql',
//     logging: false,
//   }
// );

// // Define User model (basic)
// const User = sequelize.define(
//   'User',
//   {
//     username: { type: DataTypes.STRING, unique: true, allowNull: false },
//     password_hash: { type: DataTypes.STRING, allowNull: false },
//     role: { type: DataTypes.STRING, defaultValue: 'admin' },
//   },
//   { tableName: 'users', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' }
// );

// // Define ApprovalRequest model
// const ApprovalRequest = sequelize.define(
//   'ApprovalRequest',
//   {
//     name: { type: DataTypes.STRING, allowNull: false },
//     entity_type: { type: DataTypes.ENUM('student', 'teacher'), allowNull: false },
//     data_fields: { type: DataTypes.JSON, allowNull: false },
//     status: { type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'), defaultValue: 'Pending' },
//     remarks: { type: DataTypes.TEXT, allowNull: true },
//     requested_by: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
//   },
//   { underscored: true, timestamps: true }
// );

// // Random utilities
// function randomClass() {
//   const grade = Math.floor(Math.random() * 12) + 1;
//   const section = String.fromCharCode(65 + Math.floor(Math.random() * 5)); // A-E
//   return `Class ${grade}${section}`;
// }
// function randomSchoolCode() {
//   return `SCH${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
// }
// function randomDesignation() {
//   const options = ['Teacher', 'Senior Teacher', 'Head Teacher', 'Assistant Teacher'];
//   return options[Math.floor(Math.random() * options.length)];
// }

// async function run() {
//   try {
//     await sequelize.authenticate();
//     console.log('✅ Database connected');

//     // Sync models
//     await User.sync();
//     await ApprovalRequest.sync();

//     // Create or update admin
//     const adminUser = process.env.ADMIN_USER || 'admin';
//     const adminPass = process.env.ADMIN_PASS || 'admin123';
//     const hash = await bcrypt.hash(adminPass, 10);

//     const [admin] = await User.upsert(
//       { username: adminUser, password_hash: hash, role: 'admin' },
//       { returning: true }
//     );

//     const adminId = admin.id || 1;

//     // Generate 10 dummy student ApprovalRequests
//     const studentRequests = Array.from({ length: 10 }).map((_, i) => ({
//       name: `Student ${i + 1}`,
//       entity_type: 'student',
//       data_fields: {
//         student_id: `S${100 + i}`,
//         name: `Student ${i + 1}`,
//         class: randomClass(),
//         academic_year: '2025-2026',
//         school_code: randomSchoolCode(),
//       },
//       status: 'Pending',
//       remarks: `Dummy student request ${i + 1}`,
//       requested_by: adminId,
//     }));

//     // Generate 10 dummy teacher ApprovalRequests
//     const teacherRequests = Array.from({ length: 10 }).map((_, i) => ({
//       name: `Teacher ${i + 1}`,
//       entity_type: 'teacher',
//       data_fields: {
//         teacher_id: `T${100 + i}`,
//         name: `Teacher ${i + 1}`,
//         academic_year: '2025-2026',
//         school_code: randomSchoolCode(),
//         designation: randomDesignation(),
//       },
//       status: 'Pending',
//       remarks: `Dummy teacher request ${i + 1}`,
//       requested_by: adminId,
//     }));

//     // Bulk create
//     await ApprovalRequest.bulkCreate([...studentRequests, ...teacherRequests]);
//     console.log('🌱 20 ApprovalRequest dummy records created (10 students + 10 teachers)');
//   } catch (err) {
//     console.error('❌ Seed failed:', err);
//   } finally {
//     await sequelize.close();
//   }
// }

// run();
const bcrypt = require("bcrypt");

// The script is refactored to be an exported function that accepts the
// already connected Sequelize instance and models from models/index.js.
// This prevents it from creating a new, local-only connection.
module.exports = async ({ sequelize, User, ApprovalRequest }, fastify) => {
  try {
    // --- REMOVED: All local Sequelize connection setup (const sequelize = new Sequelize(...))
    // --- REMOVED: require('dotenv').config()
    // --- REMOVED: Local model definitions (User, ApprovalRequest)
    // --- REMOVED: sequelize.authenticate() and model.sync() calls (handled by models/index.js)

    // Get environment variables from the deployment
    const adminUser = process.env.ADMIN_USER || "admin";
    const adminPass = process.env.ADMIN_PASS || "admin123";

    const hash = await bcrypt.hash(adminPass, 10);

    // Create or update admin using the User model passed from models/index.js
    const [admin] = await User.upsert(
      { username: adminUser, password_hash: hash, role: "admin" },
      { returning: true }
    );

    const adminId = admin.id || 1;

    // --- Utility Functions (Kept as they don't affect connection) ---
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

    // --- Seeding Logic (Uses the passed-in ApprovalRequest model) ---

    // Generate 10 dummy student ApprovalRequests
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

    // Generate 10 dummy teacher ApprovalRequests
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
      "🌱 Seed data inserted successfully (Admin user and 20 requests created)"
    );
  } catch (err) {
    // If an error occurs (e.g., hash failure, bulk create failure)
    fastify.log.error("❌ Seed script failed during execution:", err);
    // Re-throw the error so models/index.js can handle the failure.
    throw err;
  }
};
// run();
// --- REMOVED: The final run() call ---
