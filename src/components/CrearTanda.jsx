import React, { useState } from 'react';
import { Form, Input, Button, Select } from 'antd';
import 'antd/dist/antd.css';

//Componentes
import Notificacion from './Notificacion';

const CrearTanda = () => {

    //Hooks
    //Este es para decidir si se mostrará o no la notificación
    const [mostrarNotificacion, setMostrarNotificacion] = useState(false)
    
    //Este es para deshabilitar componentes si se hizo alguna llamada al método
    const [cargandoForma, setCargandoForma] = useState(false)

    //Y este es para poder resetear los valores de la forma.
    const [crearTandaForm] = Form.useForm();

    //Este método se llama cuando hacemos click al botón de Crear Tanda
    const onFinish = values => {

        //Lo primero que hacemos es decirle que la forma se está cargando.
        setCargandoForma(true)

        //E intentamos:
        try {
            //Si tenemos una sesión iniciada...
            if (window.walletConnection.isSignedIn()) {
                //Llamamos al método crearTanda
                window.contract.crearTanda({ 
                    //y enviamos los parámetros de la forma,
                    //accesando a ellos con 'values' que definimos en los parametros de la funcion
                    nombreTanda: values.nombreTanda,
                    integrantes: `${values.numIntegrantes}`,
                    monto: `${values.monto}`,
                    periodo: 15
                })
                //después de todo esto, comenzaremos a cambiar la forma
                .then(() => {
                    // Mostraremos la notificación
                    setMostrarNotificacion(true)

                    // Y ponemos un tiempo para que se desaparezca (en milisegundos)
                    setTimeout(() => {
                    setMostrarNotificacion(false)
                    }, 11000)
                    //Ponemos en falso que se esté cargando la forma
                    setCargandoForma(false)
                    //Y limpiamos la forma
                    crearTandaForm.resetFields();
                })
            }
        }
        // Si hubo algún error lo atrapamos 
        catch (e) {
            //Mandamos una alerta.
            //Por lo general, con que cierres tu sesión y la vuelvas a abrir se arregla.
            alert(
              '¡Algo salió mal! ' +
              '¿Talvez reinicia tu sesión? ' +
              'Revisa la consola para más información!!'
            )
            //Y lanzamos el error
            throw e
        }
    };

    //La forma que vamos a devolver.
    return (
        <>
        {/* Estamos utilizando las formas de la libería Ant Design (https://ant.design/)
          * Los parámetros que necesitamos configurar son:
          * name = El nombre de la tanda
          * onFinish = El método que se ejecutará al enviarla
          * form = Metemos toda la forma en un Hook
          */}
        <Form name="crearTanda" onFinish={onFinish} labelCol={{span: 8,}} wrapperCol={{span: 8,}}
        autoComplete="off" form={crearTandaForm}>
            {/* En cuanto a los items, se debe de incluir el nombre (name)
              * Y algunas reglas (rules), como si es un campo obligatorio (required)
              * y que mensaje enviará si no se llenó dicho campo.
              * Así como un valor temporal (placeholder).
              * Además, para controlar si están habilitadas o no, en la propiedad disabled
              * enviamos el valor del Hook cargandoForma.
              */}
            <Form.Item label="Nombre Tanda" name="nombreTanda"
                rules={[{
                    required: true,
                    message: 'Introduce el nombre de la tanda',},]}>
                <Input placeholder={'Introduce el nombre de la tanda'} disabled={cargandoForma}/>
            </Form.Item>

            <Form.Item label="Número de integrantes" name="numIntegrantes"
                rules={[{
                    required: true,
                    message: 'Introduce el número de integrantes',},]}>
                <Input placeholder={'Introduce el número de integrantes'} disabled={cargandoForma}/>
            </Form.Item>

            <Form.Item label="Monto" name="monto"
                rules={[{
                    required: true,
                    message: 'Introduce el monto a ahorrar',},]}>
                <Input placeholder={'Introduce el monto a ahorrar'} disabled={cargandoForma}/>
            </Form.Item>

            <Form.Item label="Periodo" name="periodo" rules={[{required: true,},]}>
                <Select
                placeholder="Selecciona el periodo para ahorrar."
                allowClear
                disabled={cargandoForma}>
                    <Select.Option value="semanal">Semanal</Select.Option>
                    <Select.Option value="quincenal">Quincenal</Select.Option>
                    <Select.Option value="mensual">Mensual</Select.Option>
                </Select>
            </Form.Item>
            <Form.Item wrapperCol={{ offset: 8, span: 8, }}>
                <Button type="primary" htmlType="submit" loading={cargandoForma}>Crear Tanda</Button>
            </Form.Item>
        </Form>
        {   /* Y algo de lógica para saber si se va a mostrar la notificación. */
            mostrarNotificacion && <Notificacion metodo='crearTanda'/>}
        </>
    );
}

export default CrearTanda;