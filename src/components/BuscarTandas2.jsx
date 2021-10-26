import React, { useState, useEffect } from 'react';
import { TandaCardMap } from './TandaCardMap';
import { TandaCardMapSkeleton } from './TandaCardMapSkeleton'
import { SearchOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import { BOATLOAD_OF_GAS } from '../utils/enums';

//Recibimos un parámetro para ver desde donde se llamó la función.
function BuscarTandas2({origen}){
    
    //Hook para guardar tanto el arreglo de tandas cómo lo que esté en la búsqueda
    const [tandaInfo, setTandaInfo] = useState({tandas: [], campoBusqueda: '', misTandas: false});

    //Hook para guardar las tandas filtradas
    const [tandasFiltradas, setTandasFiltradas] = useState([])

    //Este useEffect se ejecuta UNA vez, cuando se acabe de cargar toda la página
    //Lo único que hacemos es traernos todas las tandas.
    useEffect(
        () => {
            //Si está hecha la conexión...
            if (window.walletConnection.isSignedIn()) {
                //Evaluamos desde donde se llamó esta ventana
                //Si es de la vista principal, va a mostrar toda las tandas.
                if(origen === 'principal'){
                    //Llamamos al contrato para consultar las Tandas existentes
                    window.contract.consultarTandas({})
                    //Y actualizamos el estado
                    .then(listaTandas => { setTandaInfo({...tandaInfo, tandas: listaTandas, misTandas: false})})
                }
                //Si es de la vista de Mis Tandas, solo mostramos nuestras tandas.
                else if (origen === 'mis-tandas'){
                    window.contract.consultarTandasInscritas({})
                    .then(listaTandas => { setTandaInfo({...tandaInfo, tandas: listaTandas, misTandas: true})})
                }
                else if (origen === 'administrar-tandas'){
                    window.contract.consultarTandasCreadas({})
                    .then(listaTandas => { setTandaInfo({...tandaInfo, tandas: listaTandas})})
                }
                
            }
        },
        []
    )

    //Este useEffect se ejecuta CADA que el campo de búsqueda cambia
    useEffect(
        () => {
            //Lo único que hacemos es filtrar las tandas que contengan la búsqueda
            const tandasFiltradas = tandaInfo.tandas.filter(tanda =>{return tanda.nombre.toLowerCase().includes(tandaInfo.campoBusqueda.toLowerCase());})
            //Y las guardamos en el estado
            setTandasFiltradas(tandasFiltradas)
        },
        //Esto es lo que indica que se ejecutará cada que cambie la búsqueda
        [tandaInfo.campoBusqueda]
    )

    //UseEffect para mostrar el esqueleto
    useEffect(
        () => {
            if(tandaInfo.tandas.length > 0){
                setTandasCargadas(true)
            }
        },
        [tandaInfo.tandas]
    )

    const [tandasCargadas, setTandasCargadas] = useState(false)

    //Función que pasamos al Input, se ejecuta cada que su contenido cambia
    const onSearchChange = (event) => {
        //Guardamos el valor que se introdujo en el estado
        setTandaInfo({ ...tandaInfo, campoBusqueda: event.target.value })
        //Esto va a hacer que el useEffect de arriba se ejecute, lo que hará que se carguen las nuevas tandas
    }

    //Regresamos solo 2 componentes, nuestro Input y nuestro mapa de Tandas
    return(
        <>
        {/* Este es el Input para la búsqueda*/}
        <span>
            <SearchOutlined style={{margin: '5px'}} /><Input onChange={onSearchChange} placeholder={'Buscar tanda'} style={{width: '18em'}}/>
        </span>
        {/* TandaCardMap requiere un arreglo, vamos a evaluar cuál arreglo mandarle.
          * Si el campo de búsqueda está vacío, entonces mandamos las tandas completas, desde el estado.
          * Pero si no, entonces significa que hay tandas filtradas, y mandamos ese arreglo.
          * Todo esto es para que nos muestre todas las tandas si no hemos buscado nada.*/}
        {
            tandasCargadas ? <TandaCardMap origen={origen} tandas={tandaInfo.campoBusqueda === '' ? tandaInfo.tandas : tandasFiltradas} /> :
            <TandaCardMapSkeleton />
        }
        {/* <TandaCardMap origen={origen} tandas={tandaInfo.campoBusqueda === '' ? tandaInfo.tandas : tandasFiltradas} /> */}
        </>
    )
}

export default BuscarTandas2;