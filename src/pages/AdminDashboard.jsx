import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getAllEmployeesAttendance } from "../services/attendance";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import LocationsManager from "../components/LocationsManager";
import { getScheduleConfig, calculateAttendanceStatus } from "../services/scheduleConfig";

export default function AdminDashboard() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [employeeData, setEmployeeData] = useState({});
  const [activeTab, setActiveTab] = useState("attendance");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [scheduleConfig, setScheduleConfig] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadAttendanceData();
    loadScheduleConfig();
  }, [date]);

  const loadAttendanceData = async () => {
    try {
      setLoading(true);
      setError("");
      const { records, error } = await getAllEmployeesAttendance(date);

      if (error) {
        setError(error);
        return;
      }

      // Obtener información de los empleados
      const employeeInfo = {};
      for (const record of records) {
        if (!employeeInfo[record.userId]) {
          const userDoc = await getDoc(doc(db, "users", record.userId));
          if (userDoc.exists()) {
            employeeInfo[record.userId] = userDoc.data();
          }
        }
      }

      setEmployeeData(employeeInfo);
      setAttendanceRecords(records);
    } catch (err) {
      console.error("Error loading attendance:", err);
      setError("Error al cargar los registros de asistencia");
    } finally {
      setLoading(false);
    }
  };

  const loadScheduleConfig = async () => {
    try {
      const config = await getScheduleConfig();
      setScheduleConfig(config);
    } catch (error) {
      console.error('Error loading schedule config:', error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";

    // Si es un timestamp de Firestore, convertirlo a Date
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

  const calculateHours = (records) => {
    const entrada = records.find((r) => r.type === "entrada")?.timestamp;
    const salida = records.find((r) => r.type === "salida")?.timestamp;

    if (!entrada || !salida) return "N/A";

    // Convertir timestamps de Firestore a Date
    const entradaDate = entrada.toDate ? entrada.toDate() : new Date(entrada);
    const salidaDate = salida.toDate ? salida.toDate() : new Date(salida);

    if (
      entradaDate instanceof Date &&
      !isNaN(entradaDate) &&
      salidaDate instanceof Date &&
      !isNaN(salidaDate)
    ) {
      const diff = (salidaDate - entradaDate) / (1000 * 60 * 60);
      return diff.toFixed(2);
    }
    return "N/A";
  };

  const formatLocation = (location) => {
    if (!location) return "-";
    return (
      <button
        onClick={() => {
          setSelectedLocation(location);
          setIsMapModalOpen(true);
        }}
        className="text-indigo-600 hover:text-indigo-900 hover:underline"
      >
        {location.nearestLocationName || "Ver ubicación"}
      </button>
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'onTime':
        return 'bg-green-100 text-green-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'justified':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'onTime':
        return 'En horario';
      case 'late':
        return 'Tarde';
      case 'absent':
        return 'Ausente';
      case 'justified':
        return 'Justificado';
      default:
        return 'Desconocido';
    }
  };

  const handleJustify = async (userId, timestamp, justification) => {
    try {
      const attendanceRef = doc(db, "attendance", `${userId}_${timestamp}`);
      await updateDoc(attendanceRef, {
        justification,
        status: "justified",
      });
      loadAttendanceData();
    } catch (error) {
      console.error("Error al justificar asistencia:", error);
    }
  };

  // Agrupar los registros por empleado y entrada/salida
  const groupedRecords = Object.entries(
    attendanceRecords.reduce((acc, record) => {
      if (!acc[record.userId]) {
        acc[record.userId] = [];
      }
      acc[record.userId].push(record);
      return acc;
    }, {})
  ).map(([userId, records]) => {
    // Ordenar registros por timestamp
    const sortedRecords = records.sort((a, b) => {
      const timeA = a.timestamp.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
      const timeB = b.timestamp.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
      return timeA - timeB;
    });
    
    // Separar entradas y salidas
    const entradas = sortedRecords.filter(r => r.type === "entrada");
    const salidas = sortedRecords.filter(r => r.type === "salida");
    
    // Crear pares de entrada-salida
    const pairs = entradas.map((entrada, index) => {
      // Buscar la primera salida que sea posterior a esta entrada
      const entradaTime = entrada.timestamp.toDate ? entrada.timestamp.toDate() : new Date(entrada.timestamp);
      
      const salida = salidas.find(s => {
        const salidaTime = s.timestamp.toDate ? s.timestamp.toDate() : new Date(s.timestamp);
        return salidaTime > entradaTime;
      });
      
      // Si encontramos una salida correspondiente, la removemos de la lista
      if (salida) {
        salidas.splice(salidas.indexOf(salida), 1);
      }
      
      return {
        entrada,
        salida: salida || null
      };
    });

    return { userId, pairs };
  });

  const filteredRecords = groupedRecords.filter(({ userId, pairs }) => {
    const userData = employeeData[userId] || {};
    const nameMatch = (userData.name + " " + userData.lastName)
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    if (!nameMatch) return false;
    if (statusFilter === "all") return true;

    return pairs.some((pair) => {
      const status = calculateAttendanceStatus(pair.entrada?.timestamp, scheduleConfig);
      return status === statusFilter || (status === "justified" && pair.entrada?.justification);
    });
  });

  return (
    <div className="min-h-screen w-screen bg-gradient-to-r from-blue-500 to-indigo-600 p-4  overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto bg-white rounded-xl shadow-2xl p-6 sm:p-10 my-4">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Panel de Administración
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Control de asistencia de empleados
          </p>
        </div>

        <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Fecha
            </label>
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mb-4 md:mb-0 px-4 py-2 border rounded-md"
          />
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Buscar empleado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border rounded-md"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-md"
            >
              <option value="all">Todos los estados</option>
              <option value="onTime">En horario</option>
              <option value="late">Tarde</option>
              <option value="absent">Ausente</option>
              <option value="justified">Justificado</option>
            </select>
          </div>
        </div>

        {/* Modal del mapa */}
        {isMapModalOpen && selectedLocation && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Ubicación del Registro
                </h3>
                <button
                  onClick={() => setIsMapModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Cerrar</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="aspect-w-16 aspect-h-9">
                <iframe
                  className="w-full h-[400px] rounded-md"
                  frameBorder="0"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                    selectedLocation.longitude - 0.002
                  },${selectedLocation.latitude - 0.002},${
                    selectedLocation.longitude + 0.002
                  },${selectedLocation.latitude + 0.002}&layer=mapnik&marker=${
                    selectedLocation.latitude
                  },${selectedLocation.longitude}`}
                ></iframe>
              </div>

              <div className="mt-4 text-sm text-gray-600">
                <p>Latitud: {selectedLocation.latitude}</p>
                <p>Longitud: {selectedLocation.longitude}</p>
                <div className="mt-2 space-x-4">
                  <a
                    href={`https://www.google.com/maps?q=${selectedLocation.latitude},${selectedLocation.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-900 hover:underline"
                  >
                    Abrir en Google Maps
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pestañas de navegación */}
        <div className="border-b border-gray-200 mb-6">
  <nav className="-mb-px flex space-x-8">
    <button
      onClick={() => setActiveTab("attendance")}
      className={`${
        activeTab === "attendance"
          ? "border-indigo-500 text-indigo-600"
          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
    >
      Asistencias
    </button>
    <button
      onClick={() => setActiveTab("locations")}
      className={`${
        activeTab === "locations"
          ? "border-indigo-500 text-indigo-600"
          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
    >
      Ubicaciones
    </button>
  </nav>
</div>

        {/* Contenido de las pestañas */}
        {activeTab === "attendance" ? (
          <div className="attendance-section">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 text-sm text-center bg-red-50 p-4 rounded">
                {error}
              </div>
            ) : Object.keys(filteredRecords).length === 0 ? (
              <div className="text-gray-500 text-sm text-center bg-gray-50 p-4 rounded">
                No hay registros de asistencia para esta fecha
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Registros de Asistencia
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <div className="max-h-[280px] overflow-y-auto overflow-x-auto">
                    <table className="responsive-table min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Empleado
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Entrada
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Salida
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Horas Trabajadas
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Ubicación
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Notas
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredRecords.map(({ userId, pairs }) => {
                          const userData = employeeData[userId] || {};
                          return pairs.map((pair, index) => (
                            <tr key={`${userId}-${index}`}>
                              <td data-label="Empleado" className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {userData.name} {userData.lastName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {userData.email}
                                </div>
                              </td>
                              <td data-label="Entrada" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div>
                                  {formatDate(pair.entrada?.timestamp)}
                                  {pair.entrada?.timestamp && scheduleConfig && (
                                    <div className="mt-1">
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(calculateAttendanceStatus(pair.entrada.timestamp, scheduleConfig))}`}>
                                        {getStatusText(calculateAttendanceStatus(pair.entrada.timestamp, scheduleConfig))}
                                      </span>
                                      {!pair.entrada.justification && calculateAttendanceStatus(pair.entrada.timestamp, scheduleConfig) !== 'onTime' && (
                                        <button
                                          onClick={() => {
                                            const justification = prompt('Ingrese la justificación:');
                                            if (justification) {
                                              handleJustify(userId, pair.entrada.timestamp.seconds, justification);
                                            }
                                          }}
                                          className="ml-2 text-xs text-indigo-600 hover:text-indigo-800"
                                        >
                                          Justificar
                                        </button>
                                      )}
                                    </div>
                                  )}
                                  {pair.entrada?.justification && (
                                    <div className="text-xs text-indigo-600 mt-1">
                                      Justificación: {pair.entrada.justification}
                                    </div>
                                  )}
                                  {pair.entrada?.note && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      Nota: {pair.entrada.note}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td data-label="Salida" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(pair.salida?.timestamp) || "En curso"}
                                {pair.salida?.note && (
                                  <div className="text-xs text-indigo-600 mt-1">
                                    Nota: {pair.salida.note}
                                  </div>
                                )}
                              </td>
                              <td data-label="Horas Trabajadas" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {pair.salida
                                  ? calculateHours([pair.entrada, pair.salida])
                                  : "En curso"}
                              </td>
                              <td data-label="Ubicación" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatLocation(pair.entrada?.location)}
                              </td>
                              <td data-label="Notas" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {(pair.entrada?.note || pair.salida?.note) ? (
                                  <div>
                                    {pair.entrada?.note && (
                                      <div className="mb-1">
                                        <span className="font-medium">Entrada:</span> {pair.entrada.note}
                                      </div>
                                    )}
                                    {pair.salida?.note && (
                                      <div>
                                        <span className="font-medium">Salida:</span> {pair.salida.note}
                                      </div>
                                    )}
                                  </div>
                                ) : "-"}
                              </td>
                            </tr>
                          ));
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <LocationsManager />
        )}
      </div>
    </div>
  );
}
