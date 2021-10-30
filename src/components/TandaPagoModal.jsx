import React from 'react';
import { Modal, Button } from 'antd';
import { StopOutlined } from '@ant-design/icons';


export const TandaPagoModal = ({tanda}) => {
    const [modal, contextHolder] = Modal.useModal();

    const handleModal = () => {
        if (tanda.activa) {
            const config = {
                title: `${tanda.nombre}`,
                content: (
                    <>
                        <b> ES NECESARIO AUTORIZAR SU PAGO POR {tanda.monto} NEAR. </b> <br/>
                        Presiona OK para continuar...
                    </>
                ),
                onOk() { // Si el boton de OK es presionado
                    localStorage.setItem('pagado', false)
                    window.open(`/pagar-tanda/${tanda.id}`)
                },
                onCancel() { // Si el boton de Cancelar es presionado
                },
            };      
            modal.success(config);
            
        } else {
            const config = {
                title: `${tanda.nombre}`,
                content: (
                    <>
                        <StopOutlined style={{ fontSize: '100px', color: '#900C3F', marginLeft: '30%'}} /> <br/><br/>
                        <b> AÚN NO SE PUEDE REALIZAR EL PAGO DE LA TANDA, YA QUE SE ENCUENTRA INACTIVA</b> <br/>
                    </>
                ),
            };
            modal.error(config);
        }
    }

    return (
        <>
            <Button type="primary" style={{marginLeft:'12em'}} onClick={handleModal} >Pagar</Button>
            {/* `contextHolder` should always under the context you want to access */}
            {contextHolder}
        </>
    )
}


