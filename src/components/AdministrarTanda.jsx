import React, { useEffect, useState } from 'react';
import { List, Layout, Button, Tree, Tooltip } from 'antd';
import { 
  UserOutlined, 
  FileDoneOutlined, 
  CalendarOutlined, 
  CheckCircleOutlined, 
  EditOutlined, 
  LoadingOutlined, 
  CloseCircleOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { ONE_NEAR, BOATLOAD_OF_GAS } from '../utils/enums';

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

          window.contract.generarPeriodos({key: match.params.id}).then(periodosLista => {
            if(periodosLista){
              const data = periodosLista.map((elemento, index) => { 
                  return `Turno ${index+1}: Del ${elemento.inicio} al ${elemento.final}`
                }
              );
              setPeriodos(data)
            }
            
            
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

  const tandaOnOff = () => {
    console.log('Tanda estatus: ', tandaInfo.activa);
    if(!tandaInfo.activa){ // Si la tanda esta activa, llamar al método de desactivar
      window.contract.activarTanda({
        key: tandaInfo.id
      }, BOATLOAD_OF_GAS).then(response => {
        console.log(response);
        console.log('La tanda ha sido activada');
      });
    }else{
      
      window.contract.cancelarTanda({
        key: tandaInfo.id
      }, BOATLOAD_OF_GAS).then(response => {
        console.log(response);
        console.log('La tanda ha sido desactivada');
      });
    }
  }
  

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
     
        <span style={{textAlign:'center'}}>
          <h1 className='tc'>{nombreTanda}</h1>
        </span>
        <span style={{textAlign:'right', marginRight:'2em'}}>
        <Tooltip title={tandaInfo && !tandaInfo.activa ? "Activar Tanda": "Cancelar Tanda"}>
          <Button shape="circle" icon={
            tandaInfo && !tandaInfo.activa ? 
            <CheckCircleOutlined style={{color: '#0BAD26' }} />: 
            <CloseCircleOutlined style={{color: '#C70039' }} />
          } style={{margin:'5px'}} onClick={tandaOnOff} /> 
        </Tooltip>
        <Link to={`/administrar-tanda/editar-tanda/${match.params.id}`}>
          <Tooltip title='Editar Tanda'>
            <Button shape="circle" icon={<EditOutlined />} style={{margin:'5px'}} /> 
          </Tooltip>
        </Link>
      </span>
      
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
          dataSource={periodos}
          renderItem={item => (
            <List.Item>
              <CalendarOutlined /> {item}
            </List.Item>
          )}
        />  
        
      </div><br/>   
    </Layout>
    </>
  );
}
export default AdministrarTanda;