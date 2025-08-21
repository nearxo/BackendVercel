import { Router } from 'express';
import { db } from '@vercel/postgres';

const router = Router();

// POST /usuarios - Autenticación básica
router.post('/usuarios', async (req, res) => {
  const { usuario, contrasena } = req.body;

  if (!usuario || !contrasena) {
    return res.status(400).json({ error: 'usuario y contrasena son requeridos' });
  }

  try {
    const client = await db.connect();

    const result = await client.sql`
      SELECT idrol
      FROM usuarios
      WHERE usuario = ${usuario} AND contrasena = ${contrasena}
      LIMIT 1;
    `;

    if (result.rows.length === 0) {
      return res.status(200).json({ found: false, idrol: null });
    }

    return res.status(200).json({ found: true, idrol: result.rows[0].idrol });
  } catch (error) {
    console.error('Error al autenticar usuario:', error);
    return res.status(500).json({ error: 'Error al autenticar usuario' });
  }
});

export default router;
