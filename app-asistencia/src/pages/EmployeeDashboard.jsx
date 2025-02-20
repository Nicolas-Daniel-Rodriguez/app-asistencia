import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { registerAttendance } from '../services/attendance';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          position => resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }),
          error => reject(error)
        );
      });
    } else {
      return Promise.reject("Geolocalización no disponible");
    }
  };

  const handleAttendance = async (type) => {
    try {
      setLoading(true);
      setError('');
      setMessage('');

      // Obtener ubicación actual
      const location = await getCurrentLocation();
      
      // Registrar asistencia
      const { error: attendanceError } = await registerAttendance(user.uid, type, location);
      
      if (attendanceError) {
        setError(attendanceError);
      } else {
        setMessage(`Se ha registrado tu ${type} correctamente`);
      }
    } catch (error) {
      setError('Error al obtener ubicación: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h2 className="text-2xl font-bold mb-8 text-center">Registro de Asistencia</h2>
                
                {message && (
                  <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">
                    {message}
                  </div>
                )}

                {error && (
                  <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <button
                    onClick={() => handleAttendance('entrada')}
                    disabled={loading}
                    className="w-full py-3 px-6 text-white rounded-lg bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50"
                  >
                    {loading ? 'Procesando...' : 'Marcar Entrada'}
                  </button>
                  <button
                    onClick={() => handleAttendance('salida')}
                    disabled={loading}
                    className="w-full py-3 px-6 text-white rounded-lg bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:opacity-50"
                  >
                    {loading ? 'Procesando...' : 'Marcar Salida'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}