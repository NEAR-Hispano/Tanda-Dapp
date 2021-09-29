import React from 'react';
import './App.css';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

//Components
import AdministrarTanda from './components/AdministrarTanda';
import Bienvenida from './components/Bienvenida';
import BuscarTandas from './components/BuscarTandas';
import CrearTanda from './components/CrearTanda';
import EditarTanda from './components/EditarTanda';
import MisTandas from './components/MisTandas';
import Principal from './components/Principal';
import InfoTanda from './components/InfoTanda';
import SinSesion from './components/SinSesion';
import Nav from './components/Nav';

export default function App() {
  if (!window.walletConnection.isSignedIn()) {
    return (
      <div>
        <Nav />
        <h1 className='f1'>Tandem</h1>
        <SinSesion />
      </div>
      );
  }
  else{
    console.log("Esta sesión está iniciada correctamente.");
  }

  return (
    <Router>
      <div className='tc'>
        <Nav />
        <h1 className='f1'>Tandem</h1>
        <Switch>
          <Route path="/" exact component={Bienvenida}/>
          <Route path="/crear-tanda" component={CrearTanda}/>
          <Route path="/buscar-tandas" exact component={BuscarTandas}/>
          <Route path="/buscar-tandas/:id" component={InfoTanda}/>
          <Route path="/editar-tanda" component={EditarTanda}/>
        </Switch>
      </div>
    </Router>
  );
}
