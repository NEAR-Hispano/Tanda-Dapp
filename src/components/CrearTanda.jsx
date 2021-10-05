import React from 'react';
import { Form, Input, Button, Select } from 'antd';
import 'antd/dist/antd.css';

const CrearTanda = () => {

    const onFinish = values => {

        if (window.walletConnection.isSignedIn()) {
                window.contract.crearTanda({ 
                    nombreTanda: values.nombreTanda,
                    integrantes: `${values.numIntegrantes}`,
                    monto: `${values.monto}`,
                    periodo: 15
                }).then(info => { console.log(info); 
            });
        }
    };

    return (
        <>
        <Form name="crearTanda" onFinish={onFinish} labelCol={{span: 8,}} wrapperCol={{span: 8,}}>
            <Form.Item label="Nombre Tanda" name="nombreTanda"
                rules={[{
                    required: true,
                    message: 'Introduce el nombre de la tanda',},]}>
                <Input placeholder={'Introduce el nombre de la tanda'} />
            </Form.Item>

            <Form.Item label="Número de integrantes" name="numIntegrantes"
                rules={[{
                    required: true,
                    message: 'Introduce el número de integrantes',},]}>
                <Input placeholder={'Introduce el número de integrantes'} />
            </Form.Item>

            <Form.Item label="Monto" name="monto"
                rules={[{
                    required: true,
                    message: 'Introduce el monto a ahorrar',},]}>
                <Input placeholder={'Introduce el monto a ahorrar'} />
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
                <Button type="primary" htmlType="submit">Crear Tanda</Button>
            </Form.Item>
        </Form>
        
        </>
    );
}
export default CrearTanda;