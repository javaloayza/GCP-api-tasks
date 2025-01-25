const admin = require('firebase-admin');

// Inicializar Firebase una sola vez
if (!admin.apps.length) {
  admin.initializeApp();
}

const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    

     // SOLUCIÓN DE TESTING: Decodificar customToken manualmente
    // En producción REAL, usarías admin.auth().verifyIdToken() con idTokens
    // 
    // EXPLICACIÓN:
    // 1. CustomToken = JWT con 3 partes: header.payload.signature
    // 2. split('.')[1] = obtiene el payload (parte del medio)
    // 3. Buffer.from(base64) = decodifica el payload
    // 4. JSON.parse() = convierte a objeto para obtener el uid
    //
    // FLUJO NORMAL en producción:
    // Frontend → signInWithCustomToken() → Firebase → devuelve idToken
    // Backend → verifyIdToken() → obtiene uid verificado

    // VERSIÓN PRODUCCIÓN (con idTokens reales):
    // const decodedToken = await admin.auth().verifyIdToken(token);
    // req.user = decodedToken;

    // Para testing - decodificar customToken manualmente
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    
    req.user = { uid: payload.uid };
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = { authenticateUser };

// 📚 DIFERENCIAS IMPORTANTES:
// 🔑 Custom Token:

// Generado por: Firebase Admin SDK (backend)
// Propósito: Para que el frontend haga login
// Uso normal: Frontend usa customToken → Firebase → devuelve idToken
// Verificación: No se verifica directamente, se "canjea" por idToken

// 🎫 ID Token:

// Generado por: Firebase Auth (después de login exitoso)
// Propósito: Para autenticar requests a tu API
// Uso normal: Frontend envía idToken en cada request
// Verificación: admin.auth().verifyIdToken()