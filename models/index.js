// const { Sequelize, DataTypes } = require('sequelize');
// const path = require('path');

// module.exports = (fastify) => {

//   // --- START MODIFICATION ---

//   const dbConfig = {
//     database: process.env.DB_NAME,
//     username: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     dialect: 'mysql',
//     logging: false,

//     // Cloud Run passes the connection name. If it exists, we use the Unix Socket.
//     host: process.env.CLOUD_SQL_CONNECTION_NAME
//       ? `/cloudsql/${process.env.CLOUD_SQL_CONNECTION_NAME}` // Unix Socket path for Cloud Run
//       : process.env.DB_HOST || '127.0.0.1',                   // IP/Hostname for local or external

//     // Cloud Run needs to know this option when using the Unix Socket
//     ...(process.env.CLOUD_SQL_CONNECTION_NAME && {
//         dialectOptions: {
//             socketPath: `/cloudsql/${process.env.CLOUD_SQL_CONNECTION_NAME}`
//         }
//     })
//   };

//   // Sequelize is initialized with the username, password, and config object
//   const sequelize = new Sequelize(
//     dbConfig.database,
//     dbConfig.username,
//     dbConfig.password,
//     dbConfig
//   );

//   // --- END MODIFICATION ---

//   const MisStudent = require('./mis_student')(sequelize, DataTypes);
//   const MisTeacher = require('./mis_teacher')(sequelize, DataTypes);
//   const ApprovalRequest = require('./approval_request')(sequelize, DataTypes);
//   const AuditTrail = require('./audit_trail')(sequelize, DataTypes);
//   const User = require('./user')(sequelize, DataTypes);

//   // Initialize DB schema
//   sequelize.sync({ alter: true }) // alter:true keeps schema in sync
//     .then(async () => {
//       fastify.log.info('✅ Database synchronized successfully');

//       // Run seed scripts
//       try {
//         const seedAdmin = require(path.join(__dirname, '../scripts/seed-admin'));
//         // FIX: Added 'ApprovalRequest' model to the passed object
//         await seedAdmin({ sequelize, User, ApprovalRequest }, fastify);
//         fastify.log.info('🌱 Seed data inserted successfully');
//       } catch (err) {
//         fastify.log.error('❌ Seed script failed:', err);
//       }
//     })
//     .catch((err) => {
//       fastify.log.error('❌ Database sync failed:', err);
//     });

//   return {
//     sequelize,
//     MisStudent,
//     MisTeacher,
//     ApprovalRequest,
//     AuditTrail,
//     User
//   };
// };

const { Sequelize, DataTypes } = require("sequelize");
const path = require("path");

module.exports = (fastify) => {
  const isCloud = !!process.env.CLOUD_SQL_CONNECTION_NAME;

  const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      dialect: "mysql",
      logging: false,

      // ✅ LOCAL
      host: isCloud ? undefined : process.env.DB_HOST || "127.0.0.1",
      port: isCloud ? undefined : process.env.DB_PORT || 3306,

      // ✅ CLOUD RUN
      ...(isCloud && {
        dialectOptions: {
          socketPath: `/cloudsql/${process.env.CLOUD_SQL_CONNECTION_NAME}`,
        },
      }),
    }
  );

  const MisStudent = require("./mis_student")(sequelize, DataTypes);
  const MisTeacher = require("./mis_teacher")(sequelize, DataTypes);
  const ApprovalRequest = require("./approval_request")(sequelize, DataTypes);
  const AuditTrail = require("./audit_trail")(sequelize, DataTypes);
  const User = require("./user")(sequelize, DataTypes);

  sequelize
    .sync({ alter: true })
    .then(async () => {
      fastify.log.info("✅ Database synchronized successfully");

      try {
        const seedAdmin = require(path.join(
          __dirname,
          "../scripts/seed-admin"
        ));
        await seedAdmin({ sequelize, User, ApprovalRequest }, fastify);
        fastify.log.info("🌱 Seed data inserted successfully");
      } catch (err) {
        fastify.log.error("❌ Seed script failed:", err);
      }
    })
    .catch((err) => {
      console.error("❌ Database sync failed FULL ERROR ↓↓↓");
      console.error(err);
      console.error("❌ ERROR MESSAGE:", err.message);
      console.error("❌ ERROR NAME:", err.name);
      console.error("❌ ERROR SQL:", err.sql);
    });

  return {
    sequelize,
    MisStudent,
    MisTeacher,
    ApprovalRequest,
    AuditTrail,
    User,
  };
};
