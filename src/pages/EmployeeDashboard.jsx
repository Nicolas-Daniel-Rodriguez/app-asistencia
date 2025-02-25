import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { registerAttendance } from "../services/attendance";
import { getEmployeeAttendance } from "../services/attendance";
import LocationModal from "../components/LocationModal";
import LocationsManager from "../components/LocationsManager";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      const options = {
        enableHighAccuracy: true, // Solicita la mejor precisión posible
        timeout: 10000, // Tiempo máximo para obtener la ubicación (10 segundos)
        maximumAge: 0, // Siempre obtener una posición nueva
      };

      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) =>
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy, // Agregar la precisión para debugging
              timestamp: position.timestamp, // Agregar el timestamp para debugging
            }),
          (error) => {
            let errorMessage;
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage =
                  "Usuario denegó la solicitud de geolocalización.";
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = "Información de ubicación no disponible.";
                break;
              case error.TIMEOUT:
                errorMessage =
                  "Se agotó el tiempo de espera para obtener la ubicación.";
                break;
              default:
                errorMessage = "Error desconocido al obtener la ubicación.";
            }
            reject(new Error(errorMessage));
          },
          options
        );
      });
    } else {
      return Promise.reject(
        "Geolocalización no disponible en este dispositivo"
      );
    }
  };

  const handleAttendance = async (type) => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      // Obtener ubicación actual
      const location = await getCurrentLocation();

      // Registrar asistencia
      const {
        error: attendanceError,
        distance,
        locationName,
      } = await registerAttendance(user.uid, type, location);

      if (attendanceError) {
        setError(attendanceError);
      } else {
        setMessage(`Se ha registrado tu ${type} correctamente.
          • Precisión GPS: ±${Math.round(location.accuracy)}m
          • Ubicación: ${locationName}
          • Distancia: ${distance}m`);
      }
    } catch (error) {
      setError("Error al obtener ubicación: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Historial de asistencias
  useEffect(() => {
    loadAttendanceData();
  }, [date, user.uid]);

  const loadAttendanceData = async () => {
    try {
      setLoading(true);
      setError("");
      const { records, error: attendanceError } = await getEmployeeAttendance(
        user.uid,
        date
      );

      if (attendanceError) {
        setError(attendanceError);
        return;
      }

      setAttendanceRecords(records);
    } catch (err) {
      console.error("Error loading attendance:", err);
      setError("Error al cargar los registros de asistencia");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    if (!(date instanceof Date) || isNaN(date)) return "-";
    return date.toLocaleString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 p-4 overflow-x-hidden">
      <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-6 sm:p-10 my-4">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Registro de Asistencia
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Registra tu entrada y salida
          </p>
        </div>

        <div className="mb-8">
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
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button
            onClick={() => handleAttendance("entrada")}
            disabled={loading}
            className="flex-1 px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
          >
            {loading ? "Procesando..." : "Marcar Entrada"}
          </button>
          <button
            onClick={() => handleAttendance("salida")}
            disabled={loading}
            className="flex-1 px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
          >
            {loading ? "Procesando..." : "Marcar Salida"}
          </button>
        </div>
        <div className="mt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Historial de Asistencia
          </h3>
          <div className="mb-4">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border rounded p-2"
            />
          </div>
          <div className="overflow-hidden">
            <div className="max-h-[280px] overflow-y-auto overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha y Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ubicación
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendanceRecords.map((record, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="capitalize">{record.type}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatDate(record.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.location ? (
                          <button
                            onClick={() => {
                              setSelectedLocation(record.location);
                              setIsMapModalOpen(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 hover:underline"
                          >
                            {record.location.nearestLocationName ||
                              "Ver ubicación"}
                          </button>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {isMapModalOpen && selectedLocation && (
                <LocationModal
                  isOpen={isMapModalOpen}
                  onClose={() => setIsMapModalOpen(false)}
                  location={selectedLocation}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
