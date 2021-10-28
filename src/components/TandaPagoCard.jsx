import React, { useState, useEffect } from 'react';
import {  Card, Col, Tag } from 'antd';
import {  CheckCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import 'antd/dist/antd.css';
import { TandaPagoModal } from './TandaPagoModal';
import moment from 'moment';

export const TandaPagoCard = ({tanda}) => {
    const [activa, setActiva] = useState(tanda.activa);

    const diferenciaDias = (fechaFin) => {
        return moment.duration(moment().diff(moment(fechaFin))).asDays();
    }

    return (
        <Col >
            <Card id={`card_${tanda.id}`} hoverable title={tanda.nombre} bordered={true} style={{ width: '300px', margin: 16, textAlign: 'left' }} >
                <b>ID Tanda:</b> {tanda.id} <br/>
                <b>Creador:</b> {tanda.creador} <br/>
                <b>Monto:</b> {tanda.monto} NEAR<br/>
                <b>Estado:</b> <Tag icon={activa ? <CheckCircleOutlined />: <MinusCircleOutlined />} color={activa ? "success" : "default"}>{activa? 'Activa': 'Inactiva'}</Tag><br/>
                {
                   <TandaPagoModal tanda={tanda} setActiva={setActiva} activa={activa} />
                }
                
            </Card>
        </Col>
    )
}
