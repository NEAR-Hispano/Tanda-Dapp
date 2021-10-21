import React from 'react';
import { Select } from 'antd';

const { Option } = Select;

export const PeriodosLista = ({periodos, setPeriodos}) => {
 
    const handlePeriodo = (valor) =>{
        setPeriodos({...periodos, turno:valor.value});
    }
    
    return (
        <Select
            labelInValue
            defaultValue={{ value: 'Selecciona turno' }}
            style={{ width: 120 }}
            onChange={handlePeriodo}
        >
            { // Mapeamos los turnos que no esten ocupados, es decir que no tengan un usuarioTurno asignado
                Object.keys(periodos.periodos).map((key) => 
                    periodos.periodos[key] && !periodos.periodos[key].usuarioTurno ?
                        <Option key={`turno_${key}`} value={`${key}`}>Turno {parseInt(key)+1}</Option> : undefined
                )
            }
        </Select>
    )
}
