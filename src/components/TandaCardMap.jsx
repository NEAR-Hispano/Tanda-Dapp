import React from 'react';
import { Row } from 'antd';
import 'antd/dist/antd.css';
import { TandaCard } from './TandaCard';
import { TandaPagoCard } from './TandaPagoCard';

export const TandaCardMap = ({tandas, origen}) => {
    return (
        <div className="site-card-wrapper">
            <Row >
            { 
                origen == 'mis-tandas' ? tandas.map(tanda => <TandaPagoCard key={tanda.id} tanda={tanda}/> ) :
                tandas.map(tanda => <TandaCard key={tanda.id} tanda={tanda} origen={origen}/> )
            }
            </Row>
        </div>
    )
}
