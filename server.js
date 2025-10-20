require('dotenv').config();
const Fastify = require('fastify');
const cors = require('@fastify/cors');
const jwt = require('fastify-jwt');
const path = require('path');

const build = async () => {
  const fastify = Fastify({ logger: true });
  await fastify.register(cors, { origin: true });
  await fastify.register(jwt, { secret: process.env.JWT_SECRET || 'secret' });

  // Load DB and models
  fastify.decorate('models', require('./models')(fastify));
  // Auth decorator
  fastify.decorate('authenticate', async function (request, reply) {
    try {
      await request.jwtVerify();
      if (!request.user || request.user.role !== 'admin') {
        return reply.code(403).send({ error: 'Admin access required' });
      }
    } catch (err) {
      reply.send(err);
    }
  });

  // Register routes
  fastify.register(require('./routes/auth'), { prefix: '/api' });
  fastify.register(require('./routes/upload'), { prefix: '/api' });
  fastify.register(require('./routes/approvals'), { prefix: '/api' });
  fastify.register(require('./routes/audit'), { prefix: '/api' });
  fastify.register(require('./routes/teachers'), { prefix: '/api' });
  fastify.register(require('./routes/students'), { prefix: '/api' });


  const port = process.env.PORT || 3000;
  await fastify.listen({ port: Number(port), host: '0.0.0.0' });
};

build().catch(err => {
  console.error(err);
  process.exit(1);
});
