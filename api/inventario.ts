import { Router } from 'express';
import { db } from '@vercel/postgres';

const router = Router();

router.get('/inventario', async (req, res) => {
  try {
    const client = await db.connect();
    const result = await client.sql`SELECT * FROM inventario;`;

    return res.status(200).json({ inventario: result.rows });
  } catch (error) {
    console.error('Error al consultar la tabla inventario:', error);
    return res.status(500).json({ error: 'Error al consultar la tabla inventario' });
  }
});

export default router;
