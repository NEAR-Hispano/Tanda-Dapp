import { logging, context, datetime } from 'near-sdk-as'
import { tandas, keys, Tanda, Integrante, Pago} from "../models/model";
import { Duration } from 'assemblyscript-temporal';
import { AccountId, MAX_PAGE_SIZE, periodos} from './utils';

export function crearTanda(nombreTanda: string, integrantes:  u64, monto: u64, periodo: i32): void{

  //Validamos que los parámetros enviados sean correctos

  /* Tecnicamente podría ir vacío, no hay ningún método que requiera el nombre.
   * Sin embargo, dado a que esto será mostrado al usuario, es mejor que 
   * desde el inicio se tenga asignado el nombre.
   */
  assert(nombreTanda != "", "El nombre de la Tanda no puede estar vacío.");

  // Toda tanda necesita al menos 2 integrantes.
  assert(integrantes > 2, "La Tanda necesita al menos 2 integrantes.");

  // Necesitamos que el monto a ahorrar sea mayor a 0.
  assert(monto > 0, "El monto a ahorrar tiene que ser mayor a 0.");

  // Se requiere un periodo de mínimo 1 (en días).
  assert(periodo > 0, "El periodo no puede ser menor a 1.");

  //Creamos un objeto de tipo Tanda. Puedes validar el modelo en /models/model.ts
  let tanda = new Tanda(nombreTanda, integrantes, monto, periodo);

  //Este mensaje va a regresarlo la consola si todo es exitoso.
  //También se mostrará en la blockchain.
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

  //Envíamos el objeto creado al mapa de tandas.
  tandas.set(tanda.id, tanda);
  //Y la clave al arreglo de tandas.
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

export function consultarTandasPorOwner(): Array<Tanda | null>{
  let numTandas = min(MAX_PAGE_SIZE, keys.length);
  let startIndex = keys.length - numTandas;
  let result = new Array<Tanda | null>();
  for (let i = 0; i < numTandas; i++) {
    const tanda = tandas.get(keys[i + startIndex])
    if(tanda && tanda.creador.toString() == context.sender.toString()){
      result.push(tanda);
    }
  }
  return result;
}

export function consultarTanda(key: string): Tanda | null {
  assert(key != "","El campo de clave no debe estar vacío.");
  return tandas.get(key);
}


export function agregarIntegrante(key: string, accountId: AccountId): void {

  //Validando inputs
  assert(accountId != "", "El campo de usuario no debe estar vacío.");
  assert(key != "", "El campo de clave no debe estar vacío.");
  

  const integrante = new Integrante(accountId);
  const tanda = tandas.get(key);
  if (tanda){
    tanda.agregarIntegrante(integrante);
  }
}

export function consultarIntegrantes(key: string): Array<string> | null {

  assert(key != "", "El campo de clave no debe estar vacío.");

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

  assert(key != "", "El campo de clave no debe estar vacío.");
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

  //Validando inputs
  assert(key != "", "El campo de clave no debe estar vacío.");

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