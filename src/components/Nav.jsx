import React from 'react';
import { Link } from 'react-router-dom';

class Nav extends React.Component {
  render() {
    return (
        <nav>
            <h3>Logo</h3>
            <ul className="nav-links">
              <Link style={{color: 'white'}} to="/crear-tanda">
                <li>Crear Tanda</li>
              </Link> 
              <Link style={{color: 'white'}} to="/buscar-tandas">
                <li>Buscar Tandas</li>
              </Link> 
            </ul>
        </nav>
    );
  }
}
export default Nav;