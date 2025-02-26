import React, { useEffect, useState } from 'react';

const Version = () => {
  const [version, setVersion] = useState('');

  useEffect(() => {
    fetch('/version.txt', {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    }) 
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error al cargar la versión: ${response.status}`);
        }
        return response.text();
      })
      .then((data) => {
        if (!data) {
          throw new Error('Archivo de versión vacío');
        }
        setVersion(`v${data.trim()}`);
      })
      .catch((err) => {
        console.error('Error al cargar la versión:', err);
        setVersion('v1.0.0'); // Versión por defecto
      });
  }, []);

  return version ? (
    <footer className="text-center text-gray-500 text-sm py-2">{version}</footer>
  ) : null;
};

export default Version;