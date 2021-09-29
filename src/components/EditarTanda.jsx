import React from 'react';
import { Form, Input, Button, Select } from 'antd';
import 'antd/dist/antd.css';

const EditarTanda = () => {
  const [editarTandaForm] = Form.useForm();
  const [key, setKey] = React.useState();

  const onKeyChange = (e) => {
    setKey(e.target.value)
    console.log(e.target.value)
  }

  const onSearch = (values) => {
    window.contract.consultarTanda({ key: values.idTanda }).
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

    window.contract.editarTanda({ 
      key: key.toString(),
      nombreTanda: values.nombreTanda,
      integrantes: parseInt(values.numIntegrantes,10),
      monto: `${values.monto}`,
      periodo: '15'
    }).then(info =>{
      console.log(info)
    })
    
  }

  return (
    <>
      <Form name="buscarTanda" labelCol={{span: 8,}} autoComplete="off" wrapperCol={{span: 8}}
        onFinish={onSearch}>
        <Form.Item label="ID Tanda" name="idTanda"
            rules={[{
              required: true,
              message: 'Introduce el ID a consultar',},]}>
          <Input onChange={onKeyChange}/>
        </Form.Item>
        <Form.Item wrapperCol={{span: 8, offset: 8}}>
          <Button type="primary" htmlType="submit">Buscar Tanda</Button>
        </Form.Item>
      </Form>
      <br/>

      <Form name="editarTanda" onFinish={onFinish} labelCol={{span: 8,}} wrapperCol={{span: 8,}}
            autoComplete="off" form={editarTandaForm}>
          <Form.Item label="Nombre Tanda" name="nombreTanda"
              rules={[{
                  required: true,
                  message: 'Introduce el nombre de la tanda',},]}>
              <Input />
          </Form.Item>

          <Form.Item label="Número de integrantes" name="numIntegrantes"
              rules={[{
                  required: true,
                  message: 'Introduce el número de integrantes',},]}>
              <Input />
          </Form.Item>

          <Form.Item label="Monto" name="monto"
              rules={[{
                  required: true,
                  message: 'Introduce el monto a ahorrar',},]}>
              <Input />
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
    </>
  );
}

export default EditarTanda;