import { context, u128, PersistentMap, PersistentVector, datetime, logging, PersistentUnorderedMap } from "near-sdk-as";
import { AccountId, MAX_PAGE_SIZE, Money, Periodo } from "../assembly/utils";
import { Duration } from 'assemblyscript-temporal';

@nearBindgen
export class Tanda {
    id: string;
    creador: string;
    nombre: string;
    numIntegrantes:  u64;
    monto: u64;
    fechaInicio: string;
    fechaFinal: string;
    activa: bool;
    periodo: u64;
    estado: string;
    integrantes: PersistentVector<Integrante>;
    
    constructor(nombre: string, numIntegrantes:  u64, monto: u64, periodo: u64){
        this.id = context.blockIndex.toString();
        this.nombre = nombre;
        this.numIntegrantes = numIntegrantes;
        this.monto = monto;
        this.activa = false;
        this.estado = 'Pendiente';
        this.periodo = periodo;
        this.integrantes = new PersistentVector<Integrante>(`${context.blockIndex}`);
        this.creador = context.sender;
        this.fechaInicio = datetime.block_datetime().toString().split('T')[0];
        this.fechaFinal = datetime.block_datetime().add(new Duration(0,0,0,<i32>(numIntegrantes * periodo) -1)).toString().split('T')[0];
    }

    agregarIntegrante(integrante: Integrante): void{

        if (this.integrantes.length < <i32>this.numIntegrantes) {
            this.integrantes.push(integrante);
            logging.log(`Integrante nuevo ${integrante.accountId} agregado exitosamente`);
        }
        else{
            logging.log(`La Tanda se encuentra llena, ya no existen lugares disponibles.`);
        }
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

//Almacenamiento para usuarios
export const usuarios = new PersistentUnorderedMap<string, Usuario>("u");

//Almacenamiento para los pagos
export const pagos = new PersistentUnorderedMap<string, Map<string,Array<Pago>>>("hp");

//Almacenamiento datos de periodo
export const tandaPeriodos = new PersistentUnorderedMap<string, Array<Periodos>>("S")

@nearBindgen
export class Usuario {
    public accountId: AccountId;
    public tandasCreadas: Array<string>;
    public tandasInscritas: Array<string>;

    constructor(accountId: AccountId){
        this.accountId =accountId;
        this.tandasCreadas = new Array;
        this.tandasInscritas = new Array;
    }
}

@nearBindgen
export class Integrante {
    public accountId: AccountId;
    
    constructor(accountId: AccountId){
        this.accountId =accountId;
    }
    
    
}

@nearBindgen
export class Pago {
    public monto: Money;
    public fechaPago: string;

    constructor(monto: Money, fechaPago: string){
        this.monto = monto;
        this.fechaPago = fechaPago;
    }
}

@nearBindgen
export class Periodos {
    public inicio: string;
    public final: string;
    public usuarioTurno: AccountId;
    public pagosCompletos: bool;
    public tandaPagada: bool;
    public cantidadRecaudada: u64;
    public integrantesPagados: Array<string>;

    constructor(inicio: string, final: string){
        this.inicio = inicio;
        this.final = final;
        this.usuarioTurno = '';
        this.pagosCompletos = false;
        this.tandaPagada = false;
        this.cantidadRecaudada = 0;
        this.integrantesPagados = new Array;
    }
}