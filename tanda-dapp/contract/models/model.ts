import { context, u128, PersistentMap, PersistentVector, math, logging } from "near-sdk-as";
import { AccountId, MAX_PAGE_SIZE, Money, Periodo } from "../assembly/utils";

@nearBindgen
export class Tanda {
    id: string;
    nombre: string;
    numIntegrantes:  u64;
    monto: u64;
    fechaInicio: string;
    fechaFinal: string;
    activa: bool;
    periodo: u64;
    integrantes: PersistentVector<Integrante>;
    
    constructor(nombre: string, numIntegrantes:  u64, monto: u64, periodo: u64){
        this.id = context.blockIndex.toString();
        this.nombre = nombre;
        this.numIntegrantes = numIntegrantes;
        this.monto = monto;
        this.activa = false;
        this.periodo = periodo;
        this.integrantes = new PersistentVector<Integrante>("I");
    }

    agregarIntegrante(integrante: Integrante): void{
        if (this.numIntegrantes < this.integrantes.length) {
            this.integrantes.push(integrante);
            logging.log(`Integrante nuevo ${integrante.accountId}  agregado exitosamente`);
        }
        logging.log(`La Tanda se encuentra llena, ya no existen lugares disponibles.`);
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

// Almancenamiento de los identificadores de las tandas registradas
export const keys = new PersistentVector<string>("k");



@nearBindgen
export class Integrante {
    public accountId: AccountId;
    public pagos: PersistentMap<string, Array<Pago>>;
    
    constructor(accountId: AccountId){
        this.accountId =accountId;
        this.pagos =  new PersistentMap<string, Array<Pago>>("p");
    }
    
    agregarPago(semanaId: string, pago: Pago): void{
        const periodoPagos = this.pagos.get(semanaId);
        if(periodoPagos){
            periodoPagos.push(pago);
            logging.log(`El integrante ${this.accountId} ha realizado un pago de ${pago.monto} exitosamente`);
        }
        logging.log(`Periodo de pagos no encontrado`);
    }

    consultarPagos(semanaId: string): Array<Pago> | null {
        const periodoPagos = this.pagos.get(semanaId);
        if(periodoPagos){
            const numMessages = min(MAX_PAGE_SIZE, periodoPagos.length);
            const startIndex = periodoPagos.length - numMessages;
            const result = new Array<Pago>(numMessages);
            for(let i = 0; i < numMessages; i++) {
                result[i] = periodoPagos[i + startIndex];
            }
            return result;
        }
        return null;
    }
}

@nearBindgen
export class Pago {
    public tandaId: string;
    public monto: Money;
    public fechaPago: string;

    constructor(tandaId: string, monto: Money, fechaPago: string){
        this.tandaId = tandaId;
        this.monto = monto;
        this.fechaPago = fechaPago;
    }
}
