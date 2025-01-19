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

// Función para eliminar tarea - equivalente a tu lambda deleteTask
exports.deleteTask = async (req, res) => {
  cors()(req, res, async () => {
    try {
      // Solo acepta método DELETE
      if (req.method !== 'DELETE') {
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

      // Validaciones
      if (!id) {
        return res.status(400).json({ error: 'Task ID is required' });
      }

      if (isNaN(taskId)) {
        return res.status(400).json({ error: 'Invalid task ID' });
      }

      // Primero verificar si la tarea existe
      const checkResult = await pool.query(
        'SELECT * FROM tasks WHERE id = $1',
        [taskId]
      );

      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }

      // Eliminar la tarea
      const deleteResult = await pool.query(
        'DELETE FROM tasks WHERE id = $1 RETURNING *',
        [taskId]
      );

      // Respuesta exitosa
      res.status(200).json({
        success: true,
        message: 'Task deleted successfully',
        data: deleteResult.rows[0] // Devolver la tarea eliminada
      });

    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  });
};