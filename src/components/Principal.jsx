import React from 'react';
import { Layout, Tabs } from 'antd';

//Componentes
import BuscarTandas2 from './BuscarTandas2';
import CrearTanda from './CrearTanda';

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
          <BuscarTandas2 origen='mis-tandas'/>
        </TabPane>
        <TabPane tab="Administrar Tandas" key="3">
          <BuscarTandas2 origen='administrar-tandas'/>
        </TabPane>
        <TabPane tab="Crear Tanda" key="4">
          <CrearTanda/>
        </TabPane>
      </Tabs>        
    </Layout>
  );

}
export default Principal;