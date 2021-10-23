import React, { useState, useEffect } from 'react';
import {  Card, Col, Tag, Button, Skeleton } from 'antd';
import 'antd/dist/antd.css';
import { TandaModal } from './TandaModal';

export const TandaCardSkeleton = (i) => {

    return (
        <Col >
            <Card id={`card_${i}`} hoverable title={'Cargando...'} bordered={true} style={{ width: '300px', margin: 16, textAlign: 'left' }} >
                <Skeleton paragraph={{ rows: 2 }}/>
                <span style={{display: 'flex', alignItems: 'left'}}><Skeleton.Button/></span>
            </Card>
        </Col>
    )
}
