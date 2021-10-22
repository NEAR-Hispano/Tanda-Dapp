import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Modal, Button, Tag, Spin, Select } from 'antd';
import {  CheckCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { Periodos } from './../utils/enums';
import { UnirseATanda } from './UnirseATanda';
import {PeriodosLista} from './PeriodosLista';

const { Option } = Select;

export const TandaModal = ({tanda, setActiva, activa, origen}) => {
    const [modal, contextHolder] = Modal.useModal();
    const [loading, setLoading] = useState(false);
    const [turno, setTurno] = useState(undefined);
    const [turno2, setTurno2] = useState(undefined);

    //Fancy console log
    useEffect(
        () => {
           setTurno2(turno)
        },
        [turno]
    )
    
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

        console.log(origen)
        const config = {
            title: `${tanda.nombre}`,
            content: (
                <>
                <Spin spinning={loading} delay={500}>
                    <b>Integrantes: </b> {tanda.numIntegrantes} <br/>
                    <b>Monto: </b> {tanda.monto} <br/>
                    <b>Fecha Inicio: </b> {tanda.fechaInicio} <br/>
                    <b>Fecha Fin: </b> {tanda.fechaFin} <br/>
                    <b>Activa: </b> <Tag 
                        icon={activa ? <CheckCircleOutlined />: <MinusCircleOutlined />} 
                        color={activa ? "success" : "default"} 
                        onClick={origen === 'administrar-tandas' ? handleActivar : null} 
                        style={{ cursor: 'pointer' }}>
                            {activa? 'Activa': 'Inactiva'}</Tag><br/>
                    <b>Periodo: </b> {Periodos[tanda.periodo]} <br/>
                    {origen === 'administrar-tandas' ? (
                        <Link to={`/administrar-tanda/${tanda.id}`}>
                            <Button type="primary">Administrar</Button> 
                        </Link>)
                        : null}
                    {origen === 'principal' ? 
                        <>
                        <b>Turnos disponibles: </b>
                        <PeriodosLista tanda={tanda} setTurno={setTurno}/> <br/> <br/>
                        <UnirseATanda tanda={tanda} turno={turno2}/> 
                        </>
                        : null}
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
