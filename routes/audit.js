module.exports = async function (fastify, opts) {
  const { AuditTrail } = fastify.models;

  fastify.get('/audit-trail', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const items = await AuditTrail.findAll({ order: [['timestamp', 'DESC']], limit: 200 });
    return reply.send({ count: items.length, data: items });
  });
};
