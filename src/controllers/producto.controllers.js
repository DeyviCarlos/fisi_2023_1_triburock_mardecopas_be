let mysql = require('mysql');
const { promisify } = require('util')
var config_mysql = require('../config_mysql.js')
import * as categoriasCtrl from '../controllers/categoria.controllers';

// Autor: Anderson Salazar
// 27/10/22
/* el codigo aqui es usado para obtenera a los productos habilitados*/

export const getProductos = async (req, res) => {
     try {
      let sql = `CALL sp_obtener_productos_habilitado()`;
      const pool = mysql.createPool(config_mysql)
      const promiseQuery = promisify(pool.query).bind(pool)
      const promisePoolEnd = promisify(pool.end).bind(pool)
      const result = await promiseQuery(sql)
      promisePoolEnd()
      const productos = Object.values(JSON.parse(JSON.stringify(result[0])));



      return res.json(
        {
          status: 200,
          message: "Se ha obtenido los productos habilitadas",
          data: productos
        }
      );
    } catch (error) {
      console.log(error)
      return res.json(
        {
          status: 500,
          message: "Se ha producido un ERROR al obtener los productos habilitados",
        }
      );
    }
}
/* el codigo aqui es usado para obtenera a los productos inhabilitados*/
// Autor: Anderson Salazar
// 24/11/22
/* Agregamos codigo de status 404 para los errores de no encontrarse los productos*/
export const getProductosInhabilitados = async (req, res) => {
  try {
    let sql = `CALL sp_obtener_productos_inhabilitados()`;
    const pool = mysql.createPool(config_mysql)
    const promiseQuery = promisify(pool.query).bind(pool)
    const promisePoolEnd = promisify(pool.end).bind(pool)
    const result = await promiseQuery(sql)
    promisePoolEnd()
    const productos = Object.values(JSON.parse(JSON.stringify(result[0])));
    return res.json(
      {
        status: 200,
        message: "Se ha obtenido los productos inhabilitadas",
        data: productos
      }
    );
  } catch (error) {
    console.log(error)
    return res.json(
      {
        status: 500,
        message: "Se ha producido un ERROR al obtener los productos inhabilitados",
      }
    );
  }
}
// Autor: Anderson Salazar
// 24/11/22
// HU- Listar productos con bajo stock
/* Agregamos codigo de status 404 para los errores de no encontrarse los productos*/
export const getProductoByStockMinimo= async (req, res) => {
  try {
    let sql = `CALL sp_obtener_producto_por_stock_minimo()`;
    const pool = mysql.createPool(config_mysql)
    const promiseQuery = promisify(pool.query).bind(pool)
    const promisePoolEnd = promisify(pool.end).bind(pool)
    const result = await promiseQuery(sql)
    promisePoolEnd()
    const productos = Object.values(JSON.parse(JSON.stringify(result[0])));
    return res.json(
      {
        status: 200,
        message: "Se ha obtenido los productos con stock minimo alcanzado",
        data: productos
      }
    );
  } catch (error) {
    console.log(error)
    return res.json(
      {
        status: 500,
        message: "Se ha producido un ERROR al obtener los productos con stock minimo alcanzado",
      }
    );
  }
}
/* el codigo aqui es usado para obtener un producto por su codigo*/
// Autor: Anderson Salazar
// 24/11/22
/* Agregamos codigo de status 404 para los errores de no encontrarse los productos*/
export const getProductoByCode = async (req, res) => {
  try {
    const { codigo } = req.params;

    let sql = `CALL sp_obtener_producto_por_code('${codigo}')`;
    const pool = mysql.createPool(config_mysql)
    const promiseQuery = promisify(pool.query).bind(pool)
    const promisePoolEnd = promisify(pool.end).bind(pool)
    const result = await promiseQuery(sql)

    promisePoolEnd()
    const producto = Object.values(JSON.parse(JSON.stringify(result[0])));
    const id_categoria= producto[0].id_categoria
    console.log(id_categoria);
    let sql3 = `CALL sp_obtener_categoria_por_id('${id_categoria}')`;
    const pool3 = mysql.createPool(config_mysql)
    const promiseQuery3 = promisify(pool3.query).bind(pool3)
    const promisePoolEnd3 = promisify(pool3.end).bind(pool3)
    const result3 = await promiseQuery3(sql3)
    promisePoolEnd3()
    const infoCategoria = JSON.parse(JSON.stringify(result3[0]));
    const nombreCategoria= infoCategoria[0].nombre;    
    producto[0]["categoria"]=nombreCategoria;
    return res.json(
      {
        status: 200,
        message: "Se ha obtenido el producto solicitado por codigo",
        data:producto
      }
    );
  } catch (error) {
    console.log(error)
    return res.json(
      {
        status: 500,
        message: "Se ha producido un ERROR al obtener el producto by code",
        error
      }
    );
  }
}
/* el codigo aqui es usado para obtener un producto por su id*/
export const getProductoById = async (req, res) => {
  try {
    const {_id} = req.params;

    let sql = `CALL sp_obtener_producto_por_id('${_id}')`;
    const pool = mysql.createPool(config_mysql)
    const promiseQuery = promisify(pool.query).bind(pool)
    const promisePoolEnd = promisify(pool.end).bind(pool)
    const result = await promiseQuery(sql)

    promisePoolEnd()
    const producto = Object.values(JSON.parse(JSON.stringify(result[0])));
    return res.json(
      {
        status: 200,
        message: "Se ha obtenido la categoria solicitada",
        data: producto
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

// Autor: Anderson Salazar
// 27/10/22
/* el codigo aqui es usado para el
 CUS registrar a un producto*/
 // Autor: Anderson Salazar
// 24/11/22
/* Agregamos el campo stock minimo*/
export const createProducto = async (req, res) => {
    try {
        const {
          nombre,
          id_categoria,   
          id_usuario,
          codigo,
          unidad_medida,
          costo,
          descripcion,
          precio,
          stock,
          stock_min
        } = req.body;
        let sql = `CALL sp_generar_producto('${nombre}','${id_categoria}','${id_usuario}','${codigo}','${unidad_medida}','${costo}','${descripcion}','${precio}','${stock}','${stock_min}')`;
    const pool = mysql.createPool(config_mysql)
    const promiseQuery = promisify(pool.query).bind(pool)
    const promisePoolEnd = promisify(pool.end).bind(pool)
    const result = await promiseQuery(sql)

    promisePoolEnd()
    const producto = Object.values(JSON.parse(JSON.stringify(result[0])));
    return res.json(
      {
        status: 200,
        message: "Se ha obtenido creado el producto ",
        data: producto
      }
    );
  } catch (error) {
    console.log(error)

    return res.json(
      {
        status: 500,
        message: "Se ha producido un ERROR al crear el producto",
        error
      }
    );
  }

}

export const updateProductById= async (req, res) => {
    try {
            const {
              
              stock_min,              
              descripcion,
              precio,
              
            } = req.body;
        
            const { _id } = req.params;
            
            let sql = `CALL sp_actualizar_producto_por_id('${_id}','${stock_min}','${descripcion}','${precio}')`;
            const pool = mysql.createPool(config_mysql)
            const promiseQuery = promisify(pool.query).bind(pool)
            const promisePoolEnd = promisify(pool.end).bind(pool)

            const result = await promiseQuery(sql)

            promisePoolEnd()
            const Producto_upd = Object.values(JSON.parse(JSON.stringify(result[0])));
                  
            if (!Producto_upd.length==1) {
              return res.json({
                status: 404,
                message: "No se encontró al producto que se quiere editar",
              });
            }        
                   
            return res.json({
              status: 200,
              message: "Se ha actualizado el producto",
              data: Producto_upd,
            });
          } catch (error) {
            console.log(error);
            return res.json({
              status: 500,
              message: "Ha aparecido un ERROR al momento de actualizar a un producto",
              
            });
          }
         

}

/* el codigo aqui permite dar de baja a un producto*/
// Autor: Anderson Salazar
// 24/11/22
/* Agregamos codigo de status 404 para los errores de no encontrarse los productos*/
export const updateProductInhabilitar= async (req, res) => {
  try {
    const {_id} = req.params;

    let sql = `CALL sp_actualizar_producto_inhabilitar('${_id}')`;
    const pool = mysql.createPool(config_mysql)
    const promiseQuery = promisify(pool.query).bind(pool)
    const promisePoolEnd = promisify(pool.end).bind(pool)
    const result = await promiseQuery(sql)

    promisePoolEnd()
    const producto = Object.values(JSON.parse(JSON.stringify(result[0])));
    return res.json(
      {
        status: 200,
        message: "Se ha dado de baja al producto",
        data: producto
      }
    );
  } catch (error) {
    console.log(error)
    return res.json(
      {
        status: 500,
        message: "Se ha producido un ERROR al dar de baja producto",
        error
      }
    );
  }       

}

/* el codigo aqui permite dar de Alta a un Producto*/
export const updateProductHabilitar= async (req, res) => {
  try {
    const {_id} = req.params;

    let sql = `CALL sp_actualizar_categoria_habilitar('${_id}')`;
    const pool = mysql.createPool(config_mysql)
    const promiseQuery = promisify(pool.query).bind(pool)
    const promisePoolEnd = promisify(pool.end).bind(pool)
    const result = await promiseQuery(sql)

    promisePoolEnd()
    const producto = Object.values(JSON.parse(JSON.stringify(result[0])));
    return res.json(
      {
        status: 200,
        message: "Se ha habilitado el producto",
        data: producto
      }
    );
  } catch (error) {
    console.log(error)
    return res.json(
      {
        status: 500,
        message: "Se ha producido un ERROR al dar de alta al producto",
        error
      }
    );
  }

       

}
