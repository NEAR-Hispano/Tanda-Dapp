import React, { useState, useEffect } from 'react';
import {  Card, Col, Tag } from 'antd';
import {  CheckCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import 'antd/dist/antd.css';
import { TandaModal } from './TandaModal';

export const TandaCard = ({tanda}) => {
    const [activa, setActiva] = useState(tanda.activa);

    return (
        <Col >
            <Card id={`card_${tanda.id}`} hoverable title={tanda.nombre} bordered={true} style={{ width: '300px', margin: 16, textAlign: 'left' }} >
                <b>Creador:</b> {tanda.creador} <br/>
                <b>Activa:</b> <Tag icon={activa ? <CheckCircleOutlined />: <MinusCircleOutlined />} color={activa ? "success" : "warning"}>{activa? 'Activa': 'Pendiente'}</Tag><br/>
                <TandaModal tanda={tanda} setActiva={setActiva} activa={activa} />
            </Card>
        </Col>
    )
}
