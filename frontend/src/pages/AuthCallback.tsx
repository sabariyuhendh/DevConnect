import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      // Store token
      localStorage.setItem('token', token);

      // Fetch user data
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      fetch(`${API_BASE}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setUser({
              id: data.user.id,
              email: data.user.email,
              username: data.user.username,
              firstName: data.user.firstName,
              lastName: data.user.lastName,
              profilePicture: data.user.profilePicture,
              token
            });
            navigate('/feed');
          } else {
            navigate('/login');
          }
        })
        .catch(err => {
          console.error('Error fetching user:', err);
          navigate('/login');
        });
    } else {
      navigate('/login');
    }
  }, [navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
}
