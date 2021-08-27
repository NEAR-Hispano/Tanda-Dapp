import { logging } from 'near-sdk-as'
import { tandas, Tanda} from "../models/tanda";

const account_id = "";

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
  tandas.push(tanda);
}

export function getTandas(): Array<Tanda>{
  let numTandas = min(10, tandas.length);
  let startIndex = tandas.length - numTandas;
  let result = new Array<Tanda>(numTandas);
  for (let i = 0; i < numTandas; i++) {
    result[i] = tandas[i + startIndex];
  }
  return result;
}

export function getTanda(nombreTanda: string): Tanda | null {
  let numTandas = min(10, tandas.length);
  const startIndex = tandas.length - numTandas;
  for (let i = 0; i < numTandas; i++) {
    if (tandas[i + startIndex].nombre == nombreTanda) {
      return tandas[i + startIndex];
    }
  }
  return null;
}
