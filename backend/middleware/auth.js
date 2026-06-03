import jwt from 'jsonwebtoken'

const authUser = async (req, res, next) => {
  try {
    // Try to get token from custom header first, then Authorization header
    let token = req.headers.token;
    
    if (!token && req.headers.authorization) {
      // Extract from Authorization: Bearer <token>
      const auth = req.headers.authorization;
      if (auth.startsWith('Bearer ')) {
        token = auth.substring(7);
      } else {
        token = auth;
      }
    }

    console.log('Auth middleware - token:', token ? 'present' : 'missing');

    if (!token) {
      console.log('No token found in headers');
      return res.status(401).json({ success: false, message: 'Not authorized Login' });
    }

    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    req.body.userId = token_decode.id;
    console.log('Auth successful, userId:', token_decode.id);
    next();
  } catch (error) {
    console.log('Auth error:', error.message);
    res.status(401).json({ success: false, message: error.message });
  }
};

export default authUser;
