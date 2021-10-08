import React from 'react';
import { Row } from 'antd';
import 'antd/dist/antd.css';
import { TandaCard } from './TandaCard';

export const TandaCardMap = ({tandas, origen}) => {
    return (
        <div className="site-card-wrapper">
            <Row >
            { 
                tandas.map(tanda => <TandaCard key={tanda.id} tanda={tanda} origen={origen}/> )
            }
            </Row>
        </div>
    )
}
