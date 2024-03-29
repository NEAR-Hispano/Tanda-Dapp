import React from 'react';
import Card from './Card';

const CardList = ({ tandas }) => {
  return (
    <div>
      {
        tandas.map((nombre, i) => {
          return (
              <Card
                key={tandas[i].id}
                id={tandas[i].id}
                nombre={tandas[i].nombre}
                integrantes={tandas[i].numIntegrantes}
                monto={tandas[i].monto}
                periodo={tandas[i].periodo}
                />
          );
        })
      }
    </div>
  );
}

export default CardList;