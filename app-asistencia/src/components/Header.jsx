import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../services/auth';

export default function Header() {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">
          Sistema de Asistencia
        </h1>
        {user && (
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">
              {user.email} ({userRole})
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Cerrar Sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
}