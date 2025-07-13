import Hapi from '@hapi/hapi';
import Jwt from 'hapi-auth-jwt2';
import { authRoutes } from './routes/routes.js';
import inert from '@hapi/inert';
import path from 'path';


const JWT_SECRET = "secretkey123";

const validateUser = async (decoded, request, h) => {
  if (!decoded || !decoded.id || !decoded.role) {
    return { isValid: false };
  }
  return { isValid: true, credentials: decoded };
};

const init = async () => {
  const server = Hapi.server({
    port: 5000,
    host: 'localhost',
    routes: {
      cors: {
        origin: ['*'],
        headers: ['Authorization', 'Content-Type', 'Accept', 'Origin', 'X-Requested-With'],
        additionalHeaders: ['cache-control', 'x-requested-with'],
        credentials: true
      }
    }
  });

  await server.register([Jwt, inert]);

  server.route({
    method: 'GET',
    path: '/uploads/{filename}',
    handler: (request, h) => {
      const filePath = path.join(process.cwd(), 'uploads', request.params.filename);
      return h.file(filePath);
    },
    options: {
      auth: false
    }
  });


  server.auth.strategy('jwt', 'jwt', {
    key: JWT_SECRET,
    validate: validateUser,
    verifyOptions: { algorithms: ['HS256'] },
  });

  server.auth.default('jwt'); 
  server.route(authRoutes);

  server.route({
    method: 'OPTIONS',
    path: '/{any*}',
    handler: (request, h) => {
      const response = h.response().code(200);
      response.header('Access-Control-Allow-Origin', '*');
      response.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.header('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept, Origin, X-Requested-With');
      response.header('Access-Control-Allow-Credentials', 'true');
      return response;
    },
    options: {
      auth: false,
      cors: false
    }
  });

  await server.start();
  console.log(`🚀 Server running at: ${server.info.uri}`);
};

init();