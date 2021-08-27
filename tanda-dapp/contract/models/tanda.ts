import { context, u128, PersistentVector } from "near-sdk-as";

/**
 * Exportando la clase Tanda para poder utilizarla desde otros archivos
 */
@nearBindgen
export class Tanda {
    nombre: string;
    num_integrantes: u64;
    monto: u64;
    
    constructor(nombre: string, num_integrantes: u64, monto: u64){
        this.nombre = nombre;
        this.num_integrantes = num_integrantes;
        this.monto = monto;
    }
    
}

/**
 * PersistentVector es una colección persistente de almacenamiento.
 * Todos los cambios que se realicen sobre esta colección serán guardados automáticamente.
 * El parámetro del constructos necesita un valor unico, este será utilizado
 * como prefijo de todas las keys solicitadas en el almacenamiento de los datos en el storage
 */
 export const tandas = new PersistentVector<Tanda>("m");
