import React from 'react';
import CardList from '../components/CardList';
import SearchBox from '../components/SearchBox';
import Scroll from '../components/Scroll';
import { BOATLOAD_OF_GAS } from '../utils/enums';

class BuscarTandas extends React.Component {

  constructor() {
    var tandasArray = [];
    window.contract.consultarTandas({}, BOATLOAD_OF_GAS)
    .then(listaTandas => {
      listaTandas.map(item => {
        tandasArray.push(item);
      });
    });
    super()
    this.state = {
      tandas: tandasArray,
      campoBusqueda: ''
    };
  }

  onSearchChange = (event) => {
    this.setState({ campoBusqueda: event.target.value });
  }

  render() {
    const { tandas, campoBusqueda } = this.state;
    const tandasFiltradas = tandas.filter(tanda =>{
      return tanda.nombre.toLowerCase().includes(campoBusqueda.toLowerCase());
    })
    return (
        <div className='tc'>
          <SearchBox searchChange={this.onSearchChange}/>
          <Scroll>
            <CardList tandas={tandasFiltradas} />
          </Scroll>
        </div>
      );
  }
}

export default BuscarTandas;
