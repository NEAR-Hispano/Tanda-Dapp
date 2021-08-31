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
    integrantes: PersistentVector<Integrante>;
    
    constructor(nombre: string, num_integrantes: u64, monto: u64){
        this.id = math.randomBuffer(14).toString();
        this.nombre = nombre;
        this.num_integrantes = num_integrantes;
        this.monto = monto;
        this.integrantes = new PersistentVector<Integrante>("I");
    }

    agregarIntegrante(integrante: Integrante): void{
        this.integrantes.push(integrante);
    }
    
    consultarIntegrantes(): PersistentVector<Integrante>{
        return this.integrantes;
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


 export class Integrante {
    account_id: string;
    pagos: PersistentVector<Pago>;
    
    constructor(account_id: string){
        this.account_id =account_id;
        this.pagos =  new PersistentVector<Pago>("p");
    }
    
    agregarPago(pago: Pago): void{
        this.pagos.push(pago);
    }

    consultarPagos(): Array<Pago> {
        const numMessages = min(10, this.pagos.length);
        const startIndex = this.pagos.length - numMessages;
        const result = new Array<Pago>(numMessages);
        for(let i = 0; i < numMessages; i++) {
          result[i] = this.pagos[i + startIndex];
        }
        return result;
    }
}

export class Pago {
    tanda_id: string;
    monto: u128;
    fecha_inicio: string;

    constructor(tanda_id: string, monto: u128, fecha_inicio: string){
        this.tanda_id = tanda_id;
        this.monto = monto;
        this.fecha_inicio = fecha_inicio;
    }
}