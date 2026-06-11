import jwt from 'jsonwebtoken';
import { findAccountById } from '../models/User.js';

export const protectedRoute = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: 'Thiếu Authorization header. Hãy gửi: Authorization: Bearer <token>',
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Format sai. Phải là: Authorization: Bearer <token>',
      });
    }

    const token = authHeader.slice(7);
    if (!token) {
      return res.status(401).json({ message: 'Access token trống' });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const account = await findAccountById(decoded.maTaiKhoan);

    if (!account) {
      return res.status(404).json({ message: 'Tai khoan khong ton tai' });
    }

    req.account = account;
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    return res.status(403).json({ message: 'Access token het han hoac khong hop le. Error: ' + error.message });
  }
};
