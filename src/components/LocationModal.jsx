import React from 'react';

const LocationModal = ({ isOpen, onClose, location }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Ubicación
          </h3>
          <button
            onClick={onClose}
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
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.longitude-0.002},${location.latitude-0.002},${location.longitude+0.002},${location.latitude+0.002}&layer=mapnik&marker=${location.latitude},${location.longitude}`}
          ></iframe>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <p>Latitud: {location.latitude}</p>
          <p>Longitud: {location.longitude}</p>
          <div className="mt-2 space-x-4">
            <a 
              href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
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
  );
};

export default LocationModal;