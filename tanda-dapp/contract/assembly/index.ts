import { logging } from 'near-sdk-as'
import { tandas, keys, Tanda, periodos} from "../models/tanda";
//import { Date } from "as-date";

const account_id = "";

export function setTanda(nombreTanda: string, integrantes: u64, monto: u64, periodo: i32): void{

  let tanda = new Tanda(nombreTanda, integrantes, monto, periodo);

  //tanda.periodo = Periodo;

  logging.log(
    'Creando tanda"' 
      + nombreTanda 
      + '" en la cuenta "' 
      + account_id
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
  tandas.delete(key);

  
  if(tanda != null){
    if(tanda.activa){
      tanda.activa = false;
      tanda.fecha_final = new Date(1630387618);
    }
    else{
      let dias_a_sumar = tanda.num_integrantes * tanda.periodo;
      tanda.activa = true;
      //tanda.fecha_inicio = new Date(Date.now());
      //tanda.fecha_final = new Date(Date.now() + dias_a_sumar);
    }

    tandas.set(tanda.id, tanda);
    return tanda;
  }

  return null;
}