import { logging } from 'near-sdk-as'
import { tandas, keys, Tanda, Integrante} from "../models/model";

const account_id = "joyloz.testnet";

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
    logging.log(`Integrante nuevo ${account_id}  agregado exitosamente`);
  }
}

export function consultarIntegrantes(key: string): Array<String> {
  const tanda = tandas.get(key);
  if (tanda){
    const integrantes = tanda.consultarIntegrantes();
    const tanda_length = integrantes.length;
    //logging.log(integrantes[0].account_id);
    logging.log(`Tanda ID: ${tanda.id}, Integrantes: ${tanda_length}`);
    const numMessages = min(10, tanda_length);
    const startIndex = tanda_length - numMessages;
    const result = new Array<String>(numMessages);
    /*for(let i = 0; i < numMessages; i++) {
      result[i] = integrantes[i + startIndex].account_id;
      logging.log(result[i]);
    }*/
   /* return result;
  } else {*/
  }
    return ['hola'];
  //} 
}