const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

// Configuración de la base de datos
// IMPORTANTE: Reemplaza con los datos de tu instancia Cloud SQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  // Configuración SSL para Cloud SQL
  ssl: {
    rejectUnauthorized: false
  }
});

// Función principal - equivalente a tu lambda getTasks
exports.getTasks = async (req, res) => {
  // CORS para permitir peticiones desde frontend
  cors()(req, res, async () => {
    try {
      // Solo acepta método GET
      if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      // Query SQL - igual que en cualquier app Node.js
      const result = await pool.query(
        'SELECT * FROM tasks ORDER BY created_at DESC'
      );

      // Respuesta exitosa con las tareas
      res.status(200).json({
        success: true,
        data: result.rows,
        count: result.rows.length
      });

    } catch (error) {
      console.error('Error getting tasks:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  });
};