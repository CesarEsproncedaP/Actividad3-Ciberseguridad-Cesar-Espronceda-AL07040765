const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const helmet = require('helmet');
app.use(helmet());

// El secreto NO va en el código: se lee de una variable de entorno
const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  console.error('Falta la variable de entorno JWT_SECRET');
  process.exit(1);
}

// Usuarios simulados (en un sistema real las contraseñas se guardarían hasheadas)
const users = [
  { id: 1, username: 'admin', password: 'admin123', role: 'admin' },
  { id: 2, username: 'cesar', password: 'user123', role: 'user' },
];

// Middleware 1: valida el token JWT
function verifyToken(req, res, next) {
  const header = req.headers['authorization'] || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Token requerido' });
  }
  try {
    req.user = jwt.verify(token, SECRET, { algorithms: ['HS256'] });
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

// Middleware 2: valida que el usuario tenga el rol necesario
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: 'Permisos insuficientes' });
    }
    next();
  };
}

// Endpoint público
app.get('/api/public', (req, res) => {
  res.json({ message: 'Endpoint público, no requiere token' });
});

// Login: devuelve un token que expira en 15 minutos
app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  const user = users.find((u) => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }
  const token = jwt.sign(
    { sub: user.id, username: user.username, role: user.role },
    SECRET,
    { algorithm: 'HS256', expiresIn: '15m' }
  );
  res.json({ token });
});

// Endpoints sensibles (requieren token)
app.get('/api/perfil', verifyToken, (req, res) => {
  res.json({ user: req.user });
});

app.get('/api/admin', verifyToken, requireRole('admin'), (req, res) => {
  res.json({ message: 'Bienvenido al panel de administración', user: req.user.username });
});

app.get('/api/admin/usuarios', verifyToken, requireRole('admin'), (req, res) => {
  res.json({ users: users.map((u) => ({ id: u.id, username: u.username, role: u.role })) });
});

// Definición OpenAPI (para que ZAP conozca los endpoints)
const secured = {
  security: [{ bearerAuth: [] }],
  responses: {
    200: { description: 'OK' },
    401: { description: 'No autenticado' },
    403: { description: 'Sin permisos' },
  },
};
const openapi = {
  openapi: '3.0.0',
  info: { title: 'API simulada Actividad 3', version: '1.0.0' },
  servers: [{ url: 'http://127.0.0.1:4000' }],
  components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } } },
  paths: {
    '/api/public': { get: { responses: { 200: { description: 'OK' } } } },
    '/api/login': {
      post: {
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { username: { type: 'string' }, password: { type: 'string' } } } } },
        },
        responses: { 200: { description: 'Token' }, 401: { description: 'Credenciales inválidas' } },
      },
    },
    '/api/perfil': { get: secured },
    '/api/admin': { get: secured },
    '/api/admin/usuarios': { get: secured },
  },
};
app.get('/openapi.json', (req, res) => res.json(openapi));

app.listen(4000, '127.0.0.1', () => {
  console.log('API escuchando en http://127.0.0.1:4000');
});