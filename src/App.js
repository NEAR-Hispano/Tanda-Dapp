import 'regenerator-runtime/runtime'
import React from 'react'
import { login, logout } from './utils'
import './global.css'
import { Layout, Menu, Breadcrumb, Card, Col, Row, Carousel, Button, Tag, Divider, Avatar, Tabs } from 'antd';

import { LoginOutlined, LogoutOutlined, CheckCircleOutlined, MinusCircleOutlined, UserOutlined } from '@ant-design/icons';
import 'antd/dist/antd.css';
import { Periodos } from './utils/enums';
const { Header, Content, Footer } = Layout;

import getConfig from './config';


import { TandaCardMap } from './components/TandaCardMap';
import { Bienvenida } from './components/Bienvenida';
import { Encabezado } from './components/Encabezado';
import { PieDePagina } from './components/PieDePagina';

const { TabPane } = Tabs;
const { networkId } = getConfig(process.env.NODE_ENV || 'development')

export default function App() {
  // Utilizando ReactHooks para almacenar las tandas en el componente state
  const [tandas, setTanda] = React.useState([])

  // The useEffect hook can be used to fire side-effects during render
  // Learn more: https://reactjs.org/docs/hooks-intro.htmL
  React.useEffect(
    () => {
      // in this case, we only care to query the contract when signed in
      if (window.walletConnection.isSignedIn()) {

        // window.contract is set by initContract in index.js
        window.contract.consultarTandas({})
          .then(tandaContrato => {
            tandaContrato.map(item => {
              setTanda(tandas => [...tandas, item]);
            });
          })
      }
    },
    // The second argument to useEffect tells React when to re-run the effect
    // Use an empty array to specify "only run on first render"
    // This works because signing into NEAR Wallet reloads the page
    []
  );

  // Si no esta iniciada la sesión, mostrar el componente de Bienvenida
  if (!window.walletConnection.isSignedIn()) {
    return <Bienvenida/>
  }
 //https://miro.medium.com/fit/c/262/262/1*uE2OBeUrGj5ut1jr_Z5pYA.png
  return (
    // use React Fragment, <>, to avoid wrapping elements in unnecessary divs
    <>
      <Encabezado/>
      
      
      <Layout className="layout" style={{background:'#bfc9d8'}}>
        <h1>Tandem DApp</h1>
        <Tabs type="card" style={{ margin: '1em' }}>
          <TabPane tab="Tandas" key="1">
            <TandaCardMap tandas={tandas} />
          </TabPane>
          <TabPane tab="Mis Tandas" key="2">
            <p>Content of Tab Pane 2</p>
            <p>Content of Tab Pane 2</p>
            <p>Content of Tab Pane 2</p>
          </TabPane>
        </Tabs>        
      </Layout>
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
