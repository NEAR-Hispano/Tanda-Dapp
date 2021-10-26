
import React, { useState } from 'react';
import { Modal, Button } from 'antd';

export const UnirseATanda = ({tanda, setAceptarUnirse}) => {
    const [modal, contextHolder] = Modal.useModal();

    const [cargando, setCargando] = useState(false);

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
                    Al unirte, aceptas que enviarás {tanda.monto} NEAR cada {tanda.periodo} días,
                    siendo puntual en tus pagos.
                </p>
                <br/>
                <p>
                    ¿Deseas unirte a {tanda.nombre}?
                </p>  
                </>
            ),
            onOk() {
                setCargando(true)
                setAceptarUnirse(true);
            },
            onCancel() {
            },
        };
        
        modal.confirm(config);
    }

    return (
        <>      
            <Button type="primary" onClick={handleModal} loading={cargando}>Unirse</Button>
            {/* `contextHolder` should always under the context you want to access */}
            {contextHolder}
        </>
    )
}
