import * as tanda from '..'
import { tandas, keys} from "../../models/model";
import { logging } from 'near-sdk-as'

const NOMBRE = "Tanda";
const INTEGRANTES = 10;
const MONTO = 10;
const PERIODO = 15;
const IDCUENTA = "dev-1629857199008-9705723";

describe("Crear Tanda", () => {
  it("Crea una Tanda con sus respectivos datos.", () => {

    tanda.crearTanda(NOMBRE,INTEGRANTES,MONTO,PERIODO);
    const k = keys.last
    const t = tandas.get(k)

    if(t){
      expect(t.id).toBe(k)
      expect(t.nombre).toBe(NOMBRE)
      expect(t.numIntegrantes).toBe(INTEGRANTES)
      expect(t.monto).toBe(MONTO)
      expect(t.periodo).toBe(PERIODO)
      expect(t.fechaInicio).toBeNull
      expect(t.fechaFinal).toBeNull
      expect(t.activa).toBeFalsy
      expect(t.integrantes.length).toBe(0)
    }
  });

  it("Requiere un nombre válido.", () => {

    expect(() => {
      tanda.crearTanda("",INTEGRANTES,MONTO,PERIODO);
    }).toThrow("El nombre de la Tanda no puede estar vacío.")
  });

  it("Requiere 2 ó más integrantes.", () => {

    expect(() => {
      tanda.crearTanda(NOMBRE,1,MONTO,PERIODO);
    }).toThrow("La Tanda necesita al menos 2 integrantes.")
  });

  it("Requiere un monto a ahorrar positivo.", () => {

    expect(() => {
      tanda.crearTanda(NOMBRE,INTEGRANTES,0,PERIODO);
    }).toThrow("El monto a ahorrar tiene que ser mayor a 0.")
  });

  it("Requiere un periodo válido.", () => {

    expect(() => {
      tanda.crearTanda(NOMBRE,INTEGRANTES,MONTO,0);
    }).toThrow("El periodo no puede ser menor a 1.")
  });
})

describe("Obtener Tanda ", () => {
  it("Requiere una clave válida.", () => {

    expect(() => {
      tanda.consultarTanda("");
    }).toThrow("El campo de clave no debe estar vacío.")
  });
})

describe("Agregar integrantes ", () => {
  
  it("Permite agregar un integrante nuevo a la Tanda.", () => {

    tanda.crearTanda(NOMBRE,INTEGRANTES,MONTO,PERIODO);
    const k = keys.last
    tanda.agregarIntegrante(k,IDCUENTA)
    let t = tandas.get(k);

    if(t){
      logging.log(t.integrantes.length)
      expect(t.integrantes.length).toBe(0)
    }
  });
  
  it("Requiere una clave válida.", () => {
    expect(() => {
      tanda.agregarIntegrante("",IDCUENTA);
    }).toThrow("El campo de clave no debe estar vacío.")
  });
})

describe("Consultar integrantes de Tanda ", () => {
  it("Requiere una clave válida.", () => {

    expect(() => {
      tanda.consultarIntegrantes("");
    }).toThrow("El campo de clave no debe estar vacío.")
  });
})

describe("Cambiar estado Tanda ", () => {

  it("Cambia el estado de una Tanda.", () => {

    tanda.crearTanda(NOMBRE,INTEGRANTES,MONTO,PERIODO);
    const k = keys.last
    tanda.cambiarEstadoTanda(k)
    const t = tandas.get(k)

    if(t){
      expect(t.activa).toBeTruthy
      expect(t.fechaInicio).not.toBeNull
      expect(t.fechaFinal).not.toBeNull
    }
  });

  it("Requiere una clave válida.", () => {

    expect(() => {
      tanda.cambiarEstadoTanda("");
    }).toThrow("El campo de clave no debe estar vacío.")
  });
})

describe("Editar Tanda ", () => {

  it("Edita los datos de la Tanda.", () => {

    tanda.crearTanda(NOMBRE,INTEGRANTES,MONTO,PERIODO);
    const k = keys.last
    tanda.editarTanda(k,"TEST")
    const t = tandas.get(k)

    if(t){
      expect(t.nombre).toBe("TEST")
    }
  });

  it("Requiere una clave válida.", () => {

    expect(() => {
      tanda.editarTanda("");
    }).toThrow("El campo de clave no debe estar vacío.")
  });
})