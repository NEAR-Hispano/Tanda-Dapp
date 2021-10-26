import { logging, context, datetime, MapEntry, u128, ContractPromiseBatch } from 'near-sdk-as'
import { tandas, keys, Tanda, Integrante, Pago, Usuario, usuarios, pagos, tandaPeriodos, Periodos} from "../models/model";
import { Duration , PlainDate } from 'assemblyscript-temporal';
import { AccountId, asNEAR, MAX_PAGE_SIZE, ONE_NEAR, periodos, getFechaActual} from './utils';

/**
 * Método del smart contract para registrar una nueva tanda.
 * El comando para utilizarlo en la terminal es:
 *  >> near call $ACCOUNT_ID crearTanda '{"nombreTanda": "nombre", "integrantes": "numero de integrantes", "monto": "monto de la aportación", "periodo": 7 | 15 | 30}' --accountId tucuenta.testnet
 *    * $ACCOUNT_ID es una variable que contiene el id de la cuenta del contrato
 * 
 * @param nombreTanda string que contiene el nombre de la tanda a registrar
 * @param integrantes string con valor numérico que contiene la cantidad de integrantes para los que estará abierta la tanda
 * @param monto string valor numérico del monto de las aportaciones periódicas en la tanda
 * @param periodo enum numérico donde 7=Semanal, 15=Quincenal y 30=Mensual
 */
export function crearTanda(nombreTanda: string, integrantes:  u64, monto: u64, periodo: i32): Tanda{
  
  //Validamos que los parámetros enviados sean correctos

  /* Tecnicamente podría ir vacío, no hay ningún método que requiera el nombre.
   * Sin embargo, dado a que esto será mostrado al usuario, es mejor que 
   * desde el inicio se tenga asignado el nombre.
   */
  assert(nombreTanda != "", "El nombre de la Tanda no puede estar vacío.");

  // Toda tanda necesita al menos 2 integrantes.
  assert(integrantes >= 2, "La Tanda necesita al menos 2 integrantes.");

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

  //Llamamos a la función que genera los periodos
  generarPeriodos(tanda.id);

  //Regresamos la Tanda
  return tanda
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

/**
 * Método interno que retorna los objetos del arreglo de claves de tanda que se le envíe
 * @param listaTandas lista de claves de Tanda en string
 * @returns Array<Tanda | null> | null
 */
function buscarTandas(listaTandas: Array<string>): Array<Tanda | null> | null{
    let result = new Array<Tanda | null>();

    for (let i = 0; i < listaTandas.length; i++) {
      result.push(tandas.get(listaTandas[i]));
    }
    return result;
}

/**
 * Método que retorna las n últimas tandas.
 * n siendo el valor que está en la variable MAX_PAGE_SIZE
 * El comando para utilizarlo en la terminal es:
 *  >> near view $ACCOUNT_ID consultarTandas '{}'
 *  @returns Array<Tanda | null>
 */
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

/**
 * Método que retorna todas las tandas registradas en el contrato.
 * El comando para utilizarlo en la terminal es:
 *  >> near view $ACCOUNT_ID consultarTandasTodas '{}'
 * @returns Array<Tanda | null>
 */
export function consultarTandasTodas(): Array<Tanda | null>{
  //Declaramos nuestro objeto de arreglo
  let result = new Array<Tanda | null>();

  //E iteramos, llenando así nuestro arreglo.
  for (let i = 0; i < keys.length; i++) {
    result.push(tandas.get(keys[i]));
  }
  return result;
}

/**
 * Método que retorna una tanda específica
 * El comando para utilizarlo en la terminal es:
 *  >> near view $ACCOUNT_ID consultarTanda '{"key":"00000000"}'
 * @param key string del id de una Tanda
 * @returns Array<Tanda | null>
 */
export function consultarTanda(key: string): Tanda | null {
  //Simplemente invocamos el error si la clave está vacía
  assert(key != "","El campo de clave no debe estar vacío.");
  return tandas.get(key);
}

/**
 * Método que agrega un integrante a una tanda si este no es parte de dicha tanda.
 * El comando para utilizarlo en la terminal es:
 *  >> near call $ACCOUNT_ID agregarIntegrante '{"key":"00000000"}' --account_id tucuenta.testnet
 * @param key string del id de una Tanda
 */
export function agregarIntegrante(key: string): void {

  //El id de la cuenta será quien invoca el método
  const accountId = context.sender
  //Validando inputs
  assert(key != "", "El campo de clave no debe estar vacío.");
  
  //Ahora veremos si el integrante ya está en la tanda.
  const valido =  validarIntegrante(consultarIntegrantes(key), accountId);

  //La función de arriba regresa true si encontró al usuario en la tanda.
  //Por lo que necesitamos que valido sea falso, es decir, que no lo haya encontrado.
  assert(!valido, `El usuario ${accountId} ya es integrante de la tanda`);

  //Creamos un nuevo objeto de tipo integrante.
  const integrante = new Integrante(accountId);

  //Y consultamos la tanda para poder invocar sus métodos
  const tanda = tandas.get(key);
  //Si existió, llamamos al método de agregar integrante, enviando como parámetro
  //el objeto que acabamos de crear.
  if (tanda){
    tanda.agregarIntegrante(integrante);

    //Y por último, llamamos a la función que registra como usuario de la Tanda a quien invocó el método.
    registrarUsuario(accountId, key, false);
  }
} 

/**
 * Método que retorna la lista de cuentas de los integrantes que están registrados en una tanda.
 * El comando para utilizarlo en la terminal es:
 *  >> near view $ACCOUNT_ID consultarIntegrantes '{"key":"00000000"}'
 * @param key string del id de una Tanda, no puede estar vacío.
 * @returns Array<string> | null
 */
export function consultarIntegrantes(key: string): Array<string> | null {

  //Validamos inputs
  assert(key != "", "El campo de clave no debe estar vacío.");

  //Obtenemos la Tanda y validamos su existencia
  const tanda = tandas.get(key);
  assert(tanda, `La Tanda ${key} no existe`);

  if (tanda){
    //Guardamos la lista de tipo Integrantes en una variable
    const integrantes = tanda.consultarIntegrantes();
  
    //Y creamos el objeto que vamos a regresar, un arreglo dinámico.
    const result = new Array<string>();

    //Ahora, ciclaremos por la lista de integrantes
    for(let i = 0; i < integrantes.length; i++) {
      //Y vamos a regresar solo el id de la cuenta, por lo que lo guardamos en el resultado
      result.push(integrantes[i].accountId);
    }
    //Regresamos dicho resultado
    return result;
  }
  //Si no existía la tanda...
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
 * Actualiza historiales de pago y periodos de la tanda.
 * @param key string que contiene la key de una tanda
 * @returns bool True si el pago fue añadido exitosamente, False en caso contrario
 */
export function agregarIntegrantePago(key: string): bool {
  // Consultamos que el ID de la tanda enviado exista
  const tanda = tandas.get(key);
  assert(tanda, `La Tanda ${key} no existe`);

  const monto = context.attachedDeposit;

  //Si el pago no es por la cantidad establecida en la Tanda, lo rechazamos
  if(tanda){
    assert(monto == u128.mul(ONE_NEAR, u128.from(tanda.monto)),
    `Sólo se pueden realizar pagos por la cantidad establecida en la Tanda (${tanda.monto} NEAR).`)
  }
  
  // Almacenamos los valores generales para registrar el contrato
  const cuentaId = context.predecessor;

  // Validamos que el usuario exista en la tanda
  const valido =  validarIntegrante(consultarIntegrantes(key), cuentaId);
  assert(valido, `El usuario ${cuentaId} no es integrante de la tanda`);

  
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
    const indice = validarPeriodo(key, cuentaId)

    let msg = "";

    //En base a lo que regrese validarPeriodo escogemos el mensaje que agregaremos al error (si aplica).
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
    assert(indice >= 0, `El usuario ${cuentaId} no puede realizar pagos. ${msg}`)

    //Y con ese indice, agregamos la informacion que necesitamos
    //Es decir, ingresamos al integrante en la lista de integrantes que ya pagaron
    pers[indice].integrantesPagados.push(cuentaId)
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

    //le mandamos como clave el que envia (cuentaId) y el arreglo de pagos de arriba
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

/**
 * Método para consultar los pagos realizados por un integrante específico a una tanda.
 * @param key string que contiene la key de una tanda
 * 
 * @param accountId string que contiene la cuenta de un usuario.
 * En caso de no especificarse, se utiliza la cuenta de quien invoca el método.
 * 
 * @returns Array<Pago> Un arreglo de tipo Pago con todos los pagos realizados por dicho integrante.
 */
export function consultarIntegrantePagos(key: string, accountId: string = context.sender): Array<Pago>  {
  
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

/**
 * Método que retorna una lista con todos los pagos realizados en el contrato de Tanda.
 * 
 * @returns MapEntry<string, Map<string, Array<Pago>>>[] 
 * Un arreglo de objetos, separado por Tandas, y a su vez, separado por usuario.
 */
export function consultarPagos(): MapEntry<string, Map<string, Array<Pago>>>[]  {
  // Traer todos los pagos registrados en la red de NEAR
  return pagos.entries();
 }

/**
 * Método que activa una Tanda y regresa la Tanda en caso de que el cambio haya sido efectuado.
 * 
 * @returns Tanda | null Si encontró la tanda y se hizo un cambio, la regresa.
 * En caso contrario, retorna null
 */
export function activarTanda(key: string): Tanda | null {
  //El único dato que pedimos es la clave de la Tanda, si no lo recibimos, envíamos error
  assert(key != "", "El campo de clave no debe estar vacío.");

  //Y consultamos nuestra tanda en el PersistentMap
  let tanda = tandas.get(key);

  //Validamos que exista la tanda
  assert(tandas.get(key), `La Tanda ${key} no existe.`)

  if(tanda){
    //Validamos que el creador es el que llama al método
    assert(tanda.creador == context.sender, 'No cuentas con autorización para modificar esta Tanda');

    //Si ya está activa no se puede cambiar el estado
    assert(!tanda.activa, `La Tanda ${key} ya se encuentra activa.`)

    //Validamos que ya estén todos los integrantes
    assert(tanda.numIntegrantes == tanda.integrantes.length, 
      `La Tanda sólo tiene ${tanda.integrantes.length} integrantes. Es necesario que todos los 
      integrantes (${tanda.numIntegrantes}) estén registrados para activarla. \n
      Hacen falta ${tanda.numIntegrantes - tanda.integrantes.length} integrantes.`)
    
    //Si pasamos por todo esto podemos empezar a hacer los cambios.
    

    //Y se necesita validar si es necesario editar las fechas de los periodos
    const fechaHoy = datetime.block_datetime().toString().split('T')[0];

    //Si la fecha de inicio no es igual a la fecha de este momento
    if(tanda.fechaInicio != fechaHoy){
      //Corregimos las fechas en el objeto Tanda
      tanda.fechaInicio = datetime.block_datetime().toString().split('T')[0];
      tanda.fechaFinal = datetime.block_datetime().add(new Duration(0,0,0,<i32>(tanda.numIntegrantes * tanda.periodo) -1)).toString().split('T')[0];

      //Lo escribimos en la blockchain
      tandas.set(key, tanda)

      //Y llamamos a la función para regenerar periodos
      regenerarPeriodos(key)

      tanda.activa = true;
      tanda.estado = 'Activa'
      tandas.set(key, tanda)
    }
    //Si las fechas fueron iguales, sólo guardamos el cambio en el estado.
    else{
      tanda.activa = true;
      tanda.estado = 'Activa'
      tandas.set(key, tanda)
    }
    //Si todo sale bien, podemos regresar la Tanda para validar la información.
    return tanda
  }
  //Si la tanda no existía...
  return null
}

/**
 * Método que corrige las fechas que se generaron en los periodos, 
 * Sin modificar ninguna otra propiedad de los mismos.
 * 
 * @param key string conteniendo la clave de una tanda
 * @returns Array<Periodos> | null Si encontró la tanda y se hizo un cambio, regresa los periodos.
 * En caso contrario, retorna null
 */
 function regenerarPeriodos(key: string): Array<Periodos> | null {
  //Validamos que la Tanda y los periodos existan
  assertTandaPeriodos(key)

  //Obtenemos los periodos y la tanda para empezar a modificarlos
  let pers = tandaPeriodos.get(key)
  const tanda = tandas.get(key)

  if(tanda && pers){

    //Y claro, si somos el propietario de la tanda
    assert(tanda.creador == context.sender, 'No cuentas con autorización para modificar esta Tanda');

    //Comenzamos el proceso tomando la fecha de inicio de la Tanda
    let inicioCiclo = PlainDate.from(tanda.fechaInicio);

    //Y ciclamos por los periodos
    for(let i = 0; i < pers.length; i++){
      //Definimos el nuevo valor del inicio
      pers[i].inicio = inicioCiclo.toString()

      //Y creamos la nueva fecha para el final del ciclo
      const finalCiclo = inicioCiclo.add(new Duration(0,0,0,<i32>tanda.periodo - 1))

      //Definimos el nuevo valor
      pers[i].final = finalCiclo.toString()

      //Y por último, creamos el nuevo valor de inicio del siguiente ciclo
      inicioCiclo = finalCiclo.add(new Duration(0,0,0,1))
    }

    //Una vez que terminemos, deberíamos tener todas las fechas correctas
    //Todo esto sin modificar los turnos ya seleccionados.
    tandaPeriodos.set(key, pers)

    //Y regresamos los periodos nuevos
    return pers
  }
  //Nunca debería de llegar aquí porque se validó arriba, pero por si a caso.
  return null
}

/**
 * Método que valida los datos de la tanda y manda errores.
 * Básicamente es sólo para no estar reescribiendo las mismas validaciones.
 * 
 * @param key string conteniendo la clave de una tanda
 * En caso contrario, retorna null
 */
function assertTandaPeriodos(key: string): void {
  //El único dato que pedimos es la clave de la Tanda, si no lo recibimos, envíamos error
  assert(key != "", "El campo de clave no debe estar vacío.");

  //Validamos que exista la tanda
  assert(tandas.get(key), `La Tanda ${key} no existe.`)

  //Validamos que tenga sus periodos inicializados
  assert(tandaPeriodos.get(key), `Los periodos para la Tanda ${key} no están inicializados.`)
}

/**
 * Método para editar datos de la Tanda
 * 
 * @param key string conteniendo la clave de una tanda. No se puede cambiar.
 * 
 * @param nombreTanda string para cambiar el nombre de la Tanda. Siempre se puede cambiar.
 * 
 * Las siguientes propiedades sólo se pueden modificar si la Tanda no está activa y si no tiene integrantes.
 * @param integrantes número sin signo conteniendo la cantidad de integrantes que se desea que entren a la tanda.
 * @param monto número sin signo conteniendo la cantidad que se va a ahorrar.
 * @param periodo número que indica el periodo en el que se estará ahorrando.
 * @param fechaInicio string que contiene una nueva fecha de inicio en formato AAAA-MM-DD
 * 
 * @returns Tanda | null Si encontró la tanda y se hizo un cambio, la regresa.
 * En caso contrario, retorna null
 */
export function editarTanda(
  key: string, 
  nombreTanda: string = "",
  integrantes:  u64 = 0,
  monto: u64 = 0,
  periodo: u64 = 0,
  fechaInicio: string = ""): Tanda | null {

  //Validando inputs
  assert(key != "", "El campo de clave no debe estar vacío.");

  let tanda = tandas.get(key);

  //Validamos que exista la tanda
  assert(tanda, `La Tanda ${key} no existe.`)

  if(tanda){
    //Ahora, necesitamos validar varias cosas. Primero, que sea el owner quien está mandando el cambio.
    assert(tanda.creador == context.sender, 'No cuentas con autorización para modificar esta Tanda');

    //La única propiedad que siempre se puede cambiar es el nombre.
    tanda.nombre = nombreTanda || nombreTanda;

    //Las demás propiedades se cambian sólo si la Tanda no está activa y si no tiene integrantes.
    if (!tanda.activa && tanda.integrantes.length == 0) {

      //Intentamos hacer los cambios.
      tanda.numIntegrantes = integrantes || tanda.numIntegrantes;
      tanda.monto = monto || tanda.monto;
      tanda.periodo = periodo || tanda.periodo;
      tanda.fechaInicio = fechaInicio || tanda.fechaInicio; 

      //Validamos los cambios
      assert(tanda.numIntegrantes > 2, `Número de integrantes no válido`)
      assert(tanda.monto > 0, `Monto a ahorrar no válido`)
      assert(tanda.periodo == 7 || periodo == 15 || periodo == 30, `Periodo para ahorrar no válido`)
      assert(PlainDate.from(tanda.fechaInicio), `Fecha de inicio no válida.`)

      //Es decir, como el método genera datos predeterminados si no enviamos nada,
      //tenemos que ver que los cambios que el usuario está intentando hacer son válidos.
      //Si alguno no lo fue, entonces tendrá un error, y esos cambios no se escriben en la blockchain.
    }

    //Si todo sale bien, ahora sí podemos escribir en la blockchain.
    tandas.set(tanda.id, tanda);
    return tandas.get(tanda.id);
  }
  return null;
}

/**
 * Método que valida si una tanda puede ser cancelada y de ser así la cancela.
 * 
 * @param key string conteniendo la clave de una tanda
 * @returns Tanda | null Si encontró la tanda y se hizo un cambio, la regresa.
 * En caso contrario, retorna null
 * 
 * Esta opción es por si la persona no juntó los integrantes necesarios para activar una tanda.
 */
export function cancelarTanda(key: string): Tanda | null{
  let tanda = tandas.get(key)

  //Validamos que exista la tanda
  assert(tanda, `La Tanda ${key} no existe.`)

  //El resto de validaciones las hacemos sólo si la tanda existe.
  if(tanda){
    //Validamos que el creador es el que llama al método
    assert(tanda.creador == context.sender, 'No cuentas con autorización para modificar esta Tanda');

    //Si la está activa, no se puede cancelar.
    assert(consultarTandaPagos(key), `Esta Tanda ya se encuentra en progreso, no se puede cancelar.`)

    //La desactivamos
    tanda.activa = false

    //Y actualizamos el estado
    tanda.estado = 'Cancelada'

    //Escribimos los datos en la blockchain y la regresamos.
    tandas.set(key, tanda)
    return tanda
  }
  //Si no encontró la Tanda...
  return null
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

export function escogerTurno(key: string, numTurno: u64): Array<Periodos> | null {
  //Validamos que la tanda exista
  assert(tandas.get(key), `La Tanda ${key} no existe.`)

  // Validamos que el usuario exista en la tanda
  const valido =  validarIntegrante(consultarIntegrantes(key), context.sender);
  assert(valido, `El usuario ${context.sender} no es integrante de la tanda`);

  //Consultamos que los periodos estén inicializados
  const pers = tandaPeriodos.get(key)

  //Si están inicializados
  if(pers){
    const turno = <i32>numTurno;
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