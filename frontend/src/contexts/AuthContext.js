import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext({
  token: null,
  userRole: null,
  login: () => {},
  logout: () => {}
});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || null);

  const login = (newToken, newRole) => {
    setToken(newToken);
    setUserRole(newRole);
    localStorage.setItem('token', newToken);
    localStorage.setItem('userRole', newRole);
  };

  const logout = () => {
    setToken(null);
    setUserRole(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
  };

  return (
    <AuthContext.Provider value={{ token, userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
