
import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'antd';

export const UnirseATanda = ({tanda, turno}) => {
    const [modal, contextHolder] = Modal.useModal();
    const [loading, setLoading] = useState(false);

    const [unido, setUnido] = useState(false);


    //Fancy console log
    useEffect(
        () => {
            console.log('from unirse'+turno)
        },
        [turno]
    )

    const unirATanda = () => {
        setLoading(true)
        console.log('turno: ' + turno)

        try{
            
            // window.contract.agregarIntegrante({key: tanda.id})
            // .then(() => {setUnido(true)})
            console.log('turno: ' + turno)
            setUnido(true)
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

    useEffect(
        () => {
            if (window.walletConnection.isSignedIn() && unido==true) {
                window.contract.escogerTurno({key: tanda.id, numTurno: `${parseInt(turno)}`})
                .then(() => {setLoading(false)})
            }
        },
        [unido]
    )

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
