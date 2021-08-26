import { Context, logging, storage, PersistentVector } from 'near-sdk-as'
import { Tanda, Periodo } from "./model";

const account_id = "aklassen.testnet";

let tandas = new PersistentVector<Tanda>("t");

export function setTanda(nombreTanda: string, integrantes: u64, monto: u64): void{

  let tanda = new Tanda(nombreTanda, integrantes, monto);

  logging.log(
    'Creando tanda"' 
      + nombreTanda 
      + '" en la cuenta "' 
      + account_id
      + '" con "'
      + integrantes.toString()
      + '" integrantes, por "'
      + monto.toString()
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