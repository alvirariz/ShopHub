// Check if user has required role(s)
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required.' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. This route requires one of the following roles: ${allowedRoles.join(', ')}`,
        yourRole: req.user.role
      });
    }

    next();
  };
};

// Specific role checks (shorthand helpers)
const isCustomer = authorize('customer');
const isStoreOwner = authorize('storeOwner');
const isAdmin = authorize('admin');

// Allow multiple roles
const isStoreOwnerOrAdmin = authorize('storeOwner', 'admin');
const isCustomerOrStoreOwner = authorize('customer', 'storeOwner');

module.exports = { 
  authorize, 
  isCustomer, 
  isStoreOwner, 
  isAdmin,
  isStoreOwnerOrAdmin,
  isCustomerOrStoreOwner
};