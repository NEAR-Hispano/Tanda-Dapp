import React from 'react';
import { Row } from 'antd';
import 'antd/dist/antd.css';
import { TandaCard } from './TandaCard';

export const TandaCardMap = ({tandas}) => {
    return (
        <div className="site-card-wrapper">
            <Row >
            { 
                tandas.map(tanda => <TandaCard tanda={tanda} /> )
            }
            </Row>
        </div>
    )
}
