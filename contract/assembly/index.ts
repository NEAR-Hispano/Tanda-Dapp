import { logging, context, datetime, MapEntry, PersistentMap, PersistentUnorderedMap, u128, ContractPromiseBatch } from 'near-sdk-as'
import { tandas, keys, Tanda, Integrante, Pago, Usuario, usuarios, pagos, pagos3} from "../models/model";
import { Duration } from 'assemblyscript-temporal';
import { AccountId, asNEAR, MAX_PAGE_SIZE, ONE_NEAR, periodos} from './utils';

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


export function agregarIntegrante(key: string, accountId: AccountId = context.sender): void {

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


export function consultarPagos2(): MapEntry<string, Map<string, Array<Pago>>>[]  {
  return pagos3.entries();
}

export function agregarPagoTest(key: string): bool {

  //Consultamos la tanda
  const tanda = tandas.get(key);

  //si existe
  if(tanda){

    const monto = context.attachedDeposit;
    //buscamos el historial de pagos
    let historialPagoTanda = pagos3.get(key);

    //si no hay
    if(!historialPagoTanda){
      // manda error si no le metimos nada de dinero
      assert(context.attachedDeposit > u128.Zero, "Donor must attach some money")

      //crea un nuevo arreglo de tipo Pago
      let arregloPago = new Array<Pago>();
      
      //Y creamos un nuevo objeto de tipo pago con el deposito  y la fecha, y le hacemos push al arreglo
      const pagoRecibido = new Pago(context.attachedDeposit, datetime.block_datetime().toString())
      arregloPago.push(pagoRecibido)

      //ahora creamos un nuevo mapa, este es el que esta adentro del persistent map
      let paymentMap = new Map<string, Array<Pago>>();

      //le mandamos como clave el que envia (context.sender) y el arreglo de pagos de arriba
      paymentMap.set(context.sender, arregloPago)

      //y hacemos set en el persistent map, enviando la key de la tanda y el mapa de arriba
      //esto ya hace que directo se guarde en la blockchain
      pagos3.set(key, paymentMap)
      logging.log('Pago realizado por ' + monto.toString())

      return true
    }
    else{

      //y pues si no existe, tendriamos que validar si el usuario existe, y si si, hacerle push al arreglo
      //y si no pues crear un nuevo arregloPago y ese es el que mandamos y así
      return false
      
    }

  }
  return false
}

export function agregarIntegrantePago(key: string, fechaPago: string): bool {
  // Consultamos que el ID de la tanda enviado exista
  const tanda = tandas.get(key);
  if (tanda){
    const monto = context.attachedDeposit;
    const pago = new Pago(monto, fechaPago);
    // Consultamos el historial de pagos por el ID de la tanda para obtener el historial de los integrantes y sus pagos
    let historialPagoTanda = pagos.get(key);
    
    if (!historialPagoTanda) {
      logging.log(`Pagos esta vacio ${pagos.length}`);
      // En caso de que no existan registros de pago de la tanda, se añade un nuevo registro completo
      historialPagoTanda = new PersistentUnorderedMap<string, Array<Pago>>('h');
      historialPagoTanda.set(context.predecessor, new Array<Pago>());
      logging.log(`SE CREO UN NUEVO HISTORIAL DE PAGOS`);
    }

    // Verificamos si esa tanda contiene al menos el registro de un pago
    if (historialPagoTanda) {
      logging.log(`historial pagos ${historialPagoTanda ? historialPagoTanda.length: -9999}`);
      // Obtenemos la lista de los pagos realizados de un integrante a una tanda
      let historialPagos = historialPagoTanda.get(context.predecessor);
      if (historialPagos){
        // Añadimos un nuevo pago al registro de pagos del integrante
        historialPagos.push(pago);
        logging.log(`Se añadio un nuevo pago de ${context.predecessor.toString()} exitosamente`);
        return true;
      }else {
        // En caso de que aun no existan registros de pago del integrante
        historialPagoTanda.set(context.predecessor, [pago]);
        logging.log(`El primer pago de ${context.predecessor.toString()} ha sido registrado exitosamente`);
        return true;
      } 
    }
    logging.log(`historial pagos esta vacio`);
  }
  logging.log(`La Tanda ${key} no existe`);
  return false;
}

export function consultarIntegrantePago(key: string, accountId: string): Array<Pago> | null {
  const tanda = tandas.get(key);
  if (tanda){
    const historialPagosTanda = pagos.get(key);
    if (historialPagosTanda) {
      const historialPagos = historialPagosTanda.get(accountId);
      return historialPagos;
    }
    logging.log(`El integrante ${accountId} no ha realizado pagos en la Tanda ${key}`);
    return null;
  }
  logging.log(`La Tanda ${key} no existe`);
  return null;
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



export function regalarDinero(monto: i32, idCuenta: AccountId): bool {

  const montoTransferencia = u128.mul(ONE_NEAR, u128.from(monto))
  ContractPromiseBatch.create(idCuenta).transfer(montoTransferencia)

  logging.log(`Se transfirieron ${asNEAR(montoTransferencia)} NEAR a ${idCuenta}`)
  
  return true
}


