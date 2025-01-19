const functions = require('@google-cloud/functions-framework');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
require('dotenv').config();

// Inicializar Firebase Admin - solo una vez
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID
  });
}

functions.http('register', async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const { email, password, displayName } = req.body;

      // Validaciones básicas
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Crear usuario en Firebase Auth
      const userRecord = await admin.auth().createUser({
        email: email,
        password: password,
        displayName: displayName || 'Usuario'
      });

      // Respuesta exitosa
      res.status(201).json({
        message: 'User created successfully',
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      
      // Manejo de errores específicos de Firebase
      if (error.code === 'auth/email-already-exists') {
        return res.status(400).json({ error: 'Email already exists' });
      }
      
      res.status(400).json({ error: error.message });
    }
  });
});