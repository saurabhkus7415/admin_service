const bcrypt = require("bcrypt");
const { loginCounter } = require("../metrics/auth");

module.exports = async function (fastify, opts) {
  const { User } = fastify.models;

  fastify.post("/auth/login", async (request, reply) => {
    const { username, password } = request.body || {};
    if (!username || !password) {
      loginCounter.inc({ status: "failure" });
      return reply.code(400).send({ error: "username and password required" });
    }

    try {
      const user = await User.findOne({ where: { username } });
      if (!user) {
        // ❌ user not found
        loginCounter.inc({ status: "failure" });
        return reply.code(401).send({ error: "invalid credentials" });
      }

      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) {
        // ❌ user not found
        loginCounter.inc({ status: "failure" });
        return reply.code(401).send({ error: "invalid credentials" });
      }

      const token = fastify.jwt.sign(
        { username: user.username, role: user.role, user_id: user.id },
        { expiresIn: "8h" }
      );
      loginCounter.inc({ status: "success" });
      return reply.send({ token });
    } catch (err) {
      // ❌ user not found
      loginCounter.inc({ status: "failure" });
      fastify.log.error(err);
      return reply.code(500).send({ error: "server_error" });
    }
  });
};
