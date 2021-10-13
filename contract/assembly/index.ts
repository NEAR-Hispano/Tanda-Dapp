import { logging, context, datetime, MapEntry, PersistentMap, PersistentUnorderedMap, u128 } from 'near-sdk-as'
import { tandas, keys, Tanda, Integrante, Pago, Usuario, usuarios, pagos} from "../models/model";
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
    'Creando tanda "' 
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

  registrarUsuario(context.sender, tanda.id, true);
}

export function registrarUsuario(idCuenta: string, idTanda: string, creada: bool): void{

  const usuario = usuarios.get(idCuenta);
  if(usuario){
    creada ? usuario.tandasCreadas.push(idTanda) : usuario.tandasInscritas.push(idTanda);
    usuarios.set(idCuenta, usuario);
  }
  else{
    let nuevoUsuario = new Usuario(idCuenta);
    creada ? nuevoUsuario.tandasCreadas.push(idTanda) : nuevoUsuario.tandasInscritas.push(idTanda);
    usuarios.set(idCuenta, nuevoUsuario);
  }
}

export function consultarUsuarios(): MapEntry<string, Usuario>[] {
  return usuarios.entries();
}

export function consultarClavesUsuarios(): Array<string> {
  return usuarios.keys();
}

export function consultarInfoUsuarios(): Array<Usuario> {
  return usuarios.values();
}

export function consultarTandasCreadas(idCuenta: string = context.sender): Array<Tanda | null> | null{
  const usuario = usuarios.get(idCuenta);
  
  return usuario ? buscarTandas(usuario.tandasCreadas) : null
}

export function consultarTandasInscritas(idCuenta: string = context.sender): Array<Tanda | null> | null {
  const usuario = usuarios.get(idCuenta);

  return usuario ? buscarTandas(usuario.tandasInscritas) : null;
}

function buscarTandas(listaTandas: Array<string>): Array<Tanda | null> | null{
    let result = new Array<Tanda | null>();

    for (let i = 0; i < listaTandas.length; i++) {
      result.push(tandas.get(listaTandas[i]));
    }
    return result;
}

// Esta función regresa las n últimas tandas.
// n siendo el valor que está en la variable MAX_PAGE_SIZE 
export function consultarTandas(): Array<Tanda | null>{

  //Obtenemos el valor menor entre el máximo y la cantidad de tandas que hay.
  let numTandas = min(MAX_PAGE_SIZE, keys.length);

  //Y definimos en que índice de las llaves vamos a empezar.
  let startIndex = keys.length - numTandas;

  //Declaramos nuestro objeto de arreglo
  let result = new Array<Tanda | null>(numTandas);

  //E iteramos, llenando así nuestro arreglo.
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
    registrarUsuario(accountId, key, false);
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

function validarIntegrante (tandaKeys: Array<string> | null, accountId: string) : bool{
    return tandaKeys ? tandaKeys.includes(accountId) : false;
}
export function agregarIntegrantePago(key: string): bool {
  // Consultamos que el ID de la tanda enviado exista
  const tanda = tandas.get(key);
  if (tanda){
    // Almacenamos los valores generales para registrar el contrato
    const cuentaId = context.sender;

    // Validamos que el usuario exista en la tanda
    const valido =  validarIntegrante(consultarIntegrantes(key), cuentaId);
    assert(valido == false, `El integrante ${cuentaId} no es integrante de la tanda`);
   if (!valido) {
    logging.log(`El integrante ${cuentaId} no se encuentra registrado en esta tanda`);
     return false;
   }


    const monto = context.attachedDeposit;
    assert(monto >  u128.Zero, 'El pago debe ser mayor a cero');

    // Creamos el objeto del pago
    const nuevoPago = new Pago(monto, context.blockTimestamp.toString());

    // Consultamos el historial de pagos por el ID de la tanda para obtener el historial de los integrantes y sus pagos
    let historialPagoTanda = pagos.get(key);
    if (!historialPagoTanda) {
      logging.log(`El historial de pagos esta vacio ${pagos.length}`);

      //ahora creamos un nuevo mapa, este es el que esta adentro del persistent map
      let paymentMap = new Map<string, Array<Pago>>();

      //le mandamos como clave el que envia (context.sender) y el arreglo de pagos de arriba
      paymentMap.set(cuentaId, [nuevoPago]);

      // En caso de que no existan registros de pago de la tanda, se añade un nuevo registro completo
      pagos.set(key, paymentMap);
      logging.log(`Se instancio exitosamente el registro de pagos`);
    }

    // Verificamos si esa tanda contiene al menos el registro de un pago
    if (historialPagoTanda) {

      // Obtenemos la lista de los pagos realizados de un integrante a una tanda
      let historialPagos = historialPagoTanda.get(cuentaId);
      if (historialPagos){
        // Si existen registros de pago, añadimos un nuevo pago al registro de pagos del integrante
        historialPagos.push(nuevoPago);
        logging.log(`Se añadio un nuevo pago de ${cuentaId.toString()} exitosamente ${historialPagos.length}`);
        // Enviamos los cambios realizados sobre la colección de PersistentUnorderedMap
        pagos.set(key, historialPagoTanda);
        return true;
      }else {
        // En caso de que aun no existan registros de pago del integrante
        historialPagoTanda.set(cuentaId, [nuevoPago]);
        logging.log(`El primer pago de ${cuentaId.toString()} ha sido registrado exitosamente`);
        // Enviamos los cambios realizados sobre la colección de PersistentUnorderedMap
        pagos.set(key, historialPagoTanda);
        return true;
      } 
    }
  }
  logging.log(`La Tanda ${key} no existe`);
  return false;
}

export function consultarTandaPagos(key: string): Map<string, Array<Pago>> | null  {
  // Consultamos la existencia de la tanda 
  const tanda = tandas.get(key);
  if (tanda){
    // Si la tanda existe entonces regresamos todos los pagos de esa tanda
    return pagos.get(key);
  }
  logging.log(`La Tanda ${key} no existe`);
  return null;
}

export function consultarIntegrantePagos(key: string, accountId: string): Array<Pago>  {
  
   // Validamos que el usuario exista en la tanda
   const valido =  validarIntegrante(consultarIntegrantes(key), accountId);
  
   assert(valido == false, `El integrante ${accountId} no es integrante de la tanda`);
   if (!valido) {
    logging.log(`El integrante ${accountId} no se encuentra registrado en esta tanda`);
     return [];
   }

  const tanda = tandas.get(key);
  // Consultamos la existencia de la tanda
  if (!tanda){ 
    logging.log(`La Tanda ${key} no existe`);
    return [];
  }

  // Obtenemos el historial de pagos de una tanda
  const historialPagosTanda = pagos.get(key);
  if (historialPagosTanda) {
     // Si existen pagos de esa tanda, entonces regresamos los pagos realizados por un integrante
    return historialPagosTanda.get(accountId);
  }
  return [];
}

export function consultarPagos(): MapEntry<string, Map<string, Array<Pago>>>[]  {
  // Traer todos los pagos registrados en la red de NEAR
  return pagos.entries();
 }

export function cambiarEstadoTanda(key: string): Tanda | null {

  assert(key != "", "El campo de clave no debe estar vacío.");
  let tanda = tandas.get(key);
  
  if(tanda){
    assert(tanda.creador == context.sender, "No cuentas con autorización para modificar esta Tanda");
    assert(tanda.integrantes.length > 0, "No se puede inicializar la Tanda sin integrantes.");

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
  integrantes:  u64 = 0,
  monto: u64 = 0,
  periodo: u64 = 0,
  fechaInicio: string = "",
  fechaFin: string = ""): Tanda | null {

  //Validando inputs
  assert(key != "", "El campo de clave no debe estar vacío.");

  let tanda = tandas.get(key);

  if(tanda){


    tanda.nombre = nombreTanda || nombreTanda;
    if (!tanda.activa) {
      tanda.monto = monto || tanda.monto;
      tanda.numIntegrantes = integrantes || tanda.numIntegrantes;
      tanda.periodo = periodo || tanda.periodo;
      tanda.fechaInicio = fechaInicio || tanda.fechaInicio; 
      tanda.fechaFinal = fechaFin || tanda.fechaFinal; 
    }

    tandas.set(tanda.id, tanda);
    return tandas.get(tanda.id);
  }
  return null;
}