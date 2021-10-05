import React from 'react';
import { Layout, Tabs } from 'antd';

//Componentes
import BuscarTandas2 from './BuscarTandas2';
import CrearTanda from './CrearTanda';
import EditarTanda from './EditarTanda';


function Principal() {
  const { TabPane } = Tabs;

  return (
    <Layout className="layout" style={{background:'#bfc9d8'}}>
      <h1>Tandem DApp</h1>
      <Tabs type="card" style={{ margin: '1em' }}>
        <TabPane tab="Tandas" key="1">
          <div className='tc'>
            <BuscarTandas2 origen='principal'/>
          </div>
        </TabPane>
        <TabPane tab="Mis Tandas" key="2">
        <div className='tc'>
            <BuscarTandas2 origen='mis-tandas'/>
          </div>
        </TabPane>
        <TabPane tab="Crear Tanda" key="3">
          <CrearTanda/>
        </TabPane>
        <TabPane tab="Editar Tanda" key="4">
          <EditarTanda/>
        </TabPane>
      </Tabs>        
    </Layout>
  );

}
export default Principal;