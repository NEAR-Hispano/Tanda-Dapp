import React from 'react';
import { Form, Input, Button, Select, Layout, DatePicker } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import 'antd/dist/antd.css';
import moment from 'moment';

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

  const substraerFecha = (fecha) => {
    return moment(fecha).format('YYYY-MM-DD');
  }

  const onFinish = (values) => {
    window.contract.editarTanda({ 
      key: key.toString(),
      nombreTanda: values.nombreTanda,
      integrantes: values.numIntegrantes,
      monto: `${values.monto}`,
      periodo: '15',
      fechaInicio: substraerFecha(values.fechaInicio),
      fechaFin: substraerFecha(values.fechaFin),
    }).then(info =>{
      console.log(info)
    })
    
  }

  function onChange(date, dateString) {
    console.log(date, dateString);
  }

  return (
    <>
      <Layout className="layout" style={{background:'#bfc9d8'}}>

        <Form name="buscarTanda" labelCol={{span: 8,}} autoComplete="off" wrapperCol={{span: 8}}
        onFinish={onSearch}>
        <Form.Item label={<span><SearchOutlined style={{margin: '5px'}} />ID Tanda</span>} name="idTanda"
            rules={[{
              required: true,
              message: 'Introduce el ID a consultar',},]}>
          <Input onChange={onKeyChange} placeholder={'Buscar tanda'} style={{width: '30em'}}/>
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
              <Input placeholder={'Introduce el nombre de la tanda'} style={{width: '30em'}}/>
          </Form.Item>

          <Form.Item label="Número de integrantes" name="numIntegrantes"
              rules={[{
                  required: true,
                  message: 'Introduce el número de integrantes',},]}>
              <Input placeholder={'Introduceel número de integrantes'} style={{width: '30em'}} />
          </Form.Item>

          <Form.Item label="Monto" name="monto"
              rules={[{
                  required: true,
                  message: 'Introduce el monto a ahorrar',},]}>
              <Input placeholder={'Introduce el monto a ahorrar'} style={{width: '30em'}}/>
          </Form.Item>

          <Form.Item label="Periodo" name="periodo" rules={[{required: true,},]}>
              <Select
              placeholder="Selecciona el periodo para ahorrar."
              allowClear style={{width: '30em'}}>
                  <Select.Option value="semanal">Semanal</Select.Option>
                  <Select.Option value="quincenal">Quincenal</Select.Option>
                  <Select.Option value="mensual">Mensual</Select.Option>
              </Select>
          </Form.Item>

          <Form.Item label="Fecha Inicio" name="fechaInicio"
              rules={[{
                  required: false,
                  message: 'Introduce la fecha de inicio',},]}>
               <DatePicker onChange={onChange} style={{width: '30em'}}/>
          </Form.Item>

          <Form.Item label="Fecha Fin" name="fechaFin"
              rules={[{
                  required: false,
                  message: 'Introduce la fecha de fin',},]}>
               <DatePicker onChange={onChange} style={{width: '30em'}}/>
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

export default EditarTanda;