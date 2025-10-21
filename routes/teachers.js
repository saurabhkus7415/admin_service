module.exports = async function (fastify, opts) {
  const { MisTeacher } = fastify.models;

  fastify.get(
    "/teachers",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const teachers = await MisTeacher.findAll();
        return reply.send({ count: teachers.length, data: teachers });
      } catch (error) {
        return reply.status(500).send({ error: error.message });
      }
    }
  );
};
