import React, { useEffect, useState } from 'react';
import { List, Typography, Divider, Layout, Button, Tree } from 'antd';
import { UserOutlined, FileDoneOutlined, CalendarOutlined} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { ONE_NEAR } from '../utils/enums';

function AdministrarTanda({ match }) {

  const [tandaInfo, setTandaInfo] = useState();
  const [nombreTanda, setNombretanda] = useState('')
  const [integrantesTanda, setIntegrantesTanda] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [periodos, setPeriodos] = useState([]);

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

          window.contract.consultarPagos().then(data => {
            setPagos(data)
          })

          window.contract.generarPeriodos().then(data => {
            setPeriodos(data)
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

  useEffect(
    () => {
        console.log(pagos)        
    },
    [pagos]
  )

  useEffect(
    () => {
        console.log(periodos)        
    },
    [periodos]
  )

  const dataPagos = pagos.map(item => {
    const integrantesId = Object.keys(item.value); 
    return integrantesId.map((id) => {
      const children = item.value[id].map((child, index) => {
        return {
          title: `${child.fechaPago} | ${child.monto/ONE_NEAR} NEAR`,
          key: `child_${id}${index}`,
          icon: <FileDoneOutlined />
        }
      });

      return {
        icon: <UserOutlined />,
        title: id,
        key: id,
        children
      };
    });
    
  });

  return (
    <>
    <Layout className="layout" style={{background:'#bfc9d8'}}>
      <Divider orientation="center"><h1 className='tc'>{nombreTanda}</h1></Divider>
      <div style={{ display: 'flex', justifyContent:'center'}}>
        <List 
          style={{background:'white', width: '25%'}}
          header={<div>
            <div style={{textAlign: 'center'}}><strong >Integrantes </strong></div>
            <div style={{textAlign: 'right'}}><strong >Total: {integrantesTanda.length}</strong></div>
          </div>}
          bordered
          dataSource={[0]}
          renderItem={item => (
            <List.Item>
              <Tree
                showIcon
                treeData={dataPagos[0]}
                defaultExpandAll 
              />,
            </List.Item>
          )}
        />  

        <List 
          style={{background:'white', width: '20%', marginLeft: '10em'}}
          header={<div><strong>Fechas de pago</strong></div>}
          bordered
          dataSource={integrantesTanda}
          renderItem={item => (
            <List.Item>
              <CalendarOutlined /> {item}
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