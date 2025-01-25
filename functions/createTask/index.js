const functions = require('@google-cloud/functions-framework');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();
const { authenticateUser } = require('./authMiddleware');

// Misma configuración de DB (en producción usarías variables de entorno)
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

// Función para crear tarea - equivalente a tu lambda addTask
functions.http('createTask', async (req, res) => {
  cors()(req, res, async () => {
    // Agregar autenticación
    authenticateUser(req, res, async () => {
      try {
        // Solo acepta método POST
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Method not allowed' });
        }

        // Obtener datos del body (igual que en Express)
        const { title, description } = req.body;

        // Validación básica
        if (!title || title.trim() === '') {
          return res.status(400).json({ 
            error: 'Title is required' 
          });
        }

        // INSERT SQL con RETURNING - PostgreSQL devuelve el registro creado
        const result = await pool.query(
          `INSERT INTO tasks (title, description, completed) 
          VALUES ($1, $2, $3) 
          RETURNING *`,
          [title.trim(), description || null, false]
        );

        // Respuesta con la tarea creada
        res.status(201).json({
          success: true,
          message: 'Task created successfully',
          data: result.rows[0]
        });

      } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ 
          error: 'Internal server error',
          message: error.message 
        });
      }
   });
  });
});