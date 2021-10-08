import 'regenerator-runtime/runtime'
import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './global.css'
import 'antd/dist/antd.css';

import { Bienvenida } from './components/Bienvenida';
import { Encabezado } from './components/Encabezado';
import { PieDePagina } from './components/PieDePagina';

import EditarTanda from './components/EditarTanda';
import EditarTanda2 from './components/EditarTanda2';
import Principal from './components/Principal';

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
          <Route exact path="/editar-tanda" component={EditarTanda2}/>
        </Switch>
      </div>
      </Router>
      <PieDePagina/>
     
    </>
  )
}