import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Modal, Button, Tag, Spin } from 'antd';
import {  CheckCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { Periodos } from './../utils/enums';

export const UnirseATanda = ({tanda}) => {
    const [modal, contextHolder] = Modal.useModal();
    const [loading, setLoading] = useState(false);

    const unirATanda = () => {
        setLoading(true)

        try{
            window.contract.agregarIntegrante({key: tanda.id})
            .then(() => {setLoading(false)})
        }
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
        
    }

    const handleModal = () => {
        const config = {
            title: `¡Precaución ${window.accountId}!`,
            content: (
                <>
                <p>
                    Una vez unido a una tanda no hay forma de salir. El propietario de la
                    tanda no puede eliminar usuarios ni cancelar la Tanda.
                </p>
                <p>
                    Al unirte, aceptas que enviarás {tanda.monto} cada {tanda.periodo} días,
                    siendo puntual en tus pagos.
                </p>
                <br/>
                <p>
                    ¿Deseas unirte a {tanda.nombre}?
                </p>  
                </>
            ),
            onOk() {
                unirATanda(tanda);
            },
            onCancel() {
            },
        };
        
        modal.confirm(config);
    }

    return (
        <>      
            <Button type="primary" onClick={handleModal} loading={loading}>Unirse</Button>
            {/* `contextHolder` should always under the context you want to access */}
            {contextHolder}
        </>
    )
}