import React from 'react';
import CardList from './components/CardList';
import SearchBox from './components/SearchBox';
import Scroll from './components/Scroll';
import './App.css';

class App extends React.Component {

  constructor() {
    var tandasArray = [];
    window.contract.consultarTandas({})
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

  componentDidMount() {  
    console.log(this.state.tandas);
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
          <h1 className='f1'>Tandem</h1>
          <SearchBox searchChange={this.onSearchChange}/>
          <Scroll>
            <CardList tandas={tandasFiltradas} />
          </Scroll>
        </div>
      );
  }
}

export default App;
