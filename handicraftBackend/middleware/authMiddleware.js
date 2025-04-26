import jwt from 'jsonwebtoken';
import User from '../models/customer/User.js';

export const protect = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'No token, authorization denied' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from token
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ error: 'Token is not valid' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ error: 'Token is not valid' });
    }
};

// Middleware to check if user is a customer (not admin)
export const customerOnly = (req, res, next) => {
    if (req.user && !req.user.isAdmin) {
        next();
    } else {
        res.status(403).json({ error: 'Access denied. Customers only.' });
    }
}; 