import React from 'react';
import { Form, Input, Button, Select, Layout } from 'antd';
import { BOATLOAD_OF_GAS } from '../utils/enums';
import 'antd/dist/antd.css';

const EditarTanda2 = ({match}) => {
  const [editarTandaForm] = Form.useForm();
  const [key, setKey] = React.useState();

  const onKeyChange = (e) => {
    setKey(e.target.value)
    console.log(e.target.value)
  }

  const onSearch = (values) => {
    window.contract.consultarTanda({ key: values.idTanda }, BOATLOAD_OF_GAS).
    then(info => {
      console.log(info)

      editarTandaForm.setFieldsValue({
        nombreTanda: info.nombre,
        numIntegrantes: info.numIntegrantes,
        monto: info.monto,
        periodo: 'quincenal'
      })
    })
  }

  const onFinish = (values) => {

    console.log('TANDA ID: ', match.params.id);
    window.contract.editarTanda({ 
      key: `${match.params.id}`.toString(),
      nombreTanda: values.nombreTanda,
      integrantes: parseInt(values.numIntegrantes,10).toFixed(),
      monto: `${values.monto}`,
      periodo: '15'
    }, BOATLOAD_OF_GAS).then(info =>{
      console.log(info)
    })
    
  }

  return (
    <>
    <Layout className="layout" style={{background:'#bfc9d8'}}>
      <h1>Tandem DApp</h1>
      <br/>
      <Form name="editarTanda" onFinish={onFinish} labelCol={{span: 8,}} wrapperCol={{span: 8,}}
            autoComplete="off" form={editarTandaForm}>
          <Form.Item label="Nombre Tanda" name="nombreTanda"
              rules={[{
                  required: true,
                  message: 'Introduce el nombre de la tanda',},]}>
              <Input placeholder={'Introduce el nombre de la tanda'}/>
          </Form.Item>

          <Form.Item label="Número de integrantes" name="numIntegrantes"
              rules={[{
                  required: true,
                  message: 'Introduce el número de integrantes',},]}>
              <Input placeholder={'Introduceel número de integrantes'} />
          </Form.Item>

          <Form.Item label="Monto" name="monto"
              rules={[{
                  required: true,
                  message: 'Introduce el monto a ahorrar',},]}>
              <Input placeholder={'Introduce el monto a ahorrar'}/>
          </Form.Item>

          <Form.Item label="Periodo" name="periodo" rules={[{required: true,},]}>
              <Select
              placeholder="Selecciona el periodo para ahorrar."
              allowClear>
                  <Select.Option value="semanal">Semanal</Select.Option>
                  <Select.Option value="quincenal">Quincenal</Select.Option>
                  <Select.Option value="mensual">Mensual</Select.Option>
              </Select>
          </Form.Item>
          <Form.Item wrapperCol={{
          offset: 8,
          span: 8,
        }}>
              <Button type="primary" htmlType="submit">Guardar</Button>
          </Form.Item>
      </Form> 
      </Layout>  
    </>
  );
}

export default EditarTanda2;