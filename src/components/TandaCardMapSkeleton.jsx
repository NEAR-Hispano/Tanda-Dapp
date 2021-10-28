import React from 'react';
import { Col } from 'antd';
import 'antd/dist/antd.css';
import { TandaCardSkeleton } from './TandaCardSkeleton';

export const TandaCardMapSkeleton = () => {
    
    return (
        <>
        <Col><TandaCardSkeleton/></Col>
        </>
    )
}