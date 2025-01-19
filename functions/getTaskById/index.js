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

// Función para obtener una tarea específica
exports.getTaskById = async (req, res) => {
  cors()(req, res, async () => {
    try {
      if (req.method !== 'GET') {
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

      // Validación del ID
      if (!id) {
        return res.status(400).json({ 
          error: 'Task ID is required' 
        });
      }

      // Validar que sea un número
      if (isNaN(taskId)) {
        return res.status(400).json({ 
          error: 'Invalid task ID' 
        });
      }

      // Query SQL para obtener la tarea
      const result = await pool.query(
        'SELECT * FROM tasks WHERE id = $1',
        [taskId]
      );

      // Verificar si la tarea existe
      if (result.rows.length === 0) {
        return res.status(404).json({ 
          error: 'Task not found' 
        });
      }

      // Respuesta exitosa
      res.status(200).json({
        success: true,
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Error getting task:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  });
};