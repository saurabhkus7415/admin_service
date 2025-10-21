module.exports = async function (fastify, opts) {
  const { MisStudent } = fastify.models;

  fastify.get(
    "/students",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const students = await MisStudent.findAll();
        return reply.send({ count: students.length, data: students });
      } catch (error) {
        return reply.status(500).send({ error: error.message });
      }
    }
  );
};
