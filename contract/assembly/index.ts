import { logging, context, datetime, MapEntry, u128, ContractPromiseBatch } from 'near-sdk-as'
import { tandas, keys, Tanda, Integrante, Pago, Usuario, usuarios, pagos, tandaPeriodos, Periodos} from "../models/model";
import { Duration , PlainDate } from 'assemblyscript-temporal';
import { AccountId, asNEAR, MAX_PAGE_SIZE, ONE_NEAR, periodos, getFechaActual} from './utils';

/**
 * Método del smart contract para registrar una nueva tanda.
 * El comando para utilizarlo en la terminal es:
 *  >> near call $ACCOUNT_ID crearTanda '{"nombreTanda": "nombre", "integrantes": "numero de integrantes", "monto": "monto de la aportación", "periodo": 7 | 15 | 30}' --accountId $ACCOUNT_ID
 *    * $ACCOUNT_ID es una variable que contiene el id de la cuenta del contrato
 * 
 * @param nombreTanda string que contiene el nombre de la tanda a registrar
 * @param integrantes string con valor numérico que contiene la cantidad de integrantes para los que estará abierta la tanda
 * @param monto string valor numérico del monto de las aportaciones periódicas en la tanda
 * @param periodo enum numérico donde 7=Semanal, 15=Quincenal y 30=Mensual
 */
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
  
  //Llamamos a la función encargada de registrar añadir el registro del nuevo usuario en la colección de usuarios 
  registrarUsuario(context.sender, tanda.id, true);
}

/**
 * Método encargado de añadir un registro nuevo a la colección de usuarios
 * El comando para utilizarlo en la terminal es:
 *  >> near call $ACCOUNT_ID registrarUsuario '{"idCuenta": "cuentaId", "idTanda": "key de la tanda", "creada": false | true}' --accountId $ACCOUNT_ID
 * @param idCuenta string que contiene el valor de la cuenta id del usuario a registrar
 * @param idTanda string con el valor de la key de la tanda
 * @param creada bool indica si el usuario es el creador de la tanda=true, en caso contrario es false
 */
 export function registrarUsuario(idCuenta: string, idTanda: string, creada: bool): void{

  let usuario = usuarios.get(idCuenta);
  if (!usuario){
    usuario = new Usuario(idCuenta);
  }
  creada ? usuario.tandasCreadas.push(idTanda) : usuario.tandasInscritas.push(idTanda);
  usuarios.set(idCuenta, usuario);
}

/**
 * Método que retorna el registro de todos los usuarios que participan en las tandas creadas por un admin 
 * El comando para utilizarlo en la terminal es:
 *  >> near view $ACCOUNT_ID consultarUsuarios '{}'
 * @returns MapEntry<string, Usuario>[]
 */
export function consultarUsuarios(): MapEntry<string, Usuario>[] {
  return usuarios.entries();
}

/**
 * Método que retorna el registro de las tandas creadas de un admin
 * El comando para utilizarlo en la terminal es:
 *  >> near view $ACCOUNT_ID consultarUsuarios '{}'
 * @param idCuenta string de la cuenta id del un usuario creador de tandas
 * @returns Array<Tanda | null> | null
 */
export function consultarTandasCreadas(idCuenta: string = context.sender): Array<Tanda | null> | null{
  const usuario = usuarios.get(idCuenta);
  
  return usuario ? buscarTandas(usuario.tandasCreadas) : null
}

/**
 * Método que retorna todas las tandas a las que integrante esta inscrito
 * El comando para utilizarlo en la terminal es:
 *  >> near view $ACCOUNT_ID consultarTandasInscritas '{}'
 * @param idCuenta string de la cuenta id del integrante
 * @returns Array<Tanda | null> | null
 */
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

/**
 * Función interna encargada de validar si una cuenta id de un integrante, se encuentra registrado en la lista de los integrantes de la tanda
 * @param tandaKeys Array<string> Arreglo de los ids de las cuentas de integrantes registrados en una tanda
 * @param accountId string Id de la cuenta que va a ser verificada
 * @returns bool True si el integrante existe en los integrantes de la tanda
 */
function validarIntegrante (tandaKeys: Array<string> | null, accountId: string) : bool{
    return tandaKeys ? tandaKeys.includes(accountId) : false;
}

/**
 * Método para añadir el pago de un integrante a una tanda
 * @param key string que contiene la key de una tanda
 * @returns bool True si el pago fue añadido exitosamente, False en caso contrario
 */
export function agregarIntegrantePago(key: string): bool {
  // Consultamos que el ID de la tanda enviado exista
  const tanda = tandas.get(key);
  assert(tanda, `La Tanda ${key} no existe`);

  //Si el pago no es por la cantidad establecida en la Tanda, lo rechazamos
  if(tanda){
    assert(context.attachedDeposit == u128.mul(ONE_NEAR, u128.from(tanda.monto)),
    `Sólo se pueden realizar pagos por la cantidad establecida en la Tanda (${tanda.monto} NEAR).`)
  }
  
  // Almacenamos los valores generales para registrar el contrato
  const cuentaId = context.sender;

  // Validamos que el usuario exista en la tanda
  const valido =  validarIntegrante(consultarIntegrantes(key), cuentaId);
  assert(valido, `El usuario ${cuentaId} no es integrante de la tanda`);

  const monto = context.attachedDeposit;
  assert(monto >  u128.Zero, 'El pago debe ser mayor a cero');

  // Creamos el objeto del pago
  const nuevoPago = new Pago(monto, getFechaActual());

  //*****************************/
  //SE AGREGÓ PARA EL REGISTRO EN LOS PERIODOS
  const pers = tandaPeriodos.get(key)
  assert(pers, `Los periodos para la tanda ${key} no están inicializados.`)

  //Si llega aquí es porque los periodos si están creados.
  if(pers){

    //Vamos a consultar a que periodo corresponde este pago
    const indice = validarPeriodo(key, context.sender)

    let msg = "";

    switch(indice){
      case -1: {
        msg = "Ya se realizaron todos los pagos correspondientes."
        break
      }
      case -2: {
        msg = "Los periodos de la Tanda no están inicializados."
        break
      }
      default: {
        break
      }
    }
    //Mandamos el error correspondiente en caso de que sea necesario
    assert(indice >= 0, `El usuario ${context.sender} no puede realizar pagos. ${msg}`)

    //Y con ese indice, agregamos la informacion que necesitamos
    //Es decir, ingresamos al integrante en la lista de integrantes que ya pagaron
    pers[indice].integrantesPagados.push(context.sender)
    //Y sumamos la cantidad que se pagó a la cantidad total de ese periodo
    pers[indice].cantidadRecaudada += <u64>parseInt(asNEAR(monto),10);

    //Y guardamos en la blockchain
    tandaPeriodos.set(key, pers)

    //Por último, llamamos al método que valida si ya se puede pagar esa Tanda.
    //En dado caso de que sí, cambiará el estado a verdadero.
    validarPagoTanda(key, indice)
  }
  //*****************************/

  // Consultamos el historial de pagos por el ID de la tanda para obtener el historial de los integrantes y sus pagos
  let historialPagoTanda = pagos.get(key);
  
  if (!historialPagoTanda) {
    logging.log(`El historial de pagos esta vacio`);

    //ahora creamos un nuevo mapa, este es el que esta adentro del persistent map
    let paymentMap = new Map<string, Array<Pago>>();

    //le mandamos como clave el que envia (context.sender) y el arreglo de pagos de arriba
    paymentMap.set(cuentaId, [nuevoPago]);

    // En caso de que no existan registros de pago de la tanda, se añade un nuevo registro completo
    pagos.set(key, paymentMap);
    logging.log(`Se instancio exitosamente el registro de pagos`);
    return true;
  }

  // Verificamos si esa tanda contiene al menos el registro de un pago
  if (historialPagoTanda.has(cuentaId)){
    // Obtenemos la lista de los pagos realizados de un integrante a una tanda
    let historialPagos = historialPagoTanda.get(cuentaId);
    // Si existen registros de pago, añadimos un nuevo pago al registro de pagos del integrante
    historialPagos.push(nuevoPago);
    logging.log(`Se añadio un nuevo pago de ${cuentaId.toString()} exitosamente`);
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
   assert(valido, `El integrante ${accountId} no es integrante de la tanda`);

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

// Esta función cambia el estado de la Tanda, si está inactiva, la activa y viceversa
export function cambiarEstadoTanda(key: string): Tanda | null {

  //El único dato que pedimos es la clave de la Tanda, si no lo recibimos, envíamos error
  assert(key != "", "El campo de clave no debe estar vacío.");

  //Y consultamos nuestra tanda en el PersistentMap
  let tanda = tandas.get(key);
  
  //Si existe...
  if(tanda){ 

    //Validamos primero que quien está ejecutando sea el creador de la tanda
    assert(tanda.creador == context.sender, "No cuentas con autorización para modificar esta Tanda");

    //Y después que la tanda no tenga 0 integrantes
    assert(tanda.integrantes.length > 0, "No se puede inicializar la Tanda sin integrantes.");

    //Ahora, dependiendo del estado, si está activa
    if(tanda.activa){
      //La desactivamos
      tanda.activa = false;
      //Y generamos la fecha final, la cual sería este momento.
      const date = datetime.block_datetime();
      tanda.fechaFinal = date.toString();

      //A partir de aquí, no deberías poder activar la tanda de nuevo.
    }
    //Ahora, si la tanda no estaba activa
    else{
      //Cambiamos el estado a verdadero
      tanda.activa = true;

      //Y generamos los días a sumar, que es la multiplicación del número de integrantes por el periodo.
      let dias_a_sumar = tanda.numIntegrantes * tanda.periodo;

      //Nos traemos la fecha desde la blockchain y le agregamos los días a sumar.
      //datetime.block_datetime() regresa una fecha de tipo PlainDateTime
      //Para mas información en la suma revisa:
      //https://tc39.es/proposal-temporal/docs/plaindatetime.html
      const date_added = datetime.block_datetime().add(new Duration(0,0,0,<i32>dias_a_sumar -1));

      //En estas líneas, convertimos la fecha de la blockhain a cadena, luego le quitamos el tiempo.
      //el toString regresa una fecha como la siguiente: 2021-10-14T04:16:46.716457589
      //Sin embargo, solo nos interesa la fecha, por lo que hacemos un split en base a la T
      //que es el componente del tiempo, y como split regresa un arreglo, pedimos el primer índice [0],
      //que sería nuestra cadena que contiene sólo la fecha como: 2021-10-14
      tanda.fechaInicio = datetime.block_datetime().toString().split('T')[0];
      //Lo mismo con la fecha final, pero usando la variable en la que hicimos la suma de días.
      tanda.fechaFinal = date_added.toString().split('T')[0];

    }

    //Sea lo que sea que hayamos hecho, guardamos en el PersistentMap con set
    tandas.set(tanda.id, tanda);
    //Y la regresamos para visualización en consola.
    return tandas.get(tanda.id);
  }
  //Este return es por si la Tanda no existía al inicio.
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

export function generarPeriodos(key: string): Array<Periodos> | null {
  //Primero, consultamos que la tanda exista, si no, mandamos un error
  const tanda = tandas.get(key)
  
  //Si la Tanda existe...
  if(tanda){

    //Consultamos que los periodos no estén inicializados
    const pers = tandaPeriodos.get(key)
    
    // Si no lo están...
    if(!pers){
      //Notificamos que se van a inicializar
      logging.log(`Inicializando periodos para Tanda: ${tanda.nombre}...`)

      //Creamos un nuevo arreglo de periodos
      let periodosTanda = new Array<Periodos>();

      assert(tanda.fechaInicio, `La tanda ${tanda.nombre} no tiene definida la fecha de inicio`);
      assert(tanda.fechaFinal, `La tanda ${tanda.nombre} no tiene definida la fecha de fin`);
      //Inicializamos el primer valor, este siempre va a ser la fecha de inicio de la Tanda
      let inicio = PlainDate.from(tanda.fechaInicio);

      //Y ciclamos n veces, siendo n el numero de integrantes definido en la Tanda
      for(let i = 0; i < <i32>tanda.numIntegrantes; i++){

        //Creamos la fecha del final de ciclo, sumandole el periodo pero restando un dia
        //Si sumaramos el periodo sin la resta, nos daria la fecha de inicio del siguiente ciclo.
        const finalCiclo = inicio.add(new Duration(0,0,0,<i32>tanda.periodo - 1))

        //Creamos nuestro objeto, mandando las cadenas de ambas fechas
        const per = new Periodos(inicio.toString(),finalCiclo.toString())

        //Lo metemos al arreglo
        periodosTanda.push(per)

        //Y definimos la fecha de inicio del siguiente ciclo
        inicio = finalCiclo.add(new Duration(0,0,0,1))
      }

      //Una vez que terminamos, tenemos nuestro arreglo, el cual ya podemos meter al mapa
      tandaPeriodos.set(key, periodosTanda)

      //Notificamos el final del proceso
      logging.log(`Se inicializaron los periodos para la Tanda: ${tanda.nombre}...`)

      //Y lo regresamos
      return periodosTanda
    }
    //Si ya estaban inicializados
    else{
      //Notificamos que ya existía este arreglo
      logging.log(`Los periodos para ${tanda.nombre} ya se encontraban inicializados.`)
      
      //Y los regresamos
      return pers
    }
  }
  //Este return es por si la Tanda no existía al inicio.
  return null
}

export function consultarPeriodos(key: string): Array<Periodos> | null {
  const pers = tandaPeriodos.get(key)
  return pers ? pers : null
}

export function escogerTurno(key: string, turno: i32): Array<Periodos> | null {
  //Validamos que la tanda exista
  assert(tandas.get(key), `La Tanda ${key} no existe.`)

  // Validamos que el usuario exista en la tanda
  const valido =  validarIntegrante(consultarIntegrantes(key), context.sender);
  assert(valido, `El usuario ${context.sender} no es integrante de la tanda`);

  //Consultamos que los periodos estén inicializados
  const pers = tandaPeriodos.get(key)

  //Si están inicializados
  if(pers){
    //Validamos que el turno que mandamos sea correcto
    //Es decir, necesitamos que el turno sea menor o igual a la cantidad de periodos de la Tanda
    //Y que sea mayor a cero
    assert(turno <= pers.length && turno > 0, `La tanda sólo contiene ${pers.length} espacios.`)

    //Y validamos que el turno no esté tomado.
    assert(pers[turno -1].usuarioTurno == '', `El turno ${turno} ya está tomado por ${pers[turno -1].usuarioTurno}`)

    //Si nada de lo de arriba falló, nos registramos en el índice correspondiente
    pers[turno -1].usuarioTurno = context.sender

    //Guardamos cambios en la blockchain
    tandaPeriodos.set(key, pers)

    //Notificamos que se realizó el cambio
    logging.log(`El usuario ${context.sender} ha tomado exitosamente el turno ${turno} en la Tanda.`)

    //Y regresamos los turnos
    return pers
  }
  else{
    //Si no están inicializados, se pide que se haga.
    logging.log(`Por favor, inicializa los periodos de la Tanda ${key}.`)
  }
  //Este return es por si la Tanda no existía al inicio.
  return null
}

//Esta funcion lo que regresa es el índice en el arreglo del primer periodo que encuentre
//que el usuario no ha pagado, para así, asignar el pago a ese periodo.
export function validarPeriodo(key: string, idCuenta: string = context.sender): i32 {

  //Consultamos que los periodos estén inicializados
  const pers = tandaPeriodos.get(key)//Vamos a validar que el usuario no haya pagado ya para ese periodo

  //Si no lo están, mandamos error.
  assert(pers, `Los periodos para la tanda ${key} no están inicializados.`)
  //Si lo están...
  if(pers){
    //Ciclamos en los periodos
    for(let i = 0; i < pers.length; i++){
      //Si no encuentra al integrante en la lista de integrantes que han pagado este periodo
      if(!validarIntegrante(pers[i].integrantesPagados, idCuenta)){
        //Regresamos el índice
        return i;

        //Y si no, seguimos en el ciclo hasta encontrar que periodo no ha pagado
      }
    }

    /* Ahora, este ciclo se realiza sólo si existen los periodos, es decir, si están inicializados.
     * Por lo que, si llegamos aquí, significa que iteró por todos los periodos y no encontró
     * una lista donde el integrante no estuviera. Por lo que podemos decir, que el integrante
     * ha realizado todos sus pagos.
     * 
     * Entonces, mostramos el siguiente mensaje, notificando que ya no es necesario hacer pagos
     */
    logging.log(`El integrante ya ha realizado todos los pagos para esta Tanda.`)
    //Y regresamos null, significando que ya no hay pagos por realizar.
    return -1
  }
  //Aquí nunca va a llegar...
  return -2
}

export function validarPagoTanda(key: string, indice: i32): bool {
  const tanda = tandas.get(key)
  assert(tanda, `La Tanda ${key} no existe.`)

  const pers = tandaPeriodos.get(key)
  assert(pers, `Los periodos de la Tanda ${key} no están inicializados.`)

  //Si ambos existen...
  if(tanda && pers){
    logging.log(`Validando si la tanda puede ser pagada...`)
    //Si en este periodo, la cantidad recaudada es igual a lo que se requiere
    //(en este caso el monto de la tanda multiplicado por los integrantes)
    //Y si ya todos los integrantes pagaron (si el registro de integrantes pagados
    //es igual a la cantidad de integrantes que debe tener la tanda)
    //Entonces decimos que los pagos ya se pueden realizar.
    if(pers[indice].cantidadRecaudada == tanda.monto * tanda.numIntegrantes && 
      pers[indice].integrantesPagados.length == tanda.numIntegrantes){
      pers[indice].pagosCompletos = true

      //Y guardamos en la blockchain
      tandaPeriodos.set(key, pers)
      return true
    }
    else{
      return false
    }
  }
  return false
}

//Funcion para pagar tanda.
export function pagarTanda(key: string, indice: i32): bool {
  //Se requiere el indice porque la estructura donde guardamos los periodos es un arreglo.
  //Por lo tanto, podria decirse que el periodo es igual al indice + 1.

  //Validando que la tanda exista y que los periodos estén inicializados...
  const tanda = tandas.get(key)
  assert(tanda, `La Tanda ${key} no existe.`)

  const pers = tandaPeriodos.get(key)
  assert(pers, `Los periodos de la Tanda ${key} no están inicializados.`)

  //Si ambos lo están...
  if(tanda && pers){
    //Si no se puede pagar mandamos el error...
    assert(pers[indice].pagosCompletos == true, `Este periodo aún no puede ser pagado.`)

    //Validamos que la flag de los pagos completos sea verdadera.
    if(pers[indice].pagosCompletos == true){

      //Notificamos sobre el proceso...
      logging.log(`Validando que este periodo pueda ser pagado...`)

      //Si no hay usuario en turno (por alguna razon) no podemos hacer una transferencia.
      assert(pers[indice].usuarioTurno != '', `No hay usuario en turno en este periodo.`)

      //Hacemos la conversión para que nos la acepte el método, usando la cantidad recaudada.
      const montoTransferencia = u128.mul(ONE_NEAR, u128.from(pers[indice].cantidadRecaudada))

      //E iniciamos la promesa de pago, usando el usuario en turno y la conversión de arriba.
      ContractPromiseBatch.create(pers[indice].usuarioTurno).transfer(montoTransferencia)

      //Y notificamos de éxito.
      logging.log(`La Tanda fue pagada exitosamente. El usuario ${pers[indice].usuarioTurno}
      recibió ${pers[indice].cantidadRecaudada} NEAR correspondientes al periodo #${indice + 1}
      de la Tanda ${tanda.nombre} con fecha ${getFechaActual()}`)

      //Por último, modificamos la flag de que la tanda ya está pagada
      pers[indice].tandaPagada = true

      //Y guardamos en la blockchain. Este periodo ya fue pagado
      tandaPeriodos.set(key, pers)

      //Y regresamos que fue pagada
      return true
    }
  }
  //Obviamente si algo de arriba no existió retorna falso
  return false
}