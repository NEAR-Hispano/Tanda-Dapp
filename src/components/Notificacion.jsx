import React from 'react';

import getConfig from '../config'
const { networkId } = getConfig(process.env.NODE_ENV || 'development')

function Notificacion({ metodo }) {

    const urlPrefix = `https://explorer.${networkId}.near.org/accounts`
    return (
      <aside>
        <a target="_blank" rel="noreferrer" href={`${urlPrefix}/${window.accountId}`}>
          {window.accountId}
        </a>
        {' '}
        llamó al método: '{metodo}' en el contrato:
        {' '}
        <a target="_blank" rel="noreferrer" href={`${urlPrefix}/${window.contract.contractId}`}>
          {window.contract.contractId}
        </a>
        <footer>
          <div>✔ Exitoso</div>
          <div>Justo ahora</div>
        </footer>
      </aside>
    )
  }

  export default Notificacion;