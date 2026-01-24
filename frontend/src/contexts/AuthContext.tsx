import { createContext, useState, useEffect } from 'react';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Optionally, load user from localStorage or check session
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    setIsLoading(false);
  }, []);

  // Login function using backend
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        const userData = { email };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('✓ Login successful, user set:', userData);
        return true;
      } else {
        console.error('Login error:', data.message || data.error);
        return false;
      }
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const register = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        return true;
      } else {
        console.error('Register error:', data.message || data.error);
        return false;
      }
    } catch (error) {
      console.error('Register failed:', error);
      return false;
    }
  };

const updateProfile = async (profileData: {
  fullName: string;
  gender: string;
  phoneNumber: string;
  bio: string;
}): Promise<boolean> => {
  if (!user?.email) return false;

  try {
    const res = await fetch('http://127.0.0.1:5000/api/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        fullName: profileData.fullName,
        gender: profileData.gender,
        phoneNumber: profileData.phoneNumber,
        bio: profileData.bio,
      }),
    });

    const result = await res.json();

    if (res.ok) {
      // Update local user context
      const updatedUser = {
        ...user,
        fullName: profileData.fullName,
        gender: profileData.gender,
        phoneNumber: profileData.phoneNumber,
        bio: profileData.bio,
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return true;
    } else {
      console.error('Update failed:', result.message);
      return false;
    }
  } catch (err) {
    console.error('Error updating profile:', err);
    return false;
  }
};










  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateProfile }}>

      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
