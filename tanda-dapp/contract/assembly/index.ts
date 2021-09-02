import { logging, context, datetime } from 'near-sdk-as'
import { tandas, keys, Tanda, periodos, Integrante, Pago} from "../models/model";
import { Duration } from 'assemblyscript-temporal';

export function crearTanda(nombreTanda: string, integrantes: u64, monto: u64, periodo: i32): void{

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
  let numTandas = min(10, keys.length);
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

export function cambiarEstadoTanda(key: string): Tanda | null {

  let tanda = tandas.get(key);
  
  if(tanda){
    if(tanda.activa){
      tanda.activa = false;
      const date = datetime.block_datetime();
      tanda.fecha_final = date.toString();
    }
    else{
      tanda.activa = true;

      let dias_a_sumar = tanda.num_integrantes * tanda.periodo;
      const date_added = datetime.block_datetime().add(new Duration(0,0,0,<i32>dias_a_sumar));

      tanda.fecha_inicio = datetime.block_datetime().toString();
      tanda.fecha_final = date_added.toString();
    }

    tandas.set(tanda.id, tanda);
    return tandas.get(tanda.id);
  }

  return null;
}

export function editarTanda(
  key: string, 
  nombreTanda: string = "",
  integrantes: u64 = 0,
  monto: u64 = 0,
  periodo: u64 = 0): Tanda | null {

  let tanda = tandas.get(key);

  if(tanda){
    if(nombreTanda != "") tanda.nombre = nombreTanda;
    if(monto != 0 && !tanda.activa) tanda.monto = monto;
    if(integrantes != 0 && !tanda.activa) tanda.num_integrantes = integrantes;
    if(periodo != 0 && !tanda.activa) tanda.periodo = periodo;

    tandas.set(tanda.id, tanda);
    return tandas.get(tanda.id);
  }
  return null;
}