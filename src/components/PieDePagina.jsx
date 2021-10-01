import React from 'react';
import { Layout } from 'antd';

import 'antd/dist/antd.css';

const { Footer } = Layout;

export const PieDePagina = () => {
    return (
        <Footer style={{ textAlign: 'center' }}>
          Tandem ©2021 Created by EDU Near | 
          <img style={{ width:'7%'}} src={'https://www.nearhispano.org/assets/img/near-hispano-logo.png'}></img>
        </Footer>
    )
}
