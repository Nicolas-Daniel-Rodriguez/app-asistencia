import React, { useEffect, useState } from 'react';

const Version = () => {
  const [version, setVersion] = useState('Cargando...');

  useEffect(() => {
    fetch('/version.txt') 
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error al cargar la versión');
        }
        return response.text();
      })
      .then((data) => {
        setVersion(data.trim());
      })
      .catch((err) => {
        console.error('Error al cargar la versión:', err);
        setVersion('Error al cargar la versión');
      });
  }, []);

  return <footer className="text-center text-gray-500 font-bold">{version}</footer>;
};

export default Version;