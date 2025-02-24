import { useState, useEffect } from 'react';
import { addLocation, updateLocation, deleteLocation, getLocations } from '../services/locations';

export default function LocationsManager() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingLocation, setEditingLocation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    latitude: '',
    longitude: '',
    radius: 100
  });

  const loadLocations = async () => {
    setLoading(true);
    const { locations: loadedLocations, error } = await getLocations();
    if (error) {
      setError(error);
    } else {
      setLocations(loadedLocations);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadLocations();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const locationData = {
      name: formData.name,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      radius: parseInt(formData.radius)
    };

    const { error } = editingLocation
      ? await updateLocation(editingLocation.id, locationData)
      : await addLocation(locationData);

    if (error) {
      setError(error);
    } else {
      setFormData({ name: '', latitude: '', longitude: '', radius: 100 });
      setEditingLocation(null);
      setIsModalOpen(false);
      loadLocations();
    }
    setLoading(false);
  };

  const handleEdit = (location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
      radius: location.radius
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (locationId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta ubicación?')) {
      setLoading(true);
      const { error } = await deleteLocation(locationId);
      if (error) {
        setError(error);
      } else {
        loadLocations();
      }
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingLocation(null);
    setFormData({ name: '', latitude: '', longitude: '', radius: 100 });
    setIsModalOpen(true);
  };

  const handleViewMap = (location) => {
    setSelectedLocation(location);
    setIsMapModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Botón para agregar nueva ubicación */}
      <div className="flex justify-end">
        <button
          onClick={handleAddNew}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Agregar Nueva Ubicación
        </button>
      </div>

      {/* Modal del formulario */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingLocation ? 'Editar Ubicación' : 'Agregar Nueva Ubicación'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Cerrar</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Ej: Oficina Central"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Latitud</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.latitude}
                    onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="-34.123456"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Longitud</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.longitude}
                    onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="-58.123456"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Radio (metros)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.radius}
                  onChange={(e) => setFormData({...formData, radius: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="100"
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              <div className="flex justify-end space-x-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {loading ? 'Guardando...' : (editingLocation ? 'Actualizar' : 'Agregar')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal del mapa */}
      {isMapModalOpen && selectedLocation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedLocation.name}
              </h3>
              <button
                onClick={() => setIsMapModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Cerrar</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                className="w-full h-[400px] rounded-md"
                frameBorder="0"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedLocation.longitude-0.002},${selectedLocation.latitude-0.002},${selectedLocation.longitude+0.002},${selectedLocation.latitude+0.002}&layer=mapnik&marker=${selectedLocation.latitude},${selectedLocation.longitude}`}
              ></iframe>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p>Latitud: {selectedLocation.latitude}</p>
              <p>Longitud: {selectedLocation.longitude}</p>
              <p>Radio permitido: {selectedLocation.radius} metros</p>
              <div className="mt-2 space-x-4">
                <a 
                  href={`https://www.openstreetmap.org/?mlat=${selectedLocation.latitude}&mlon=${selectedLocation.longitude}#map=17/${selectedLocation.latitude}/${selectedLocation.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-900 hover:underline"
                >
                  Abrir en OpenStreetMap
                </a>
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

      {/* Tabla de ubicaciones */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coordenadas</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Radio</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {locations.map((location) => (
              <tr key={location.id}>
                <td className="px-6 py-4 whitespace-nowrap">{location.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleViewMap(location)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    {location.latitude}, {location.longitude}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{location.radius}m</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(location)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(location.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}