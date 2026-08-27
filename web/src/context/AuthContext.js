import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sharebite_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('sharebite_token'));

  const [sessionMode, setSessionMode] = useState(() => {
    const savedMode = localStorage.getItem('sharebite_session_mode');
    if (savedMode) return savedMode;
    const savedRole = localStorage.getItem('sharebite_role');
    return savedRole === 'ADMIN' ? 'admin' : 'user';
  });

  const [selectedRole, setSelectedRole] = useState(() => {
    const saved = localStorage.getItem('sharebite_selected_role');
    if (saved) return saved.toLowerCase();
    const savedRole = localStorage.getItem('sharebite_role');
    return savedRole && savedRole !== 'ADMIN' ? savedRole.toLowerCase() : null;
  });

  const [role, setRole] = useState(() => {
    const savedMode = localStorage.getItem('sharebite_session_mode');
    if (savedMode === 'admin') return 'ADMIN';
    const savedRole = localStorage.getItem('sharebite_role');
    return savedRole ? savedRole.toUpperCase() : 'DONOR';
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      getMe()
        .then((res) => {
          if (res && res.success && res.user) {
            const savedMode = localStorage.getItem('sharebite_session_mode') || 'user';
            const savedRole = localStorage.getItem('sharebite_role');

            let activeRole = 'DONOR';
            if (savedMode === 'admin' || savedRole === 'ADMIN') {
              activeRole = 'ADMIN';
            } else if (savedRole && savedRole !== 'ADMIN') {
              activeRole = savedRole.toUpperCase();
            } else {
              activeRole = (res.user.role || 'DONOR').toUpperCase();
            }

            const updatedUser = { ...res.user, activeRole, role: activeRole };
            setCurrentUser(updatedUser);
            setRole(activeRole);
            setSessionMode(savedMode);
            localStorage.setItem('sharebite_user', JSON.stringify(updatedUser));
            localStorage.setItem('sharebite_role', activeRole);
            localStorage.setItem('sharebite_session_mode', savedMode);
          }
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = (newToken, userData, options = {}) => {
    localStorage.setItem('sharebite_token', newToken);

    const mode = options.sessionMode || (options.role === 'ADMIN' || userData?.role === 'ADMIN' ? 'admin' : 'user');
    const activeRole = mode === 'admin' ? 'ADMIN' : (options.role || userData?.role || 'DONOR').toUpperCase();

    localStorage.setItem('sharebite_session_mode', mode);
    localStorage.setItem('sharebite_role', activeRole);

    if (userData) {
      const updatedUser = { ...userData, activeRole, role: activeRole };
      localStorage.setItem('sharebite_user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
    }

    setSessionMode(mode);
    setRole(activeRole);
    setToken(newToken);
  };

  const switchRole = (newRole) => {
    if (!newRole) return;
    const formatted = newRole.toUpperCase();
    if (formatted === 'ADMIN' && !currentUser?.isAdmin && currentUser?.role !== 'ADMIN') {
      console.warn('Regular users cannot switch to ADMIN role.');
      return;
    }

    const newMode = formatted === 'ADMIN' ? 'admin' : 'user';
    setSessionMode(newMode);
    setRole(formatted);

    localStorage.setItem('sharebite_session_mode', newMode);
    localStorage.setItem('sharebite_role', formatted);

    if (formatted !== 'ADMIN') {
      setSelectedRole(newRole.toLowerCase());
      localStorage.setItem('sharebite_selected_role', newRole.toLowerCase());
    }

    if (currentUser) {
      const updated = { ...currentUser, activeRole: formatted };
      setCurrentUser(updated);
      localStorage.setItem('sharebite_user', JSON.stringify(updated));
    }
  };

  const logout = () => {
    localStorage.removeItem('sharebite_token');
    localStorage.removeItem('sharebite_user');
    localStorage.removeItem('sharebite_role');
    localStorage.removeItem('sharebite_session_mode');
    localStorage.removeItem('sharebite_selected_role');
    setToken(null);
    setCurrentUser(null);
    setRole(null);
    setSessionMode('user');
    setSelectedRole(null);
  };

  const refreshUserProfile = async () => {
    try {
      const res = await getMe();
      if (res.success && res.user) {
        const savedMode = localStorage.getItem('sharebite_session_mode') || 'user';
        const savedRole = localStorage.getItem('sharebite_role');
        const activeRole = savedMode === 'admin' || savedRole === 'ADMIN' ? 'ADMIN' : (savedRole ? savedRole.toUpperCase() : 'DONOR');

        const updatedUser = { ...res.user, activeRole, role: activeRole };
        setCurrentUser(updatedUser);
        setRole(activeRole);
        setSessionMode(savedMode);
        localStorage.setItem('sharebite_user', JSON.stringify(updatedUser));
        localStorage.setItem('sharebite_role', activeRole);
      }
    } catch (e) {
      console.warn('Failed to refresh user profile:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        role,
        sessionMode,
        selectedRole,
        authUserId: currentUser?.id || currentUser?._id,
        isAdmin: Boolean(currentUser?.isAdmin || role === 'ADMIN'),
        loading,
        login,
        logout,
        switchRole,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
