import React from 'react';
import {  Card, Col, Tag } from 'antd';
import {  CheckCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import 'antd/dist/antd.css';
import { Periodos } from './../utils/enums';

export const TandaCard = ({tanda}) => {

    const handleClick = (e, props) => {
        console.log('CLICK CARD ', tanda.id);
    }

    return (
        <Col >
            <Card key={tanda.id} hoverable title={tanda.nombre} bordered={true} style={{ width: '300px', margin: 16 }} onClick={handleClick} >
                <b>Intengrantes:</b> {tanda.numIntegrantes} <br/>
                <b>Monto:</b> {tanda.monto} <br/>
                <b>Fecha Inicio:</b> {tanda.fechaInicio} <br/>
                <b>Fecha Fin:</b> {tanda.fechaFin} <br/>
                <b>Activa:</b> <Tag icon={tanda.activa ? <CheckCircleOutlined />: <MinusCircleOutlined />} color={tanda.activa ? "success" : "warning"}>{tanda.activa? 'Activa': 'Pendiente'}</Tag><br/>
                <b>Periodo:</b> {Periodos[tanda.periodo]} <br/>
            </Card>
        </Col>
    )
}
