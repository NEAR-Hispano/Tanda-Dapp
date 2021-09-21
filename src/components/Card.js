import React from 'react';

const Card = ({nombre, integrantes, monto, periodo }) => {
  return (
    <div className='tc grow bg-light-green br3 pa3 ma2 dib bw2 shadow-5'>
      <div>
        <h2>{nombre}</h2>
        <p>Integrantes: {integrantes}</p>
        <p>Monto: ${monto}</p>
        <p>Periodo: cada {periodo} días.</p>
      </div>
    </div>
  );
}

export default Card;
