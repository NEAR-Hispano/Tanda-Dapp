import React from 'react';
import { Skeleton, Col } from 'antd';
import 'antd/dist/antd.css';
import { TandaCardSkeleton } from './TandaCardSkeleton';
import { TandaPagoCard } from './TandaPagoCard';

export const TandaCardMapSkeleton = () => {
    
    return (
        <>
        <Col><TandaCardSkeleton/></Col>
        </>
    )
}