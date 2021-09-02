import { context, u128, PersistentMap, PersistentVector, math, logging } from "near-sdk-as";

@nearBindgen
export class Tanda {
    id: string;
    nombre: string;
    num_integrantes: u64;
    monto: u64;
    fecha_inicio: string;
    fecha_final: string;
    activa: bool;
    periodo: u64;
    integrantes: PersistentVector<Integrante>;
    
    constructor(nombre: string, num_integrantes: u64, monto: u64, periodo: u64){
        this.id = context.blockIndex.toString();
        this.nombre = nombre;
        this.num_integrantes = num_integrantes;
        this.monto = monto;
        this.activa = false;
        this.periodo = periodo;
        this.integrantes = new PersistentVector<Integrante>("I");
    }

    agregarIntegrante(integrante: Integrante): void{
        this.integrantes.push(integrante);
        logging.log(`Integrante nuevo ${integrante.account_id}  agregado exitosamente`);
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

 //Creando tipo Periodo
 export const periodos = new Map<i32, string>();
 periodos.set(7, "Semanal");
 periodos.set(15, "Quincenal");
 periodos.set(30, "Mensual");

@nearBindgen
export class Integrante {
    public account_id: string;
    public pagos: PersistentVector<Pago>;
    
    constructor(account_id: string){
        this.account_id =account_id;
        this.pagos =  new PersistentVector<Pago>("p");
    }
    
    agregarPago(pago: Pago): void{
        this.pagos.push(pago);
        logging.log(`El integrante ${this.account_id} ha realizado un pago de ${pago.monto} exitosamente`);
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

@nearBindgen
export class Pago {
    public tanda_id: string;
    public monto: u64;
    public fecha_pago: string;

    constructor(tanda_id: string, monto: u64, fecha_pago: string){
        this.tanda_id = tanda_id;
        this.monto = monto;
        this.fecha_pago = fecha_pago;
    }
}
