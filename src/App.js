import 'regenerator-runtime/runtime'
import React from 'react'
import { login, logout } from './utils'
import './global.css'
import { Layout, Menu, Breadcrumb, Card, Col, Row, Carousel, Button } from 'antd';
import { LoginOutlined, LogoutOutlined } from '@ant-design/icons';
import 'antd/dist/antd.css';

const { Header, Content, Footer } = Layout;

import getConfig from './config'
const { networkId } = getConfig(process.env.NODE_ENV || 'development')

export default function App() {
  // Utilizando ReactHooks para almacenar las tandas en el componente state
  const [tandas, setTanda] = React.useState([])

  // after submitting the form, we want to show Notification
  const [showNotification, setShowNotification] = React.useState(false)

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

  // if not signed in, return early with sign-in prompt
  if (!window.walletConnection.isSignedIn()) {
    const contentStyle = {
      height: '500px',
      width:'100%',
      color: '#fff',
      textAlign: 'center',
    };
    return (
      <>
      <p style={{ textAlign: 'right', marginTop: '2.5em',  marginRight: '1em' }}>
        <Button  type="primary"  shape="round" ghost icon={<LoginOutlined />} onClick={login}>Iniciar sesión</Button>
      </p>
       
      <h1>Tandem DApp</h1>
      <Layout className="layout" style={{background:'#bfc9d8'}}>
        
        <Carousel>
            <div >
              <h3 style={{...contentStyle,  backgroundImage: `url("https://image.flaticon.com/icons/png/512/1254/1254755.png")`}}></h3>
            </div>
            <div>
              <h3 style={{...contentStyle,  backgroundImage: `url("https://www.mejor-banco.com/wp-content/uploads/2019/01/horrar-dinerco.png")`}}></h3>
            </div>
            <div>
              <h3 style={{...contentStyle,  backgroundImage: `url("https://files.consumerfinance.gov/f/images/bcfp_prepararse-blog-3_blog-header.original.png")`}}></h3>
            </div>
            <div>
              <h3 style={{...contentStyle,  backgroundImage: `url("https://s3.amazonaws.com/businessinsider.mx/wp-content/uploads/2021/06/24152825/invertir-ahorrar-1280x620.png")`}}></h3>
            </div>
          </Carousel>
        <Footer style={{ textAlign: 'center' }}>
          Tandem ©2021 Created by EDU Near | 
          <img style={{ width:'7%'}} src={'https://www.nearhispano.org/assets/img/near-hispano-logo.png'}></img>
        
        </Footer>
      </Layout>
      </>
    )
  }
 //https://miro.medium.com/fit/c/262/262/1*uE2OBeUrGj5ut1jr_Z5pYA.png
  return (
    // use React Fragment, <>, to avoid wrapping elements in unnecessary divs
    <>
      <p style={{ textAlign: 'right', marginTop: '2.5em',  marginRight: '1em' }}>
        <Button  type="primary"  shape="round" ghost icon={<LogoutOutlined />} onClick={logout}>Cerrar sesión</Button>
      </p>

      <h1>Tandem DApp</h1>
      <Layout className="layout" style={{background:'#bfc9d8'}}>
        <h1>
          {' '/* React trims whitespace around tags; insert literal space character when needed */}
          {window.accountId}!
        </h1>
        <div >
          <div className="site-card-wrapper">
              <Row gutter={16}>
              { tandas.map(tanda => 
                    <Col span={8}>
                      <Card hoverable title={tanda.nombre} bordered={true}>
                        Intengrantes: {tanda.numIntegrantes} <br/>
                        Monto: {tanda.monto} <br/>
                        Fecha Inicio: {tanda.fechaInicio} <br/>
                        Fecha Fin: {tanda.fechaFin} <br/>
                        Activa: {tanda.activa} <br/>
                        Periodo: {tanda.periodo} <br/>
                      </Card>
                    </Col>
                  )
              }
              </Row>
          </div>
        </div>
        <Footer style={{ textAlign: 'center' }}>
          Tandem ©2021 Created by EDU Near | 
          <img style={{ width:'7%'}} src={'https://www.nearhispano.org/assets/img/near-hispano-logo.png'}></img>
        
        </Footer>
      </Layout>

      {showNotification && <Notification />}
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
