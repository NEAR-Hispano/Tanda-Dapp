import { logging, datetime} from 'near-sdk-as'
import { tandas, keys, Tanda, Integrante, Pago} from "../models/model";

const account_id = "joyloz.testnet";

export function setTanda(nombreTanda: string, integrantes: u64, monto: u64): void{

  let tanda = new Tanda(nombreTanda, integrantes, monto);

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
  tandas.set(tanda.id, tanda);
  keys.push(tanda.id);
}

export function getTandas(): Array<Tanda | null>{
  let numTandas = min(10, keys.length);
  let startIndex = keys.length - numTandas;
  let result = new Array<Tanda | null>(numTandas);
  for (let i = 0; i < numTandas; i++) {
    result[i] = tandas.get(keys[i + startIndex]);
  }
  return result;
}

export function getTanda(key: string): Tanda | null {
  return tandas.get(key);
}


export function agregarIntegrante(key: string, account_id: string): void {
  const integrante = new Integrante(account_id);
  const tanda = tandas.get(key);
  if (tanda){
    tanda.agregarIntegrante(integrante);
  }
}

export function consultarIntegrantes(key: string): Array<string> | null {
  const tanda = tandas.get(key);
  if (tanda){
    const integrantes = tanda.consultarIntegrantes();
    
    const tanda_length = integrantes.length;
    const numMessages = min(10, tanda_length);
    const startIndex = tanda_length - numMessages;
    const result = new Array<string>(numMessages);
    for(let i = 0; i < numMessages; i++) {
      result[i] = integrantes[ i + startIndex].account_id;
    }
    return result;
  }
  return null;
}

export function agregarIntegrantePago(key: string, account_id: string, monto: u64): bool {
  const tanda = tandas.get(key);
  if (tanda){
    const integrantes = tanda.consultarIntegrantes();
    
    const tanda_length = integrantes.length;
    const numMessages = min(10, tanda_length);
    const startIndex = tanda_length - numMessages;

    for(let i = 0; i < numMessages; i++) {
      if(integrantes[ i + startIndex].account_id == account_id){
        const pago = new Pago(key, monto, datetime.block_datetime().toString());
        integrantes[ i + startIndex].agregarPago(pago);
        return true;
      }
    }
  }
  return false;
}

export function consultarIntegrantePago(key: string, account_id: string): Array<Pago> | null {
  const tanda = tandas.get(key);
  if (tanda){
    const integrantes = tanda.consultarIntegrantes();
    
    const tanda_length = integrantes.length;
    const numMessages = min(10, tanda_length);
    const startIndex = tanda_length - numMessages;

    for(let i = 0; i < numMessages; i++) {
      if(integrantes[ i + startIndex].account_id == account_id){
        return integrantes[ i + startIndex].consultarPagos();
      }
    }
  }
  return null;
}