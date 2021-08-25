import { Context, logging, storage } from 'near-sdk-as'
import { Tanda, Periodo } from "./tanda";

const account_id = "aklassen.testnet";
const dev = "dev-1629865672477-10324725647834";

export function setTanda(nombreTanda: string, integrantes: u64, monto: u64): void{

  let tanda = new Tanda(nombreTanda, integrantes, monto);

  //tanda.periodo = Periodo;

  logging.log(
    'Creando tanda"' 
      + nombreTanda 
      + '" en la cuenta "' 
      + account_id
      + '" con "'
      + "8"
      + '" integrantes, por "'
      + "3.0"
      + '" cada "'
      + '"'
  )

  storage.set<Tanda>(account_id, tanda)
}

export function getTanda(): Tanda | null {
  return storage.get<Tanda>(account_id)
}
