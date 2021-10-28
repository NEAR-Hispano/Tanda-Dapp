import React, { useEffect, useState } from 'react';
import { List, Layout, Button, Tree, Tooltip, notification } from 'antd';
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

import Notificacion from './Notificacion';

function AdministrarTanda({ match }) {

  const [tandaInfo, setTandaInfo] = useState();
  const [nombreTanda, setNombretanda] = useState('')
  const [integrantesTanda, setIntegrantesTanda] = useState([]);
  const [pagos, setPagos] = useState({});
  const [periodos, setPeriodos] = useState([]);
  const [estatusIcon, setEstatusIcon] = useState();

  const [periodoAPagar, setPeriodoAPagar] = useState(-2);
  const [mostrarNotificacion, setMostrarNotificacion] = useState(false)
  const [pagarLoading, setPagarLoading] = useState(false)

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

          window.contract.consultarTandaPagos({key: match.params.id}).then(data => {
            console.log('Received data:')
            console.log(data)
            setPagos(data)
          })

          window.contract.generarPeriodos({key: match.params.id}, BOATLOAD_OF_GAS).then(periodosLista => {
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
        setEstatusIcon(tandaInfo && !tandaInfo.activa ? 
          <CheckCircleOutlined style={{color: '#0BAD26' }} />: 
          <CloseCircleOutlined style={{color: '#C70039' }} />);       
    },
    [tandaInfo]
  )


  useEffect(
    () => {
      console.log('Pagos:')
      console.log(pagos)        
    },
    [pagos]
  )

  useEffect(
    () => {
      
      console.log(integrantesTanda)        
    },
    [integrantesTanda]
  )

  useEffect(
    () => {
        console.log(periodos)        
    },
    [periodos]
  )

  const openNotificationWithIcon = (type, title, description) => {
    notification[type]({
      message: title,
      description,
    });
  };

  const tandaOnOff = () => {
    setEstatusIcon(<LoadingOutlined/>);
    if(!tandaInfo.activa){ 
      window.contract.activarTanda({
        key: tandaInfo.id
      }, BOATLOAD_OF_GAS).then(() => {
        console.log('La tanda ha sido activada');
        setEstatusIcon(<CloseCircleOutlined style={{color: '#C70039' }} />);   
      }).catch((error) => {
        const errorResponse = {...error};
        setEstatusIcon(<CheckCircleOutlined style={{color: '#0BAD26' }} />);
        openNotificationWithIcon('error',`No se pudo activar la Tanda: ${tandaInfo.nombre}`, errorResponse.kind.ExecutionError.split(', filename:')[0]);

      });
    } else{
      window.contract.cancelarTanda({
        key: tandaInfo.id
      }, BOATLOAD_OF_GAS).then(() => {
        console.log('La tanda ha sido desactivada');
        setEstatusIcon(<CheckCircleOutlined style={{color: '#0BAD26' }} />);   
      }).catch((error) => {
        setEstatusIcon(<CloseCircleOutlined style={{color: '#C70039' }} />);
        const errorResponse = {...error};
        openNotificationWithIcon('error', `No se pudo desactivar la Tanda: ${tandaInfo.nombre}`, errorResponse.kind.ExecutionError.split(', filename:')[0]);
      });
    }
  }
  
  let dataPagos = [];
  if (pagos) {
    dataPagos = Object.keys(pagos).map(id => {
      const children = pagos[id].map((child, index) => {
        return {
          title: `${child.fechaPago} | ${child.monto/ONE_NEAR} NEAR`,
          key: `child_${id}${index}`,
          icon: <FileDoneOutlined />
        }
      })
      return {
        icon: <UserOutlined />,
        title: id,
        key: id,
        children
      };
    })
  }
  
  const pagarTanda = () => {
    setPagarLoading(true)
    window.contract.obtenerPeriodoAPagar({key: tandaInfo.id}).
    then(periodo => {
      setPeriodoAPagar(periodo)
    })
  }

  useEffect(
    () => {

      if(periodoAPagar == -1){
        openNotificationWithIcon('error', `No se pudo pagar la Tanda: ${tandaInfo.nombre}`, 'Esta Tanda ya fue pagada en su totalidad.');
      }
      else if(periodoAPagar == -2){
        console.log('Validando pago de Tanda...')
      }
      else if(periodoAPagar >= 0){
        window.contract.pagarTanda({key: tandaInfo.id, indice: periodoAPagar}).
            then(() => {
              setMostrarNotificacion(true)
            }).catch((error) => {
              const errorResponse = {...error};
              openNotificationWithIcon('error', `No se pudo pagar la Tanda: ${tandaInfo.nombre}`, errorResponse.kind.ExecutionError.split(', filename:')[0]);
            })
      }
      else{
        console.log('El periodo es:' + periodoAPagar)
      }
      setPagarLoading(false)
    },
    [periodoAPagar]
  )

  return (
    <>
    <Layout className="layout" style={{background:'#bfc9d8'}}>
     
        <span style={{textAlign:'center'}}>
          <h1 className='tc'>{nombreTanda}</h1>
        </span>
        <span style={{textAlign:'right', marginRight:'2em'}}>
          <Tooltip title={tandaInfo && !tandaInfo.activa ? "Activar Tanda": "Cancelar Tanda"}>
            <Button shape="circle" icon={estatusIcon } style={{margin:'5px'}} onClick={tandaOnOff} /> 
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
                treeData={dataPagos}
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
      <Button type="primary" onClick={pagarTanda} disabled={pagarLoading} loading={pagarLoading}>Pagar Tanda</Button>  
    </Layout>
    {mostrarNotificacion && <Notificacion metodo='pagarTanda'/>}
    </>
  );
}
export default AdministrarTanda;