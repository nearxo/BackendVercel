import { Router } from 'express';
import { db } from '@vercel/postgres';

const router = Router();

router.post('/insertar', async (req, res) => {
  const { codigo, contrasena } = req.body;

  try {
    const client = await db.connect();

    const result = await client.sql`
      INSERT INTO Estudiantes (codigo, contrasena) 
      VALUES (${codigo}, ${contrasena})
      RETURNING *;
    `;

    return res.status(200).json({ estudiante: result.rows[0] });
  } catch (error) {
    console.error('Error al interactuar con la base de datos:', error);
    return res.status(500).json({ error: 'Error al interactuar con la base de datos' });
  }
});

export default router;
