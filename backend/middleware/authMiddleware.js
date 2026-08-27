const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      let decoded = null;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || 'foodbridge_super_secret_jwt_key_2026');
      } catch (e) {
        try {
          decoded = jwt.verify(token, 'sharebite_secret_key');
        } catch (e2) {}
      }
      if (decoded) req.user = decoded;
    } catch (error) {
      console.error('Auth Token verification failed:', error.message);
    }
  }

  next();
};

module.exports = { protect };
