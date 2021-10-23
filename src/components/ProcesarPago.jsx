import React, { useEffect, useState } from 'react'
import { utils } from 'near-api-js'
import { Layout } from 'antd';

const BOATLOAD_OF_GAS = 300000000000000;

export default function ProcesarPago({match}){

    const [tanda, setTanda] = useState(undefined)

    useEffect(
        () => {
            const a = localStorage.getItem('pagado')
            if(a == 'false'){
                localStorage.setItem('pagado',true)
                window.contract.consultarTanda({ key: match.params.id }).
                then(info => {
                    setTanda(info)
                })
            }
            else{
                window.close()
            }
        },
        []
    )

    useEffect(
        () => {
            if(typeof tanda !== "undefined"){

                window.contract.agregarIntegrantePago(
                    { // Definición de los argumentos del método
                        key: tanda.id
                    }, 
                    BOATLOAD_OF_GAS, // Añadimos una cantidad de GAS
                    utils.format.parseNearAmount(`${tanda.monto}`) // Conversion de la cantidad de un string numerico a near
                )
            }
        },
        [tanda]
    )

    return(
    <Layout className="layout" style={{background:'#bfc9d8'}}>
        <h1>Procesando Pago...</h1>
    </Layout>
    )
}