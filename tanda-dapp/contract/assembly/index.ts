import { Context, logging, storage } from 'near-sdk-as'
import { Tanda, Periodo } from "./tanda";

const account_id = "aklassen.testnet";

export function setTanda(nombreTanda: string, integrantes: u64, monto: f64, periodo: Periodo): void{

  let tanda = new Tanda();

  tanda.nombre = nombreTanda;
  tanda.integrantes = integrantes;
  tanda.monto = monto;
  tanda.periodo = Periodo;

  logging.log(
    'Creando tanda"' 
      + nombreTanda 
      + '" en la cuenta "' 
      + account_id
      + '" con "'
      + integrantes
      + '" integrantes, por "'
      + monto
      + '" cada "'
      + periodo
      + '"'
  )

  storage.set<Tanda>(account_id, tanda)
}

export function getTanda(): Tanda | null {
  return storage.get<Tanda>(account_id)
}
