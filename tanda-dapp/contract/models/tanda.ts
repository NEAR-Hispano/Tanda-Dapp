import { context, u128, PersistentMap, PersistentVector, math } from "near-sdk-as";

/**
 * Exportando la clase Tanda para poder utilizarla desde otros archivos
 */
@nearBindgen
export class Tanda {
    id: string;
    nombre: string;
    num_integrantes: u64;
    monto: u64;
    
    constructor(nombre: string, num_integrantes: u64, monto: u64){
        this.id = math.randomBuffer(14).toString();
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
 export const tandas = new PersistentMap<string, Tanda>("m");
 export const keys = new PersistentVector<string>("k");
