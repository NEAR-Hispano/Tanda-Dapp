export class Tanda {
    nombre: string;
    num_integrantes: u64;
    monto: f64;
    periodo: Periodo;
}

export enum Periodo {
    Semanal: 1,
    Quincenal: 2,
    Mensual: 3,
}