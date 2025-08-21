import { Router } from 'express';
import { db } from '@vercel/postgres';

const router = Router();

// GET para obtener todos los productos
router.get('/productos', async (req, res) => {
  try {
    const client = await db.connect();
    const result = await client.sql`SELECT * FROM productos;`;

    return res.status(200).json({ productos: result.rows });
  } catch (error) {
    console.error('Error al consultar los productos:', error);
    return res.status(500).json({ error: 'Error al consultar los productos' });
  }
});

// POST para procesar pedidos y descontar inventario
router.post('/procesar-pedido', async (req, res) => {
  const { productos } = req.body; // Array de productos con cantidades

  if (!productos || !Array.isArray(productos)) {
    return res.status(400).json({ error: 'Se requiere un array de productos' });
  }

  try {
    const client = await db.connect();

    // Iniciar transacción
    await client.sql`BEGIN`;

    try {
      for (const pedido of productos) {
        const { producto_id, cantidad } = pedido;

        // Obtener la receta del producto
        const productoResult = await client.sql`
          SELECT inventario_ids, porciones 
          FROM productos 
          WHERE id = ${producto_id}
        `;

        if (productoResult.rows.length === 0) {
          throw new Error(`Producto con ID ${producto_id} no encontrado`);
        }

        const producto = productoResult.rows[0];
        const inventarioIds = producto.inventario_ids;
        const porciones = producto.porciones;

        // Verificar que hay suficiente inventario
        for (let i = 0; i < inventarioIds.length; i++) {
          const inventarioId = inventarioIds[i];
          const porcionNecesaria = porciones[i] * cantidad;

          // Verificar stock disponible
          const stockResult = await client.sql`
            SELECT cantidad FROM inventario WHERE id = ${inventarioId}
          `;

          if (stockResult.rows.length === 0) {
            throw new Error(`Item de inventario con ID ${inventarioId} no encontrado`);
          }

          const stockDisponible = stockResult.rows[0].cantidad;

          if (stockDisponible < porcionNecesaria) {
            throw new Error(`Stock insuficiente para el item ${inventarioId}. Disponible: ${stockDisponible}, Necesario: ${porcionNecesaria}`);
          }
        }

        // Descontar del inventario
        for (let i = 0; i < inventarioIds.length; i++) {
          const inventarioId = inventarioIds[i];
          const porcionNecesaria = porciones[i] * cantidad;

          await client.sql`
            UPDATE inventario 
            SET cantidad = cantidad - ${porcionNecesaria}
            WHERE id = ${inventarioId}
          `;
        }
      }

      // Confirmar transacción
      await client.sql`COMMIT`;

      return res.status(200).json({ 
        message: 'Pedido procesado exitosamente',
        productos_procesados: productos.length
      });

    } catch (error) {
      // Revertir transacción en caso de error
      await client.sql`ROLLBACK`;
      throw error;
    }

  } catch (error) {
    console.error('Error al procesar el pedido:', error);
    return res.status(500).json({ 
      error: 'Error al procesar el pedido',
      details: error.message 
    });
  }
});

export default router;
