import { logging, context, datetime } from 'near-sdk-as'
import { tandas, keys, Tanda, Integrante, Pago} from "../models/model";
import { Duration } from 'assemblyscript-temporal';
import { AccountId, MAX_PAGE_SIZE, periodos} from './utils';

export function crearTanda(nombreTanda: string, integrantes:  u64, monto: u64, periodo: i32): void{

  let tanda = new Tanda(nombreTanda, integrantes, monto, periodo);

  logging.log(
    'Creando tanda"' 
      + nombreTanda
      + '" en la cuenta "' 
      + context.sender
      + '" con "'
      + integrantes.toString()
      + '" integrantes, por "'
      + monto.toString()
      + '" con un periodo "'
      + periodos.get(periodo)
      + '"'
  )
  tandas.set(tanda.id, tanda);
  keys.push(tanda.id);
}

export function consultarTandas(): Array<Tanda | null>{
  let numTandas = min(MAX_PAGE_SIZE, keys.length);
  let startIndex = keys.length - numTandas;
  let result = new Array<Tanda | null>(numTandas);
  for (let i = 0; i < numTandas; i++) {
    result[i] = tandas.get(keys[i + startIndex]);
  }
  return result;
}

export function consultarTanda(key: string): Tanda | null {
  return tandas.get(key);
}


export function agregarIntegrante(key: string, accountId: AccountId): void {
  const integrante = new Integrante(accountId);
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
    const numMessages = min(MAX_PAGE_SIZE, tanda_length);
    const startIndex = tanda_length - numMessages;
    const result = new Array<string>(numMessages);
    for(let i = 0; i < numMessages; i++) {
      result[i] = integrantes[ i + startIndex].accountId;
    }
    return result;
  }
  return null;
}

export function agregarIntegrantePago(key: string, semanaId: string): bool {
  const tanda = tandas.get(key);
  if (tanda){
    const integrantes = tanda.consultarIntegrantes();
    
    const tanda_length = integrantes.length;
    const numMessages = min(MAX_PAGE_SIZE, tanda_length);
    const startIndex = tanda_length - numMessages;
    const monto = context.attachedDeposit;

    for(let i = 0; i < numMessages; i++) {
      if(integrantes[ i + startIndex].accountId == context.predecessor){
        const pago = new Pago(key, monto, datetime.block_datetime().toString());
        integrantes[ i + startIndex].agregarPago(semanaId, pago);
        return true;
      }
    }
  }
  return false;
}

export function consultarIntegrantePago(key: string, semanaId: string): Array<Pago> | null {
  const tanda = tandas.get(key);
  if (tanda){
    const integrantes = tanda.consultarIntegrantes();
    
    const tanda_length = integrantes.length;
    const numMessages = min(MAX_PAGE_SIZE, tanda_length);
    const startIndex = tanda_length - numMessages;

    for(let i = 0; i < numMessages; i++) {
      if(integrantes[ i + startIndex].accountId == context.predecessor){
        return integrantes[ i + startIndex].consultarPagos(semanaId);
      }
    }
  }
  return null;
}

export function cambiarEstadoTanda(key: string): Tanda | null {

  let tanda = tandas.get(key);
  
  if(tanda){
    if(tanda.activa){
      tanda.activa = false;
      const date = datetime.block_datetime();
      tanda.fechaFinal = date.toString();
    }
    else{
      tanda.activa = true;

      let dias_a_sumar = tanda.numIntegrantes * tanda.periodo;
      const date_added = datetime.block_datetime().add(new Duration(0,0,0,<i32>dias_a_sumar));

      tanda.fechaInicio = datetime.block_datetime().toString();
      tanda.fechaFinal = date_added.toString();
    }

    tandas.set(tanda.id, tanda);
    return tandas.get(tanda.id);
  }

  return null;
}

export function editarTanda(
  key: string, 
  nombreTanda: string = "",
  integrantes: i32 = 0,
  monto: u64 = 0,
  periodo: u64 = 0): Tanda | null {

  let tanda = tandas.get(key);

  if(tanda){
    if(nombreTanda != "") tanda.nombre = nombreTanda;
    if(monto != 0 && !tanda.activa) tanda.monto = monto;
    if(integrantes != 0 && !tanda.activa) tanda.numIntegrantes = integrantes;
    if(periodo != 0 && !tanda.activa) tanda.periodo = periodo;

    tandas.set(tanda.id, tanda);
    return tandas.get(tanda.id);
  }
  return null;
}