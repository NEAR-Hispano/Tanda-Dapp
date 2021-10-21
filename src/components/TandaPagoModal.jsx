import React, { useState } from 'react';
import { utils } from 'near-api-js'
import { Modal, Button } from 'antd';
import {  CheckCircleOutlined, StopOutlined } from '@ant-design/icons';
import moment from 'moment';

const BOATLOAD_OF_GAS = 300000000000000;

export const TandaPagoModal = ({tanda, setActiva, activa}) => {
    const [modal, contextHolder] = Modal.useModal();
    const [loading, setLoading] = useState(false);
    const [integrantePago, setIntegrantePago] = useState({});
    
    const handleModal = () => {
        if (tanda.activa) {
            const config = {
                title: `${tanda.nombre}`,
                content: (
                    <>
                        <CheckCircleOutlined style={{ fontSize: '100px', color: '#6aa84f', marginLeft: '30%'}} /> <br/><br/>
                        <b> SU PAGO DE {tanda.monto} NEAR SE REALIZÓ EXITOSAMENTE </b> <br/>
                        Fecha de pago: { moment().format('YYYY-MM-DD') }
                    </>
                ),
            };
            modal.success(config);
        
            
            window.contract.agregarIntegrantePago(
                { // Definición de los argumentos del método
                    key: tanda.id
                }, 
                BOATLOAD_OF_GAS, // Añadimos una cantidad de GAS
                utils.format.parseNearAmount(`${tanda.monto}`) // Conversion de la cantidad de un string numerico a near
            ).then(response => {
                setIntegrantePago(response);
            }); 
        } else {
            const config = {
                title: `${tanda.nombre}`,
                content: (
                    <>
                        <StopOutlined style={{ fontSize: '100px', color: '#900C3F', marginLeft: '30%'}} /> <br/><br/>
                        <b> AÚN NO SE PUEDE REALIZAR EL PAGO DE LA TANDA, YA QUE SE ENCUENTRA INACTIVADA</b> <br/>
                    </>
                ),
            };
            modal.error(config);
        }
    }

    return (
        <>
            <Button type="primary" style={{marginLeft:'12em'}} onClick={handleModal} >Pagar</Button>
            {/* `contextHolder` should always under the context you want to access */}
            {contextHolder}
        </>
    )
}
