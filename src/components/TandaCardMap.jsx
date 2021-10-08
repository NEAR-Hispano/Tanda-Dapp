import React from 'react';
import { Row } from 'antd';
import 'antd/dist/antd.css';
import { TandaCard } from './TandaCard';
import { TandaPagoCard } from './TandaPagoCard';

export const TandaCardMap = ({tandas, misTandas}) => {
    return (
        <div className="site-card-wrapper">
            <Row >
            { 
                misTandas ? tandas.map(tanda => <TandaPagoCard key={tanda.id} tanda={tanda}/> ) :
                tandas.map(tanda => <TandaCard key={tanda.id} tanda={tanda} /> )
            }
            </Row>
        </div>
    )
}
