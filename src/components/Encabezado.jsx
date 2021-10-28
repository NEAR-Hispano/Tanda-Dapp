import React from 'react';
import { logout } from './../utils';
import { Layout, Button, Avatar, Typography, Image } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import ImageLogo from '../assets/tandem.png';

import 'antd/dist/antd.css';

const { Text } = Typography;

const { Header } = Layout;

export const Encabezado = () => {
    return (
        <Header>
            <p style={{ textAlign: 'right', marginTop: '2.5em',  marginRight: '1em'}}>               
                <Avatar style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />} /> 
                <Text style={{color:'white', marginLeft:'0.5em', marginRight:'1em'}}>{window.accountId}!</Text>
                <Button  type="primary"  shape="round" ghost icon={<LogoutOutlined />} onClick={logout}>Cerrar sesión</Button>
            </p>
            <div>
                <Image width={100} src={ImageLogo} preview={false} style={{margin:'1.5em'}}/>
           </div>
        </Header>
    )
}
