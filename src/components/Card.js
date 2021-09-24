import React from 'react';
import { Link } from 'react-router-dom';

const Card = ({ id, nombre, integrantes, monto, periodo }) => {
  return (
    
      <div className='tc grow bg-light-green br3 pa3 ma2 dib bw2 shadow-5'>
        <div>
          <Link to={`/buscar-tandas/${id}`}>
          <h2>{nombre}</h2>
          </Link>
          <p>Integrantes: {integrantes}</p>
          <p>Monto: ${monto}</p>
          <p>Periodo: cada {periodo} días.</p>
        </div>
      </div>
    
  );
}

export default Card;
