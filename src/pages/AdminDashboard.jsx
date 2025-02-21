import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getAllEmployeesAttendance } from '../services/attendance';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function AdminDashboard() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [employeeData, setEmployeeData] = useState({});

  useEffect(() => {
    loadAttendanceData();
  }, [date]);

  const loadAttendanceData = async () => {
    setLoading(true);
    const { records, error } = await getAllEmployeesAttendance(date);
    
    if (error) {
      setError(error);
    } else {
      // Obtener información de los empleados
      const employeeInfo = {};
      for (const record of records) {
        if (!employeeInfo[record.userId]) {
          const userDoc = await getDoc(doc(db, 'users', record.userId));
          if (userDoc.exists()) {
            employeeInfo[record.userId] = userDoc.data();
          }
        }
      }
      setEmployeeData(employeeInfo);
      setAttendanceRecords(records);
    }
    setLoading(false);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    
    // Si es un timestamp de Firestore, convertirlo a Date
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
    if (!(date instanceof Date) || isNaN(date)) return '-';
    
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateHours = (records) => {
    const entrada = records.find(r => r.type === 'entrada')?.timestamp;
    const salida = records.find(r => r.type === 'salida')?.timestamp;
    
    if (!entrada || !salida) return 'N/A';
    
    // Convertir timestamps de Firestore a Date
    const entradaDate = entrada.toDate ? entrada.toDate() : new Date(entrada);
    const salidaDate = salida.toDate ? salida.toDate() : new Date(salida);
    
    if (entradaDate instanceof Date && !isNaN(entradaDate) &&
        salidaDate instanceof Date && !isNaN(salidaDate)) {
      const diff = (salidaDate - entradaDate) / (1000 * 60 * 60);
      return diff.toFixed(2);
    }
    return 'N/A';
  };

  const formatLocation = (location) => {
    if (!location) return '-';
    return `${location.latitude}, ${location.longitude}`;
  };

  // Agrupar registros por empleado
  const groupedRecords = attendanceRecords.reduce((acc, record) => {
    if (!acc[record.userId]) {
      acc[record.userId] = [];
    }
    acc[record.userId].push(record);
    return acc;
  }, {});

  return (
    <div className="min-h-screen w-full bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
      <div className="w-full max-w-7xl mx-auto bg-white rounded-xl shadow-2xl p-6 sm:p-10">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Panel de Administración
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Control de asistencia de empleados
          </p>
        </div>

        <div className="mb-6">
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Seleccionar fecha
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-sm text-center bg-red-50 p-4 rounded">
            {error}
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Registros de Asistencia
              </h3>
            </div>
            <div className="border-t border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Empleado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entrada
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Salida
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Horas Trabajadas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ubicación
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(groupedRecords).map(([userId, records]) => {
                    const userData = employeeData[userId] || {};
                    const entrada = records.find(r => r.type === 'entrada');
                    const salida = records.find(r => r.type === 'salida');
                    
                    return (
                      <tr key={userId}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {userData.name} {userData.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {userData.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(entrada?.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(salida?.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {calculateHours(records)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatLocation(entrada?.location)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}