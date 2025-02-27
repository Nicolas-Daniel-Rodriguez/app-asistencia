import { useState, useEffect } from 'react';
import { getLocationScheduleConfig, updateLocationScheduleConfig, createDefaultConfig } from '../services/scheduleConfig';

const DAYS = [
  { value: '0', label: 'Domingo' },
  { value: '1', label: 'Lunes' },
  { value: '2', label: 'Martes' },
  { value: '3', label: 'Miércoles' },
  { value: '4', label: 'Jueves' },
  { value: '5', label: 'Viernes' },
  { value: '6', label: 'Sábado' }
];

export default function ScheduleConfig({ locationId, onClose }) {
  const [config, setConfig] = useState(createDefaultConfig());
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadConfig();
  }, [locationId]);

  const loadConfig = async () => {
    try {
      const data = await getLocationScheduleConfig(locationId);
      setConfig(data);
    } catch (error) {
      setMessage('Error al cargar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateLocationScheduleConfig(locationId, config);
      setMessage('Configuración actualizada correctamente');
      setTimeout(() => {
        setMessage('');
        if (onClose) onClose();
      }, 2000);
    } catch (error) {
      setMessage('Error al actualizar la configuración');
    }
  };

  const handleDayChange = (day) => {
    const newDays = config.workDays.includes(day)
      ? config.workDays.filter(d => d !== day)
      : [...config.workDays, day].sort();
    setConfig({ ...config, workDays: newDays });
  };

  if (loading) return <div className="text-center py-4">Cargando...</div>;

  return (
    <div className="bg-white rounded-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Días Laborables
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {DAYS.map((day) => (
              <label key={day.value} className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={config.workDays.includes(day.value)}
                  onChange={() => handleDayChange(day.value)}
                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                <span className="ml-2">{day.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hora de Entrada
            </label>
            <input
              type="time"
              value={config.entryTime}
              onChange={(e) => setConfig({ ...config, entryTime: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hora de Salida
            </label>
            <input
              type="time"
              value={config.exitTime}
              onChange={(e) => setConfig({ ...config, exitTime: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tolerancia (minutos)
            </label>
            <input
              type="number"
              min="0"
              max="60"
              value={config.toleranceMinutes}
              onChange={(e) => setConfig({ ...config, toleranceMinutes: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>
        </div>

        {message && (
          <div className={`mt-4 p-2 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}

        <div className="mt-4 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}