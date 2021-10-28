import 'regenerator-runtime/runtime'
import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './global.css'
import 'antd/dist/antd.css';

import { Bienvenida } from './components/Bienvenida';
import { Encabezado } from './components/Encabezado';
import { PieDePagina } from './components/PieDePagina';

import EditarTanda2 from './components/EditarTanda2';
import Principal from './components/Principal';
import AdministrarTanda from './components/AdministrarTanda';
import ProcesarPago from './components/ProcesarPago'

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
          <Route exact path="/" component={Principal}/>
          <Route path="/administrar-tanda/editar-tanda/:id" component={EditarTanda2}/>
          <Route path="/administrar-tanda/:id" component={AdministrarTanda}/>
          <Route path="/pagar-tanda/:id" component={ProcesarPago}/>
        </Switch>
      </div>
      </Router>
      <PieDePagina/>
     
    </>
  )
}