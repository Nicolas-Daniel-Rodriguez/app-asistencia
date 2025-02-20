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
      minute: '2-digit',
      hour12: false
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
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Panel de Administración</h1>
        
        <div className="mb-6">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center">Cargando...</div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
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
                        <div className="text-sm text-gray-900">
                          {userData.name} {userData.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{userData.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(entrada?.timestamp)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(salida?.timestamp)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {calculateHours(records)}
                        </div>
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
        )}
      </div>
    </div>
  );
}