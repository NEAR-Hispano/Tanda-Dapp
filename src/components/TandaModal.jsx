import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Modal, Button, Tag, Spin } from 'antd';
import {  CheckCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { Periodos } from './../utils/enums';

export const TandaModal = ({tanda, setActiva, activa}) => {
    const [modal, contextHolder] = Modal.useModal();
    const [loading, setLoading] = useState(false);

    
    const handleActivar = () =>{
        setLoading(true);
        window.contract.cambiarEstadoTanda({key: tanda.id}).then((tandaActualizada) =>{
            tanda = {...tandaActualizada };
            setActiva(tanda.activa)
            setLoading(false);           
        });
        
    }

    const handleModal = () => {
        const config = {
            title: `${tanda.nombre}`,
            content: (
                <>
                <Spin spinning={loading} delay={500}>
                    <b>Intengrantes:</b> {tanda.numIntegrantes} <br/>
                    <b>Monto:</b> {tanda.monto} <br/>
                    <b>Fecha Inicio:</b> {tanda.fechaInicio} <br/>
                    <b>Fecha Fin:</b> {tanda.fechaFin} <br/>
                    <b>Activa:</b> <Tag icon={activa ? <CheckCircleOutlined />: <MinusCircleOutlined />} color={activa ? "success" : "warning"} onClick={handleActivar}>{activa? 'Activa': 'Pendiente'}</Tag><br/>
                    <b>Periodo:</b> {Periodos[tanda.periodo]} <br/>
                </Spin>  
                </>
            ),
        };
        console.log('STATUS ',loading);
        modal.confirm(config);
    }

    return (
        <>
            <Button type="primary" style={{marginLeft:'12em'}} onClick={handleModal} >Ver más</Button>
            {/* `contextHolder` should always under the context you want to access */}
            {contextHolder}
        </>
    )
}
