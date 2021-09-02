import { logging, context, datetime } from 'near-sdk-as'
import { tandas, keys, Tanda, periodos} from "../models/tanda";
import { Duration } from 'assemblyscript-temporal';

export function setTanda(nombreTanda: string, integrantes: u64, monto: u64, periodo: i32): void{

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