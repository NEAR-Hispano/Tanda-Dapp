import React from 'react';
import { login } from './../utils';
import { Layout, Carousel, Button } from 'antd';

import { LoginOutlined  } from '@ant-design/icons';
import 'antd/dist/antd.css';
import { PieDePagina } from './PieDePagina';
import Image from '../assets/tandem.png';

export const Bienvenida = () => {
    const contentStyle = {
        height: '29em',
        width:'100%',
        color: '#fff',
        textAlign: 'center',
      };
      return (
        <>
        <p style={{ textAlign: 'right', marginTop: '2.5em',  marginRight: '1em' }}>
          <Button  type="primary"  shape="round" ghost icon={<LoginOutlined />} onClick={login}>Iniciar sesión</Button>
        </p>
         
        <h1>Tandem DApp</h1>
        <Layout className="layout" style={{background:'#bfc9d8', width:'70%', marginLeft:'15%'}}>
          <Carousel autoplay>
              <div >
                <h3 style={{...contentStyle, height: '20em', backgroundImage: `url(${Image})`}} ></h3>
              </div>
              <div >
                <h3 style={{...contentStyle,  backgroundImage: `url("https://image.flaticon.com/icons/png/512/1254/1254755.png")`}}></h3>
              </div>
              <div>
                <h3 style={{...contentStyle,  backgroundImage: `url("https://www.mejor-banco.com/wp-content/uploads/2019/01/horrar-dinerco.png")`}}></h3>
              </div>
              <div>
                <h3 style={{...contentStyle,  backgroundImage: `url("https://files.consumerfinance.gov/f/images/bcfp_prepararse-blog-3_blog-header.original.png")`}}></h3>
              </div>
              <div>
                <h3 style={{...contentStyle,  backgroundImage: `url("https://s3.amazonaws.com/businessinsider.mx/wp-content/uploads/2021/06/24152825/invertir-ahorrar-1280x620.png")`}}></h3>
              </div>
            </Carousel>
        </Layout>
        <PieDePagina/>
        </>
      )
}
