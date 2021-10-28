import React from 'react';
import { BOATLOAD_OF_GAS } from '../utils/enums';

const InfoTanda = ({ match }) => {
    const [infoTanda, setInfoTanda] = React.useState({
        activa: false,
        fechaFinal: null,
        fechaInicio: null,
        id: "Cargando...",
        monto: 0,
        nombre: "Cargando...",
        numIntegrantes: 0,
        periodo: 0
    })

    React.useEffect(
        () => {
            if (window.walletConnection.isSignedIn()) {
            window.contract.consultarTanda({ key: match.params.id }).then(info => {
                console.log(info);
                setInfoTanda({...infoTanda,
                    activa: info.activa,
                    fechaFinal: info.fechaFinal,
                    fechaInicio: info.fechaInicio,
                    id: info.id,
                    monto: info.monto,
                    nombre: info.nombre,
                    numIntegrantes: info.numIntegrantes,
                    periodo: info.periodo
                });
            });
            }
        },
        []
    )

    const activa = infoTanda.activa ? 
        <p>Esta Tanda se encuentra activa.</p> :
        <p>Esta Tanda no se encuentra activa.</p>;

    return (
        <div>
            <h1 className='f1'>Info Tanda</h1>
            <p>El nombre de nuestra tanda es: {infoTanda.nombre}</p>
            <p>El número de integrantes es: {infoTanda.numIntegrantes}</p>
            {activa}
            <p>En esta tanda se ahorrarán {infoTanda.monto} NEAR cada {infoTanda.periodo} días.</p>
        </div>
    );
}

export default InfoTanda;