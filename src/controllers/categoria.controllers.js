let mysql = require('mysql');
const { promisify } = require('util')
var config_mysql = require('../config_mysql.js')

// Autor: Jonatan Pacora Vega
// 02/11/22
/* el codigo aqui es permite listar
 las categorias habilitadas*/
export const getCategorias = async (req, res) => {
  try {
    let sql = `CALL sp_obtener_categorias_habilitado()`;
    const pool = mysql.createPool(config_mysql)
    const promiseQuery = promisify(pool.query).bind(pool)
    const promisePoolEnd = promisify(pool.end).bind(pool)
    const result = await promiseQuery(sql)
    promisePoolEnd()
    const categorias = Object.values(JSON.parse(JSON.stringify(result[0])));
    return res.json(
      {
        status: 200,
        message: "Se ha obtenido las categorias habilitadas",
        data: categorias
      }
    );
  } catch (error) {
    console.log(error)
    return res.json(
      {
        status: 500,
        message: "Se ha producido un ERROR al obtener las categorias",
      }
    );
  }
}
/* el codigo aqui  permite listar
 las categorias inhabilitadas*/
export const getCategoriasInhabilitadas = async (req, res) => {
  try {
    let sql = `CALL sp_obtener_categorias_inhabilitadas()`;
    const pool = mysql.createPool(config_mysql)
    const promiseQuery = promisify(pool.query).bind(pool)
    const promisePoolEnd = promisify(pool.end).bind(pool)
    const result = await promiseQuery(sql)
    promisePoolEnd()
    const categorias = Object.values(JSON.parse(JSON.stringify(result[0])));
    return res.json(
      {
        status: 200,
        message: "Se ha obtenido las categorias inhabilitadas",
        data: categorias
      }
    );
  } catch (error) {
    console.log(error)
    return res.json(
      {
        status: 500,
        message: "Se ha producido un ERROR al obtener las categorias iii",
      }
    );
  }



}
// Autor: Jonatan Pacora Vega
// 03/11/22
/* el codigo aqui es usado para el
 CUS de buscar una categorias por su codigo*/
export const getCategoriaByCode = async (req, res) => {
  try {
    const { codigo } = req.params;

    let sql = `CALL sp_obtener_categoria_por_code('${codigo}')`;
    const pool = mysql.createPool(config_mysql)
    const promiseQuery = promisify(pool.query).bind(pool)
    const promisePoolEnd = promisify(pool.end).bind(pool)
    const result = await promiseQuery(sql)

    promisePoolEnd()
    const categoria = Object.values(JSON.parse(JSON.stringify(result[0])));
    return res.json(
      {
        status: 200,
        message: "Se ha obtenido la categoria solicitada",
        data: categoria
      }
    );
  } catch (error) {
    console.log(error)
    return res.json(
      {
        status: 500,
        message: "Se ha producido un ERROR al obtener la categoria by code",
        error
      }
    );
  }

}
/* el codigo aqui es usado para el
 poder mostrar las categorias  en el checkbox*/
export const getCategoriaByName = async (req, res) => {
  try {
    const { name } = req.params;

    let sql = `CALL sp_obtener_categoria_por_nombre('${name}')`;
    const pool = mysql.createPool(config_mysql)
    const promiseQuery = promisify(pool.query).bind(pool)
    const promisePoolEnd = promisify(pool.end).bind(pool)
    const result = await promiseQuery(sql)

    promisePoolEnd()
    const categoria = Object.values(JSON.parse(JSON.stringify(result[0])));
    return res.json(
      {
        status: 200,
        message: "Se ha obtenido la categoria solicitada",
        data: categoria
      }
    );
  } catch (error) {
    console.log(error)
    return res.json(
      {
        status: 500,
        message: "Se ha producido un ERROR al obtener la categoria by name",
        error
      }
    );
  }
}
// Autor: Jonatan Pacora Vega
// 01/11/22
/* el codigo aqui es usado para el
 CUS registrar a una categorias*/
export const createCategoria = async (req, res) => {
  try {
    const {
      codigo,
      nombre,
      id_usuario
    } = req.body;

    let sql = `CALL sp_generar_categoria('${codigo}','${nombre}','${id_usuario}')`;
    const pool = mysql.createPool(config_mysql)
    const promiseQuery = promisify(pool.query).bind(pool)
    const promisePoolEnd = promisify(pool.end).bind(pool)
    const result = await promiseQuery(sql)

    promisePoolEnd()
    const categoria = Object.values(JSON.parse(JSON.stringify(result[0])));
    return res.json(
      {
        status: 200,
        message: "Se ha obtenido creado la categoria ",
        data: categoria
      }
    );
  } catch (error) {
    console.log(error)

    return res.json(
      {
        status: 500,
        message: "Se ha producido un ERROR al crear la categoria",
        error
      }
    );
  }
}
// Autor: Jonatan Pacora Vega
// 04/11/22
/* el codigo aqui es usado para modificar el ESTADO DE LA CATEGORIA
no se modifica otro campo*/
/* el codigo aqui permite dar de baja a una categoria*/

export const updateCategoriaInhabilitar = async (req, res) => {
  try {
    const {_id} = req.params;

    let sql = `CALL sp_actualizar_categoria_inhabilitar('${_id}')`;
    const pool = mysql.createPool(config_mysql)
    const promiseQuery = promisify(pool.query).bind(pool)
    const promisePoolEnd = promisify(pool.end).bind(pool)
    const result = await promiseQuery(sql)

    promisePoolEnd()
    const categoria = Object.values(JSON.parse(JSON.stringify(result[0])));
    return res.json(
      {
        status: 200,
        message: "Se ha inhabilitado la categoria",
        data: categoria
      }
    );
  } catch (error) {
    console.log(error)
    return res.json(
      {
        status: 500,
        message: "Se ha producido un ERROR al dar de baja a la categoria",
        error
      }
    );
  }

}

/* el codigo aqui permite dar de Alta a una categoria*/
export const updateCategoriaHabilitar = async (req, res) => {
  try {
    const {_id} = req.params;

    let sql = `CALL sp_actualizar_categoria_habilitar('${_id}')`;
    const pool = mysql.createPool(config_mysql)
    const promiseQuery = promisify(pool.query).bind(pool)
    const promisePoolEnd = promisify(pool.end).bind(pool)
    const result = await promiseQuery(sql)

    promisePoolEnd()
    const categoria = Object.values(JSON.parse(JSON.stringify(result[0])));
    return res.json(
      {
        status: 200,
        message: "Se ha habilitado la categoria",
        data: categoria
      }
    );
  } catch (error) {
    console.log(error)
    return res.json(
      {
        status: 500,
        message: "Se ha producido un ERROR al dar de alta a la categoria",
        error
      }
    );
  }


}