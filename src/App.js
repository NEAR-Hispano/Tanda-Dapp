import 'regenerator-runtime/runtime'
import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './global.css'
import 'antd/dist/antd.css';

import getConfig from './config';

import { Bienvenida } from './components/Bienvenida';
import { Encabezado } from './components/Encabezado';
import { PieDePagina } from './components/PieDePagina';

import BuscarTandas from './components/BuscarTandas';
import CrearTanda from './components/CrearTanda';
import EditarTanda from './components/EditarTanda';
import Principal from './components/Principal';
import InfoTanda from './components/InfoTanda';

const { networkId } = getConfig(process.env.NODE_ENV || 'development')

export default function App() {
  

  // Si no esta iniciada la sesión, mostrar el componente de Bienvenida
  if (!window.walletConnection.isSignedIn()) {
    return <Bienvenida/>
  }
  return (
    <>
      <Encabezado/>
      
      <Router>
      <div className='tc'>
        <Switch>
          <Route path="/" exact component={Principal}/>
          <Route path="/crear-tanda" component={CrearTanda}/>
          <Route path="/buscar-tandas" exact component={BuscarTandas}/>
          <Route path="/buscar-tandas/:id" component={InfoTanda}/>
          <Route path="/editar-tanda" component={EditarTanda}/>
        </Switch>
      </div>
      </Router>
      <PieDePagina/>
     
    </>
  )
}

// this component gets rendered by App after the form is submitted
function Notification() {
  const urlPrefix = `https://explorer.${networkId}.near.org/accounts`
  return (
    <aside>
      <a target="_blank" rel="noreferrer" href={`${urlPrefix}/${window.accountId}`}>
        {window.accountId}
      </a>
      {' '/* React trims whitespace around tags; insert literal space character when needed */}
      called method: 'setGreeting' in contract:
      {' '}
      <a target="_blank" rel="noreferrer" href={`${urlPrefix}/${window.contract.contractId}`}>
        {window.contract.contractId}
      </a>
      <footer>
        <div>✔ Succeeded</div>
        <div>Just now</div>
      </footer>
    </aside>
  )
}
