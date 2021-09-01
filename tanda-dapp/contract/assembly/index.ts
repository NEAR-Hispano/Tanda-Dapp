import { logging, context, datetime } from 'near-sdk-as'
import { tandas, keys, Tanda, periodos} from "../models/tanda";
import { PlainDateTime } from 'assemblyscript-temporal';

//const account_id = context.sender;

export function setTanda(nombreTanda: string, integrantes: u64, monto: u64, periodo: i32): void{

  let tanda = new Tanda(nombreTanda, integrantes, monto, periodo);

  //tanda.periodo = Periodo;

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
  tandas.delete(key);

  
  if(tanda != null){
    if(tanda.activa){
      tanda.activa = false;
      const date = datetime.block_datetime();

      tanda.fecha_final = date.toString()+' *';
    }
    else{
      let dias_a_sumar: i32 = <i32>tanda.num_integrantes * <i32>tanda.periodo;
      tanda.activa = true;
      tanda.fecha_inicio = datetime.block_datetime().toString();

      const date = datetime.block_datetime();
      const date_added = date.add({day: dias_a_sumar});
      //tanda.fecha_final = date.toString()+' *';
    }

    tandas.set(tanda.id, tanda);
    return tanda;
  }

  return null;
}