const functions = require('@google-cloud/functions-framework');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
require('dotenv').config();

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID
  });
}

functions.http('login', async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const { idToken } = req.body;

      // Validar que viene el token
      if (!idToken) {
        return res.status(400).json({ error: 'ID token is required' });
      }

      // Verificar el token con Firebase Admin
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      
      // Obtener información completa del usuario
      const userRecord = await admin.auth().getUser(decodedToken.uid);

      // Respuesta exitosa
      res.status(200).json({
        message: 'Login successful',
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          emailVerified: userRecord.emailVerified
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      
      if (error.code === 'auth/id-token-expired') {
        return res.status(401).json({ error: 'Token expired' });
      }
      
      if (error.code === 'auth/invalid-id-token') {
        return res.status(401).json({ error: 'Invalid token' });
      }
      
      res.status(401).json({ error: 'Authentication failed' });
    }
  });
});