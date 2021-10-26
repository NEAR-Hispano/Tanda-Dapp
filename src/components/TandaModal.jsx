import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Modal, Button, Tag, Spin, Select } from 'antd';
import {  CheckCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { Periodos } from './../utils/enums';
import { UnirseATanda } from './UnirseATanda';
import {PeriodosLista} from './PeriodosLista';
import { BOATLOAD_OF_GAS } from '../utils/enums';

export const TandaModal = ({tanda, setActiva, activa, origen}) => {
    const [modal, contextHolder] = Modal.useModal();
    const [loading, setLoading] = useState(false);
    const [turno, setTurno] = useState();

    const [aceptarUnirse, setAceptarUnirse] = useState(false)

    useEffect(
        () => {
           if(aceptarUnirse){
            unirATanda()
           }
        },
        [aceptarUnirse]
    )


    const [unido, setUnido] = useState(false);

    const unirATanda = () => {

        try{
            window.contract.agregarIntegrante({key: tanda.id}, BOATLOAD_OF_GAS)
            .then(() => {setUnido(true)})
        }
        catch (e) {
            //Mandamos una alerta.
            //Por lo general, con que cierres tu sesión y la vuelvas a abrir se arregla.
            alert(
              '¡Algo salió mal! ' +
              '¿Talvez reinicia tu sesión? ' +
              'Revisa la consola para más información!!'
            )
            //Y lanzamos el error
            throw e
        }
        
    }

    useEffect(
        () => {
            if (window.walletConnection.isSignedIn() && unido==true) {
                window.contract.escogerTurno({key: tanda.id, numTurno: `${parseInt(turno)}`}, BOATLOAD_OF_GAS)
                .then(() => {setLoading(false)})
            }
        },
        [unido]
    )

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
                    <b>Integrantes: </b> {tanda.numIntegrantes} <br/>
                    <b>Monto: </b> {tanda.monto} <br/>
                    <b>Fecha Inicio: </b> {tanda.fechaInicio} <br/>
                    <b>Fecha Fin: </b> {tanda.fechaFin} <br/>
                    <b>Activa: </b> <Tag 
                        icon={activa ? <CheckCircleOutlined />: <MinusCircleOutlined />} 
                        color={activa ? "success" : "default"} 
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
                        <UnirseATanda tanda={tanda} setAceptarUnirse={setAceptarUnirse}/> 
                        </>
                        : null}
                </Spin>  
                </>
            ),
        };
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
