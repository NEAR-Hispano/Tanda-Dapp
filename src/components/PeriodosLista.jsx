import React, { useState, useEffect } from 'react';
import { Select } from 'antd';

const { Option } = Select;

export const PeriodosLista = ({tanda, setTurno}) => {
    
    const [periodos, setPeriodos] = useState([])

    //Cargamos los periodos cuando se cargue el modal
    useEffect(
        () => {
            if (window.walletConnection.isSignedIn()) {
                window.contract.consultarPeriodos({key: tanda.id})
                .then(listaPeriodos => { setPeriodos(listaPeriodos)})
            }
        },
        []
    )

    const handlePeriodo = (valor) => {
        setTurno(parseInt(valor.value) + 1)
    }

    return (
        <Select
            labelInValue
            defaultValue={{ value: 'Selecciona...' }}
            style={{ width: 120 }}
            onChange={handlePeriodo}
        >
            { // Mapeamos los turnos que no esten ocupados, es decir que no tengan un usuarioTurno asignado
                Object.keys(periodos).map((key) => 
                    periodos[key] && !periodos[key].usuarioTurno ?
                        <Option key={`turno_${key}`} value={`${key}`}>Turno {parseInt(key)+1}</Option> : undefined
                )
            }
        </Select>
    )
}
