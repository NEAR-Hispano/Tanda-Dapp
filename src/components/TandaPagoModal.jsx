import React, { useEffect, useState } from 'react';
import { Modal, Button, Tag, Spin } from 'antd';
import {  CheckCircleOutlined, StopOutlined } from '@ant-design/icons';
import { ONE_NEAR } from '../utils/enums';
import moment from 'moment';
import Big from 'big.js';

const BOATLOAD_OF_GAS = Big(3).times(10 ** 13).toFixed();

export const TandaPagoModal = ({tanda, setActiva, activa}) => {
    const [modal, contextHolder] = Modal.useModal();
    const [loading, setLoading] = useState(false);
    const [integrantePago, setIntegrantePago] = useState({});
    
    console.log('FECHA', moment().format('YYYY-MM-DD'));
    const handleActivar = () =>{
        setLoading(true);
        window.contract.cambiarEstadoTanda({key: tanda.id}).then((tandaActualizada) =>{
            tanda = {...tandaActualizada };
            setActiva(tanda.activa)
            setLoading(false);           
        });
    }

    const handleModal = () => {
        if (!tanda.activa) {
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
        
            
            console.log(tanda);
            window.contract.agregarIntegrantePago({ key: tanda.id}, BOATLOAD_OF_GAS,
                (new Big(1 || '0').times(10 ** 24).toFixed())).then(response => {
                //setIntegrantePago(response);
                console.log(response);
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
