import React, { useEffect, useState } from 'react';
import { List, Typography, Divider, Layout, Button } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';


function AdministrarTanda({ match }) {

  const [tandaInfo, setTandaInfo] = useState();
  const [nombreTanda, setNombretanda] = useState('')
  const [integrantesTanda, setIntegrantesTanda] = useState([]);

  useEffect(
    () => {
        if (window.walletConnection.isSignedIn()) {
          window.contract.consultarTanda({key: match.params.id})
          .then(info => { 
            setTandaInfo(info)
            setNombretanda(info.nombre)
          })
          
          window.contract.consultarIntegrantes({key: match.params.id})
          .then(info => {
            setIntegrantesTanda(info)
          })
        }
    },
    []
  )
  // fancy console logs 
  useEffect(
    () => {
        console.log(tandaInfo)        
    },
    [tandaInfo]
  )

  useEffect(
    () => {
        console.log(integrantesTanda)        
    },
    [integrantesTanda]
  )

  return (
    <>
    <Layout className="layout" style={{background:'#bfc9d8'}}>
      <Divider orientation="center"><h1 className='tc'>{nombreTanda}</h1></Divider>
      <div style={{ display: 'flex', justifyContent:'center'}}>
        <List 
          style={{background:'white', width: '90%'}}
          header={<div><strong>Integrantes</strong></div>}
          bordered
          dataSource={integrantesTanda}
          renderItem={item => (
            <List.Item>
              <UserOutlined /> {item}
            </List.Item>
          )}
        />  
      </div>
      <br/>
      <Divider orientation="center"><h2>Editar / Activar</h2></Divider>
      <span>
        <Link to={`/algo`}>
          <Button type="primary" style={{ margin: '5%' }}>Activar Tanda</Button>
        </Link>
        <Link to={`/administrar-tanda/editar-tanda/${match.params.id}`}>
          <Button type="primary" style={{ margin: '5%' }}>Editar Tanda</Button>
        </Link>
      </span>
    </Layout>
    </>
  );
}
export default AdministrarTanda;