const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false
  }
});

// Función para actualizar tarea - equivalente a tu lambda updateTask
exports.updateTask = async (req, res) => {
  cors()(req, res, async () => {
    try {
      // Solo acepta PUT o PATCH
      if (req.method !== 'PUT' && req.method !== 'PATCH') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      // Obtener ID de la query string
      let taskId;
      if (req.path) {
        const pathParts = req.path.split('/');
        taskId = pathParts[pathParts.length - 1];
      } else {
        taskId = req.query.id;
      }
      const id = parseInt(taskId);
      const { title, description, completed } = req.body;

      // Validaciones
      if (!id) {
        return res.status(400).json({ error: 'Task ID is required' });
      }

      if (isNaN(taskId)) {
        return res.status(400).json({ error: 'Invalid task ID' });
      }

      // Verificar que al menos un campo se esté actualizando
      if (title === undefined && description === undefined && completed === undefined) {
        return res.status(400).json({ 
          error: 'At least one field must be provided for update' 
        });
      }

      // Construir query dinámicamente (solo actualizar campos proporcionados)
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (title !== undefined) {
        updates.push(`title = $${paramCount++}`);
        values.push(title.trim());
      }

      if (description !== undefined) {
        updates.push(`description = $${paramCount++}`);
        values.push(description);
      }

      if (completed !== undefined) {
        updates.push(`completed = $${paramCount++}`);
        values.push(completed);
      }

      // Agregar updated_at automáticamente
      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(taskId); // ID para WHERE

      // Query SQL dinámica
      const query = `
        UPDATE tasks 
        SET ${updates.join(', ')} 
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await pool.query(query, values);

      // Verificar si la tarea existe
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }

      // Respuesta exitosa
      res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  });
};