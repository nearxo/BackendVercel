import express from 'express';
import cors from 'cors';
import insertarRoute from './api/insertar';
import consultarRoute from './api/consultar';
import inventarioRoute from './api/inventario';
import productosRoute from './api/productos';
import usuariosRoute from './api/usuarios';

const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Configuración de CORS para permitir múltiples orígenes
const allowedOrigins = [
  'https://probandouno.vercel.app',
  'https://probandouno-49j1vt991-nears-projects-aad7fd55.vercel.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Verifica si el origen está en la lista permitida
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  methods: 'GET,POST,OPTIONS',
  allowedHeaders: 'Content-Type',
};

// Usar el middleware CORS con las opciones
app.use(cors(corsOptions));

// Rutas
app.use('/api', insertarRoute);
app.use('/api', consultarRoute);
app.use('/api', inventarioRoute);
app.use('/api', productosRoute);
app.use('/api', usuariosRoute);

// Exportar la aplicación como un handler para Vercel
export default app;
