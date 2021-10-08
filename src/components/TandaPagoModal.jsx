import React, { useEffect, useState } from 'react';
import { Modal, Button, Tag, Spin } from 'antd';
import {  CheckCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { Periodos } from '../utils/enums';
import moment from 'moment';

export const TandaPagoModal = ({tanda, setActiva, activa}) => {
    const [modal, contextHolder] = Modal.useModal();
    const [loading, setLoading] = useState(false);
    
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
        let integrantes = [];
        window.contract.consultarIntegrantes({key: tanda.id}).then(response => {
            integrantes = response;
        });

        const config = {
            title: `${tanda.nombre}`,
            content: (
                <>
                <Spin spinning={loading} delay={500}>
                    <b>Integrante hahahs:</b> {integrantes.length}/{tanda.numIntegrantes} <br/>
                    <b>Monto:</b> {tanda.monto} <br/>
                    <b>Fecha Inicio:</b> {tanda.fechaInicio} <br/>
                    <b>Fecha Fin:</b> {tanda.fechaFinal} <br/>
                    <b>Activa:</b> <Tag icon={activa ? <CheckCircleOutlined />: <MinusCircleOutlined />} color={activa ? "success" : "warning"} onClick={handleActivar}>{activa? 'Activa': 'Pendiente'}</Tag><br/>
                    <b>Periodo:</b> {Periodos[tanda.periodo]} <br/>
                </Spin>  
                </>
            ),
        };
        modal.confirm(config);
    }

    return (
        <>
            <Button type="primary" style={{marginLeft:'12em'}} onClick={handleModal} >Pagar</Button>
            {/* `contextHolder` should always under the context you want to access */}
            {contextHolder}
        </>
    )
}
