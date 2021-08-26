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

export enum Periodo {
    Semanal = 1,
    Quincenal = 2,
    Mensual = 3,
}