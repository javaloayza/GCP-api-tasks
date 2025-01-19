const functions = require('@google-cloud/functions-framework');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
require('dotenv').config();

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

functions.http('generateTestToken', async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {

      // DIAGNÓSTICO: Ver qué service account está usando
      const { GoogleAuth } = require('google-auth-library');
      const auth = new GoogleAuth();
      const credentials = await auth.getCredentials();

      console.log('Service account being used:', credentials.client_email);

      const { email } = req.body;

      // Validar email
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      // Buscar usuario por email
      const userRecord = await admin.auth().getUserByEmail(email);

      // Generar custom token (equivale a "hacer login" programáticamente)
      const customToken = await admin.auth().createCustomToken(userRecord.uid);

      // También generar un ID token simulado para testing
      // En una app real, esto lo haría el cliente después de usar el customToken
      const additionalClaims = {
        email: userRecord.email,
        email_verified: userRecord.emailVerified
      };

      res.status(200).json({
        message: 'Test tokens generated successfully',
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName
        },
        customToken: customToken,
        // Este es el token que usarías para probar la función login
        testInstructions: {
          howToUse: "Use the customToken to generate an idToken, or use our mock endpoint",
          nextStep: "Call /login with this customToken as idToken for testing"
        }
      });

    } catch (error) {
      console.error('Token generation error:', error);
      
      if (error.code === 'auth/user-not-found') {
        return res.status(404).json({ error: 'User not found. Register first.' });
      }
      
      res.status(500).json({ 
        error: error.message,
        errorCode: error.code,
        fullError: error.toString()
      });
    }
  });
});