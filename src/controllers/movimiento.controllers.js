import Movimiento from "../models/m_movimiento";
import MovimientoEntrada from "../models/m_movimiento_entrada";
import MovimientoSalida from "../models/m_movimiento_salida";
import Producto from "../models/m_producto";
import { BadRequestException } from "../exceptions/BadRequestException";
import { InternalServerException } from "../exceptions/InternalServerException";
import { NotFoundException } from "../exceptions/NotFoundException";
import ERROR_MESSAGE from "../constants/error.enum";
import {containerReport,blobServiceClient,DOMINIOFILE} from "../config"
import path from 'path'
import fs from 'fs'
import pdf from 'html-pdf' 

let mysql = require('mysql');
const { promisify } = require('util')
var config_mysql = require('../config_mysql.js')


const ubicacionPlantilla = require.resolve("./../tpl/plantilla.html");

// Autor: Jonatan Pacora
// 30/11/22
/* el codigo aqui es usado para el
 CUS 22 - 23 registrar a un movimiento*/

export const createMovimiento = async (req, res) => {
  try {
    const {
      codigo,
      factura,
      tipo,
      fecha,
      id_responsable,
      name_responsable,
      lista_items,
    } = req.body;

    if (!lista_items.length) {
      return res
        .status(ERROR_MESSAGE.NOT_FOUND)
        .json({ message: "No se recibieron los items del movimiento" });
    }

    const productsArray = [];

    // un ITEM (los objects del array lista_items) tiene los campos:
    //     codigo_product, name_product,description,categoria,
    //     stock, precio, cantidad
    if (tipo == "Salida") {
      
      for (let item of lista_items) {
        // Validación de operacion aceptada con el stock
        const item_code = item.codigo_product;
        const Producto_item = await Producto.findOne({
          codigo: item_code,
        });
        if (item.cantidad > Producto_item.stock) {
          return res.status(ERROR_MESSAGE.BAD_REQUEST).json({
            message: "NO SE PUEDE REALIZAR OPERACION, STOCK INSUFICIENTE",
          });
        }

        console.log("old stock", Producto_item.stock);
        const stock_new = Producto_item.stock - item.cantidad;
        console.log("new stock", stock_new);
        // Actualizar Colleccion Productos
        const Producto_upd = await Producto.findOneAndUpdate(
          { codigo: item.codigo_product },
          {
            stock: stock_new,
          }
        );
        if (!Producto_upd) {
          return res.status(ERROR_MESSAGE.NOT_FOUND).json({
            message: "No se encontró al producto que se quiere añadir",
          });
        }
        const updated_product = await Producto.findOne({
          codigo: item.codigo_product,
        });

        productsArray.push(updated_product);
      }
    }
    // Para los movimientos de Tipo Entrada
    else {
      for (let item of lista_items) {
        try {
          const item_code = item.codigo_product;
          const Producto_item = await Producto.findOne({
            codigo: item_code,
          });
          console.log("old stock", Producto_item.stock);
          let stock_new = Producto_item.stock + item.cantidad;
          console.log("new stock", stock_new);
          let code_product = item.codigo_product;
          // Actualizar Colleccion Productos
          const Producto_upd = await Producto.findOneAndUpdate(
            { codigo: code_product },
            {
              stock: stock_new,
            }
          );
          if (!Producto_upd) {
            return res.status(ERROR_MESSAGE.NOT_FOUND).json({
              message: "No se encontró al producto que se quiere añadir",
            });
          }
          const updated_product = await Producto.findOne({
            codigo: code_product,
          });

          productsArray.push(updated_product);
        } catch (error) {
          console.log(error);
          return res.status(ERROR_MESSAGE.INTERNAL_SERVER_ERROR).json({
            message: "Ha aparecido un ERROR al momento de crear el movimiento",
          });
        }
      }
    }

    const newMov = new Movimiento({
      codigo,
      factura,
      tipo: tipo,
      fecha,
      id_responsable,
      name_responsable,
      lista_items: lista_items,
      estado: "Aprobado",
    });
    const MovSaved = await newMov.save();

    return res.json({
      status: 200,
      movimiento: MovSaved,
      updated_product: productsArray,
      message: "Se ha creado el Movimiento correctamente",
    });
  } catch (error) {
    console.log(error);
    return res.status(ERROR_MESSAGE.INTERNAL_SERVER_ERROR).json({
      message:
        "Se ha generado un error al momento de crear el movimiento: " + error,
    });
  }
};
// Autor: Jonatan Pacora
// 6/12/22
/* Esta parte del codigo permite buscar un movimiento por su code*/
export const getMovimientoByCode = async (req, res) => {
  try {
    const { codigo } = req.params;
    let movimiento = await Movimiento.findOne({ codigo: codigo });
    if (!movimiento) {
      return res.json({
        status: 404,
        message: "No se encontró al Movimiento",
      });
    }
    return res.json({
      status: 200,
      message: "Se ha obtenido el movimiento por codigo",
      data: movimiento,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Se ha producido un ERROR al obtener un movimiento por codigo",
    });
  }
};
// Autor: Jonatan Pacora
// 6/12/22
/* Esta parte del codigo permite Anular un movimiento
 actualizando el stock en Productos*/
export const updateAnular = async (req, res) => {
  try {
    const { _id } = req.params;

    const movimiento_select = await Movimiento.findById({ _id });

    if (!movimiento_select) {
      return res.status(404).json({
        status: 404,
        message: "No se encontró al movimiento que se quiere anular",
      });
    }

    const movementsArray = [];

    //===== record
    if (movimiento_select.lista_items) {
      // un ITEM (los objects del array lista_items) tiene los campos:
      //     codigo_product, name_product,description,categoria,
      //     stock, precio, cantidad
      if (movimiento_select.tipo == "Entrada") {
        for (let item of movimiento_select.lista_items) {
          const item_code = item.codigo_product;
          // Obteniendo Producto del item
          const Producto_item = await Producto.findOne({
            codigo: item_code,
          });
          if (!Producto_item) {
            return res.json({
              status: 404,
              message: "No se encontró el producto del item",
            });
          }
          // Validación de operacion aceptada con el stock
          if (item.cantidad > Producto_item.stock) {
            return res.status(400).json({
              status: 400,
              message: "NO SE PUEDE REALIZAR OPERACION, STOCK INSUFICIENTE",
            });
          }

          console.log("old stock", Producto_item.stock);
          const stock_new = Producto_item.stock - item.cantidad;
          console.log("new stock", stock_new);
          // Actualizar Colleccion Productos
          const Producto_upd = await Producto.findOneAndUpdate(
            { codigo: item.codigo_product },
            {
              stock: stock_new,
            }
          );
          if (!Producto_upd) {
            return res.status(404).json({
              status: 404,
              message: "No se encontró al producto que se quiere actualizar",
            });
          }

          const updated_product = await Producto.findOne({ codigo: item.codigo_product });

          movementsArray.push(updated_product);
        }
      }
      // Para los movimientos de Tipo Salida
      else {
        const lista_items = movimiento_select.lista_items;
        await lista_items.forEach(async (item) => {
          const item_code = item.codigo_product;
          // Obteniendo el stock producto del item
          const Producto_item = await Producto.findOne({
            codigo: item_code,
          });
          if (!Producto_item) {
            return res.json({
              status: 404,
              message: "No se encontró el producto del item",
            });
          }
          console.log("old stock", Producto_item.stock);
          const stock_new = Producto_item.stock + item.cantidad;
          console.log("new stock", stock_new);
          // Actualizar Colleccion Productos
          const Producto_upd = await Producto.findOneAndUpdate(
            { codigo: item.codigo_product },
            {
              stock: stock_new,
            }
          );
          if (!Producto_upd) {
            return res.status(404).json({
              status: 404,
              message: "No se encontró al producto que se quiere actuañizar",
            });
          }
          const updated_product = await Producto.findOne({
            codigo: item.codigo_product,
          });

          movementsArray.push(updated_product);
        });
      }
    }
    const updated_mov = await Movimiento.findOneAndUpdate(
      { _id },
      { estado: "Anulado" }
    );
    if (!updated_mov) {
      return res.status(404).json({
        status: 404,
        message: "No se encontró al movimiento para anularlo",
      });
    }
    const updated_movimiento = await Movimiento.findOne({ _id });
    return res.status(200).json({
      status: 200,
      message: "Se ha anulado el movimiento",
      data: updated_movimiento,
      movimientos: movementsArray,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      message: "Ha aparecido un ERROR al momento de anular el movimiento",
    });
  }
};

// Autor: Jonatan Pacora
// 13/12/22
/* Codigo permite Obtener los movimientos aprobados*/

export const getMovimientosAprobados = async (req, res) => {
  try{
    const movimientos = await Movimiento.find({estado:"Aprobado"});
    if (!movimientos) {
      return res.status(404).json({
        status: 404,
        message: "No se encontró a los mov Aprobados",
      });
    }     
    return res.status(200).json(
      {status: 200,
       message: "Se ha obtenido los mov Aprobados",
       data: movimientos}
     );
  } catch (error) {
    return res.status(500).json(
      {status: 500,
      message: "Se ha producido un ERROR al obtener los mov Aprobados",
      }
      );
  }
}

// Autor: Jonatan Pacora
// 13/12/22
/* Codigo permite Obtener los movimientos Anulados*/

export const getMovimientosAnulados = async (req, res) => {
  try{
    const movimientos = await Movimiento.find({estado:"Anulado"});
    if (!movimientos) {
      return res.status(404).json({
        status: 404,
        message: "No se encontró a los mov Aprobados",
      });
    }     
    return res.status(200).json(
      {status: 200,
       message: "Se ha obtenido los mov Anulados",
       data: movimientos}
     );
  } catch (error) {
    return res.status(500).json(
      {status: 500,
      message: "Se ha producido un ERROR al obtener los mov Anulados",
      }
      );
  }
}


// Autor: Andhersson Salazar
// 14/12/22
/* el codigo aqui es usado para el
 CUS 29 generar reporte de movimiento*/
export const getReporte = async (req, res) => {
  try{
    const { codigo } = req.params;
    console.log("codigo: ",codigo)
    //obtienes el movimiento
    // let movimiento = await Movimiento.findOne({ codigo: codigo });

    // console.log(movimiento)
    let contenidoHtml = fs.readFileSync(ubicacionPlantilla, 'utf8')
    console.log(contenidoHtml)
    contenidoHtml = contenidoHtml.replace("{{codigoMovimiento}}", codigo);
    // var productos=movimiento.lista_items
    const formateador = new Intl.NumberFormat("en", { style: "currency", "currency": "PEN" });
    // Generar el HTML de la tabla
    let tabla = "";
    let subtotal = 0;
    // for (const producto of productos) {
    //     // Aumentar el total
    //     const totalProducto = producto.cantidad * producto.precio;
    //     subtotal += totalProducto;
    //     // Y concatenar los productos
    //     tabla += `<tr>
    //     <td>${producto.nombre}</td>
    //     <td>${producto.descripcion}</td>
    //     <td>${producto.cantidad}</td>
    //     <td>${formateador.format(producto.precio)}</td>
    //     <td>${formateador.format(totalProducto)}</td>
    //     </tr>`;
    // }
    const descuento = 0;
    const subtotalConDescuento = subtotal - descuento;
    const impuestos = subtotalConDescuento * 0.16
    const total = subtotalConDescuento + impuestos;
    // Remplazar el valor {{tablaProductos}} por el verdadero valor
    contenidoHtml = contenidoHtml.replace("{{tablaProductos}}", tabla);

    // Y también los otros valores

    // contenidoHtml = contenidoHtml.replace("{{fecha}}", movimiento.fecha.toLocaleDateString());
    // contenidoHtml = contenidoHtml.replace("{{estado}}", movimiento.estado);
    // contenidoHtml = contenidoHtml.replace("{{tipo}}", movimiento.tipo);
    // contenidoHtml = contenidoHtml.replace("{{factura}}", movimiento.factura);
    // contenidoHtml = contenidoHtml.replace("{{responsable}}", movimiento.name_responsable);
    contenidoHtml = contenidoHtml.replace("{{subtotal}}", formateador.format(subtotal));
    contenidoHtml = contenidoHtml.replace("{{descuento}}", formateador.format(descuento));
    contenidoHtml = contenidoHtml.replace("{{subtotalConDescuento}}", formateador.format(subtotalConDescuento));
    contenidoHtml = contenidoHtml.replace("{{impuestos}}", formateador.format(impuestos));
    contenidoHtml = contenidoHtml.replace("{{total}}", formateador.format(subtotal));
    const f=new Date()
    var fecha_archivo=f.toLocaleDateString().replaceAll('/','-')
    var archivo_generado="./reportes/movimiento-"+codigo+" - "+fecha_archivo+".pdf";
    var archivo_generado_azure="reportes/movimiento-"+codigo+" - "+fecha_archivo+".pdf";
    console.log(archivo_generado_azure)
    var nombre_archivopdf = "movimiento-"+codigo+" - "+fecha_archivo+".pdf"
    console.log(nombre_archivopdf)

    pdf.create(contenidoHtml).toFile(archivo_generado, (error) => {
        if (error) {
            console.log("Error creando PDF: " + error)
            return res.status(500).json({mensaje:"Error al obtener el reporte", status: "500"})
        } else {
            console.log("PDF creado correctamente");
        }
    });
    setTimeout(() => {
      let rutaPdf = ""
      azurePdf(archivo_generado_azure).then(response => {
        rutaPdf = response;
        console.log("pdf descargado: ", rutaPdf)
        res.set({'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=${nombre_archivopdf}`})
        response.readableStreamBody.pipe(res);
      }).catch(error => {
        return res.status(500).json({ mensaje: "Error al obtener el reporte", status: "500" })
      });
    }, 4000)    
  } catch (error) {
    return res.status(500).json(
      {status: 500,
      message: "Se ha producido un ERROR al obtener el reporte",
      }
      );
  }
}

//metodo para cargar y descargar el pdf de azure
const azurePdf = async (archivo_generado_azure) => {
  try{
          //subiendo pdf a Azure      
          const containerClient = blobServiceClient.getContainerClient(containerReport);

          // Crear el contenedor si no existe
          const createContainerResponse = await containerClient.createIfNotExists();
          if(!createContainerResponse) console.log("ya existe el contenedor")
          
          const filePath = path.join(__dirname, "../../"+archivo_generado_azure);
          console.log("Ruta del archivo: ",filePath)
          // Leer el archivo
          const fileContent = fs.readFileSync(filePath);
          // Obtener el nombre del archivo sin la ruta
          const fileName = path.basename(filePath);
          console.log("nombre: archivo",fileName)
          // Subir el archivo al contenedor en Azure
          const blockBlobClient = containerClient.getBlockBlobClient(fileName);
          const uploadResponse = await blockBlobClient.upload(fileContent, fileContent.length);
          console.log("Respuesta de subida de archivo:",uploadResponse)
          
          fs.unlink(filePath, async (err) => {
              if (err) {
                console.error(err);
                return;
              }
              console.log('Archivo temporal eliminado correctamente');
              
              
              
            });

            //obtener el PDF del contenedor en Azure para mostrar
            const blobName = fileName;
            const blobClient = containerClient.getBlobClient(blobName);

            const response = await blobClient.download();

            return response;
  }catch(err){
      console.log(err)
  }  
}

//---------------------------------- movimientos de entrada-----------------------------------
export const createMovimientoEntrada = async (req, res) => {
  try {
    const {
      codigo,
      orden_compra,
      fecha,
      id_usuario,
      proveedor,
      lista_items,
    } = req.body;

    if (!lista_items.length) {
      return res
        .status(ERROR_MESSAGE.NOT_FOUND)
        .json({ message: "No se recibieron los items del movimiento entrada" });
    }

    const productsArray = [];
    for (let item of lista_items) {
      try {
        const item_code = item.codigo_product;
        let sql = `CALL sp_obtener_producto_por_code('${item_code}')`;
        const pool = mysql.createPool(config_mysql)
        const promiseQuery = promisify(pool.query).bind(pool)
        const promisePoolEnd = promisify(pool.end).bind(pool)
        const result = await promiseQuery(sql)
        promisePoolEnd()
        const Producto_item = JSON.parse(JSON.stringify(result[0][0]));
        console.log("old stock", Producto_item.stock);
        let stock_new = Producto_item.stock + item.cantidad;
        console.log("new stock", stock_new);
        let code_product = item.codigo_product;
        // Actualizar Colleccion Productos
        let sql2 = `CALL sp_actualizar_stock_producto_por_codigo('${item_code}','${stock_new}')`;
        const pool2 = mysql.createPool(config_mysql)
        const promiseQuery2 = promisify(pool2.query).bind(pool2)
        const promisePoolEnd2 = promisify(pool2.end).bind(pool2)
        const result2 = await promiseQuery2(sql2)
        promisePoolEnd2()
        const Producto_upd = JSON.parse(JSON.stringify(result2[0][0]));
        if (!Producto_upd) {
          return res.status(ERROR_MESSAGE.NOT_FOUND).json({
            message: "No se encontró al producto que se quiere añadir",
          });
        }
        let sql3 = `CALL sp_obtener_producto_por_code('${item_code}')`;
        const pool3 = mysql.createPool(config_mysql)
        const promiseQuery3 = promisify(pool3.query).bind(pool3)
        const promisePoolEnd3 = promisify(pool3.end).bind(pool3)
        const result3 = await promiseQuery3(sql3)
        promisePoolEnd3()
        const updated_product = JSON.parse(JSON.stringify(result3[0][0]));

        productsArray.push(updated_product);
      } catch (error) {
        console.log(error);
        return res.status(ERROR_MESSAGE.INTERNAL_SERVER_ERROR).json({
          message: "Ha aparecido un ERROR al momento de crear el movimiento de entrada",
        });
      }
    }
    let sql4 = `CALL sp_crear_movimiento_entrada('${id_usuario}', '${codigo}', '${orden_compra}', '${proveedor}')`;
    const pool4 = mysql.createPool(config_mysql)
    const promiseQuery4 = promisify(pool4.query).bind(pool4)
    const promisePoolEnd4 = promisify(pool4.end).bind(pool4)
    const result4 = await promiseQuery4(sql4)
    promisePoolEnd4()
    const MovSaved = JSON.parse(JSON.stringify(result4[0][0]));
    var a=MovSaved;
    for (let i=0; i<lista_items.length; i++){
      let sql5 = `CALL sp_generar_item_movimiento_entrada('${a.id}', '${productsArray[i].id}', '${productsArray[i].precio}', '${lista_items[i].cantidad}')`;
      const pool5 = mysql.createPool(config_mysql)
      const promiseQuery5 = promisify(pool5.query).bind(pool5)
      const promisePoolEnd5 = promisify(pool5.end).bind(pool5)
      const result5 = await promiseQuery5(sql5)
      promisePoolEnd5()
      const MovSaved = JSON.parse(JSON.stringify(result5[0][0]));
    }
    return res.json({
      status: 200,
      movimiento: MovSaved,
      updated_product: productsArray,
      message: "Se ha creado el Movimiento de entrada correctamente",
    });
  } catch (error) {
    console.log(error);
    return res.status(ERROR_MESSAGE.INTERNAL_SERVER_ERROR).json({
      message:
        "Se ha generado un error al momento de crear el movimiento de entrada: " + error,
    });
  }
};

export const getMovimientoByCodeEntrada = async (req, res) => {
  try {
    const { codigo } = req.params;
    let sql2 = `CALL sp_obtener_entrada_por_code('${codigo}')`;
    const pool2 = mysql.createPool(config_mysql)
    const promiseQuery2 = promisify(pool2.query).bind(pool2)
    const promisePoolEnd2 = promisify(pool2.end).bind(pool2)
    const result2 = await promiseQuery2(sql2)
    promisePoolEnd2()
    const movimiento = JSON.parse(JSON.stringify(result2[0]));
    if (!movimiento) {
      return res.json({
        status: 404,
        message: "No se encontró al Movimiento",
      });
    }
    return res.json({
      status: 200,
      message: "Se ha obtenido el movimiento por codigo",
      data: movimiento,
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      status: 500,
      message: "Se ha producido un ERROR al obtener un movimiento por codigo",
    });
  }
};

export const updateAnularEntrada = async (req, res) => {
  try {
    const { _id } = req.params;

    let sql2 = `CALL sp_obtener_entrada_por_id('${_id}')`;
    const pool2 = mysql.createPool(config_mysql)
    const promiseQuery2 = promisify(pool2.query).bind(pool2)
    const promisePoolEnd2 = promisify(pool2.end).bind(pool2)
    const result2 = await promiseQuery2(sql2)
    promisePoolEnd2()
    const movimiento_select = JSON.parse(JSON.stringify(result2[0][0]));
    
    if (!movimiento_select) {
      return res.status(404).json({
        status: 404,
        message: "No se encontró al movimiento que se quiere anular",
      });
    }

    let sql3 = `CALL sp_obtener_productos_movimiento_entrada('${movimiento_select.id}')`;
    const pool3 = mysql.createPool(config_mysql)
    const promiseQuery3 = promisify(pool3.query).bind(pool3)
    const promisePoolEnd3 = promisify(pool3.end).bind(pool3)
    const result3 = await promiseQuery3(sql3)
    promisePoolEnd3()
    const lista_items_mov = JSON.parse(JSON.stringify(result3[0]));

    const movementsArray = [];

    //===== record
    var mov_var=movimiento_select;
    if (lista_items_mov!=null) {
      // un ITEM (los objects del array lista_items) tiene los campos:
      //     codigo_product, name_product,description,categoria,
      //     stock, precio, cantidad
      for (let item of lista_items_mov) {
        const item_id = item.id_producto;
        // Obteniendo Producto del item
        console.log(item_id);
        let sql4 = `CALL sp_obtener_producto_por_id('${item_id}')`;
        const pool4 = mysql.createPool(config_mysql)
        const promiseQuery4 = promisify(pool4.query).bind(pool4)
        const promisePoolEnd4 = promisify(pool4.end).bind(pool4)
        const result4 = await promiseQuery4(sql4)
        promisePoolEnd4()
        const Producto_item = JSON.parse(JSON.stringify(result4[0][0]));
        
        console.log(Producto_item);

        const item_code = Producto_item.codigo;

        if (!Producto_item) {
          return res.json({
            status: 404,
            message: "No se encontró el producto del item",
          });
        }
        // Validación de operacion aceptada con el stock
        if (item.cantidad > Producto_item.stock) {
          return res.status(400).json({
            status: 400,
            message: "NO SE PUEDE REALIZAR OPERACION, STOCK INSUFICIENTE",
          });
        }

        console.log("old stock", Producto_item.stock);
        const stock_new = Producto_item.stock - item.cantidad;
        console.log("new stock", stock_new);
        // Actualizar Colleccion Productos
        let sql5 = `CALL sp_actualizar_stock_producto_por_codigo('${item_code}','${stock_new}')`;
        const pool5 = mysql.createPool(config_mysql)
        const promiseQuery5 = promisify(pool5.query).bind(pool5)
        const promisePoolEnd5 = promisify(pool5.end).bind(pool5)
        const result5 = await promiseQuery5(sql5)
        promisePoolEnd5()
        const Producto_upd = JSON.parse(JSON.stringify(result5[0][0]));
        if (!Producto_upd) {
          return res.status(404).json({
            status: 404,
            message: "No se encontró al producto que se quiere actualizar",
          });
        }

        let sql6 = `CALL sp_obtener_producto_por_code('${item_code}')`;
        const pool6 = mysql.createPool(config_mysql)
        const promiseQuery6 = promisify(pool6.query).bind(pool6)
        const promisePoolEnd6 = promisify(pool6.end).bind(pool6)
        const result6 = await promiseQuery6(sql6)
        promisePoolEnd6()
        const updated_product = JSON.parse(JSON.stringify(result6[0][0]));

        movementsArray.push(updated_product);
      }
    }
    let sql7 = `CALL sp_anular_movimiento_entrada('${movimiento_select.id}')`;
    const pool7 = mysql.createPool(config_mysql)
    const promiseQuery7 = promisify(pool7.query).bind(pool7)
    const promisePoolEnd7 = promisify(pool7.end).bind(pool7)
    const result7 = await promiseQuery7(sql7)
    promisePoolEnd7()
    const updated_mov = JSON.parse(JSON.stringify(result7[0][0]));
    if (!updated_mov) {
      return res.status(404).json({
        status: 404,
        message: "No se encontró al movimiento para anularlo",
      });
    }
    return res.status(200).json({
      status: 200,
      message: "Se ha anulado el movimiento",
      data: updated_mov,
      movimientos: movementsArray,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      message: "Ha aparecido un ERROR al momento de anular el movimiento",
    });
  }
};

export const getMovimientosAprobadosEntrada = async (req, res) => {
  try{
    let sql2 = `CALL sp_obtener_movimientos_entrada_aprobados()`;
    const pool2 = mysql.createPool(config_mysql)
    const promiseQuery2 = promisify(pool2.query).bind(pool2)
    const promisePoolEnd2 = promisify(pool2.end).bind(pool2)
    const result2 = await promiseQuery2(sql2)
    promisePoolEnd2()
    const movimientos = JSON.parse(JSON.stringify(result2[0]));
    if (!movimientos) {
      return res.status(404).json({
        status: 404,
        message: "No se encontró a los mov Aprobados",
      });
    }     
    return res.status(200).json(
      {status: 200,
       message: "Se ha obtenido los mov Aprobados",
       data: movimientos}
     );
  } catch (error) {
    return res.status(500).json(
      {status: 500,
      message: "Se ha producido un ERROR al obtener los mov Aprobados",
      }
      );
  }
}

export const getMovimientosAnuladosEntrada = async (req, res) => {
  try{
    let sql2 = `CALL sp_obtener_movimientos_entrada_anulados()`;
    const pool2 = mysql.createPool(config_mysql)
    const promiseQuery2 = promisify(pool2.query).bind(pool2)
    const promisePoolEnd2 = promisify(pool2.end).bind(pool2)
    const result2 = await promiseQuery2(sql2)
    promisePoolEnd2()
    const movimientos = JSON.parse(JSON.stringify(result2[0]));
    if (!movimientos) {
      return res.status(404).json({
        status: 404,
        message: "No se encontró a los mov Aprobados",
      });
    }     
    return res.status(200).json(
      {status: 200,
       message: "Se ha obtenido los mov Anulados",
       data: movimientos}
     );
  } catch (error) {
    return res.status(500).json(
      {status: 500,
      message: "Se ha producido un ERROR al obtener los mov Anulados",
      }
      );
  }
}
export const getItemsEntrada = async (req, res) => {
  try {
    const { _id } = req.params;
    let sql = `CALL sp_obtener_productos_movimiento_entrada('${_id}')`;
    const pool = mysql.createPool(config_mysql)
    const promiseQuery = promisify(pool.query).bind(pool)
    const promisePoolEnd = promisify(pool.end).bind(pool)
    const result = await promiseQuery(sql)
    promisePoolEnd()
    const categorias = Object.values(JSON.parse(JSON.stringify(result[0])));
    return res.json(
      {
        status: 200,
        message: "Se ha obtenido las items del movimiento de entrada",
        data: categorias
      }
    );
  } catch (error) {
    console.log(error)
    return res.json(
      {
        status: 500,
        message: "Se ha producido un ERROR al obtener los items del movimiento de entrada",
      }
    );
  }
}
// PARA EL REPORTE: DATOS COMPLETOS DE UN MOVIMIENTO DE ENTRADA JUNTO CON ITEMS INCLUIDOS (jonatan)
export const obtenerMovEntradaCompletoByCode = async(req,res) =>{
  try {
    const { codigo } = req.params;

    let sql2 = `CALL sp_obtener_entrada_por_code('${codigo}')`;
    const pool2 = mysql.createPool(config_mysql)
    const promiseQuery2 = promisify(pool2.query).bind(pool2)
    const promisePoolEnd2 = promisify(pool2.end).bind(pool2)
    const result2 = await promiseQuery2(sql2)
    promisePoolEnd2()
    const movimiento_select = JSON.parse(JSON.stringify(result2[0][0]));
    
    if (!movimiento_select) {
      return res.status(404).json({
        status: 404,
        message: "No se encontró al movimiento que se quiere anular",
      });
    }

    let sql3 = `CALL sp_obtener_productos_movimiento_entrada('${movimiento_select.id}')`;
    const pool3 = mysql.createPool(config_mysql)
    const promiseQuery3 = promisify(pool3.query).bind(pool3)
    const promisePoolEnd3 = promisify(pool3.end).bind(pool3)
    const result3 = await promiseQuery3(sql3)
    promisePoolEnd3()
    const lista_items_mov = JSON.parse(JSON.stringify(result3[0]));
    movimiento_select["items_movimiento"]=lista_items_mov;
    return res.json({
      status: 200,
      message: "Se ha obtenido el movimiento completo por codigo",
      data: {movimiento_select}
    });   
  }catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      message: "Ha aparecido un ERROR al momento de anular el movimiento",
    });
  }
}
export const obtenerMovSalidaCompletoByCode = async(req,res) =>{
  try {
    const { codigo } = req.params;

    let sql2 = `CALL sp_obtener_salida_por_code('${codigo}')`;
    const pool2 = mysql.createPool(config_mysql)
    const promiseQuery2 = promisify(pool2.query).bind(pool2)
    const promisePoolEnd2 = promisify(pool2.end).bind(pool2)
    const result2 = await promiseQuery2(sql2)
    promisePoolEnd2()
    const movimiento_select = JSON.parse(JSON.stringify(result2[0][0]));
   
    
    if (!movimiento_select) {
      return res.status(404).json({
        status: 404,
        message: "No se encontró al movimiento que se quiere anular",
      });
    }

    let sql3 = `CALL sp_obtener_productos_movimiento_salida('${movimiento_select.id}')`;
    const pool3 = mysql.createPool(config_mysql)
    const promiseQuery3 = promisify(pool3.query).bind(pool3)
    const promisePoolEnd3 = promisify(pool3.end).bind(pool3)
    const result3 = await promiseQuery3(sql3)
    promisePoolEnd3()
    const lista_items_mov = JSON.parse(JSON.stringify(result3[0]));
    movimiento_select["items_movimiento"]=lista_items_mov;
    return res.json({
      status: 200,
      message: "Se ha obtenido el movimiento de salida completo por codigo",
      data: {movimiento_select,lista_items_mov}
    });   
  }catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      message: "Ha aparecido un ERROR al momento de anular el movimiento",
    });
  }
}


//--------------------------------movimientos salida-----------------------------

export const createMovimientoSalida = async (req, res) => {
  try {
    const {
      codigo,
      factura,
      fecha,
      id_usuario,
      cliente,
      lista_items,
    } = req.body;

    if (!lista_items.length) {
      return res
        .status(ERROR_MESSAGE.NOT_FOUND)
        .json({ message: "No se recibieron los items del movimiento entrada" });
    }

    const productsArray = [];
    for (let item of lista_items) {
      // Validación de operacion aceptada con el stock
      const item_code = item.codigo_product;
      let sql = `CALL sp_obtener_producto_por_code('${item_code}')`;
      const pool = mysql.createPool(config_mysql)
      const promiseQuery = promisify(pool.query).bind(pool)
      const promisePoolEnd = promisify(pool.end).bind(pool)
      const result = await promiseQuery(sql)
      promisePoolEnd()
      const Producto_item = JSON.parse(JSON.stringify(result[0][0]));
      if (item.cantidad > Producto_item.stock) {
        return res.status(ERROR_MESSAGE.BAD_REQUEST).json({
          message: "NO SE PUEDE REALIZAR OPERACION, STOCK INSUFICIENTE",
        });
      }

      console.log("old stock", Producto_item.stock);
      const stock_new = Producto_item.stock - item.cantidad;
      console.log("new stock", stock_new);
      // Actualizar Colleccion Productos
      let sql2 = `CALL sp_actualizar_stock_producto_por_codigo('${item_code}','${stock_new}')`;
      const pool2 = mysql.createPool(config_mysql)
      const promiseQuery2 = promisify(pool2.query).bind(pool2)
      const promisePoolEnd2 = promisify(pool2.end).bind(pool2)
      const result2 = await promiseQuery2(sql2)
      promisePoolEnd2()
      const Producto_upd = JSON.parse(JSON.stringify(result2[0][0]));
      if (!Producto_upd) {
        return res.status(ERROR_MESSAGE.NOT_FOUND).json({
          message: "No se encontró al producto que se quiere añadir",
        });
      }
      let sql3 = `CALL sp_obtener_producto_por_code('${item_code}')`;
      const pool3 = mysql.createPool(config_mysql)
      const promiseQuery3 = promisify(pool3.query).bind(pool3)
      const promisePoolEnd3 = promisify(pool3.end).bind(pool3)
      const result3 = await promiseQuery3(sql3)
      promisePoolEnd3()
      const updated_product = JSON.parse(JSON.stringify(result3[0][0]));

      productsArray.push(updated_product);
    }
    let sql4 = `CALL sp_crear_movimiento_salida('${id_usuario}', '${codigo}', '${factura}', '${cliente}')`;
    const pool4 = mysql.createPool(config_mysql)
    const promiseQuery4 = promisify(pool4.query).bind(pool4)
    const promisePoolEnd4 = promisify(pool4.end).bind(pool4)
    const result4 = await promiseQuery4(sql4)
    promisePoolEnd4()
    const MovSaved = JSON.parse(JSON.stringify(result4[0][0]));
    var a=MovSaved;
    for (let i=0; i<lista_items.length; i++){
      let sql5 = `CALL sp_generar_item_movimiento_salida('${a.id}', '${productsArray[i].id}', '${productsArray[i].precio}', '${lista_items[i].cantidad}')`;
      const pool5 = mysql.createPool(config_mysql)
      const promiseQuery5 = promisify(pool5.query).bind(pool5)
      const promisePoolEnd5 = promisify(pool5.end).bind(pool5)
      const result5 = await promiseQuery5(sql5)
      promisePoolEnd5()
      const MovSaved = JSON.parse(JSON.stringify(result5[0][0]));
    }

    return res.json({
      status: 200,
      movimiento: MovSaved,
      updated_product: productsArray,
      message: "Se ha creado el Movimiento de salida correctamente",
    });
  } catch (error) {
    console.log(error);
    return res.status(ERROR_MESSAGE.INTERNAL_SERVER_ERROR).json({
      message:
        "Se ha generado un error al momento de crear el movimiento de salida: " + error,
    });
  }
};

export const getMovimientoByCodeSalida = async (req, res) => {
  try {
    const { codigo } = req.params;
    console.log(req.params);
    console.log(codigo);
    let sql2 = `CALL sp_obtener_salida_por_code('${codigo}')`;
    const pool2 = mysql.createPool(config_mysql)
    const promiseQuery2 = promisify(pool2.query).bind(pool2)
    const promisePoolEnd2 = promisify(pool2.end).bind(pool2)
    const result2 = await promiseQuery2(sql2)
    promisePoolEnd2()
    const movimiento = JSON.parse(JSON.stringify(result2[0]));
    if (!movimiento) {
      return res.json({
        status: 404,
        message: "No se encontró al Movimiento",
      });
    }
    return res.json({
      status: 200,
      message: "Se ha obtenido el movimiento por codigo",
      data: movimiento,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Se ha producido un ERROR al obtener un movimiento por codigo",
    });
  }
};

export const updateAnularSalida = async (req, res) => {
  try {
    const { _id } = req.params;
    let sql2 = `CALL sp_obtener_salida_por_id('${_id}')`;
    const pool2 = mysql.createPool(config_mysql)
    const promiseQuery2 = promisify(pool2.query).bind(pool2)
    const promisePoolEnd2 = promisify(pool2.end).bind(pool2)
    const result2 = await promiseQuery2(sql2)
    promisePoolEnd2()
    const movimiento_select = JSON.parse(JSON.stringify(result2[0][0]));
    if (!movimiento_select) {
      return res.status(404).json({
        status: 404,
        message: "No se encontró al movimiento que se quiere anular",
      });
    }

    let sql3 = `CALL sp_obtener_productos_movimiento_salida('${movimiento_select.id}')`;
    const pool3 = mysql.createPool(config_mysql)
    const promiseQuery3 = promisify(pool3.query).bind(pool3)
    const promisePoolEnd3 = promisify(pool3.end).bind(pool3)
    const result3 = await promiseQuery3(sql3)
    promisePoolEnd3()
    const lista_items_mov = JSON.parse(JSON.stringify(result3[0]));

    const movementsArray = [];

    //===== record
    var mov_var=movimiento_select;
    if (lista_items_mov!=null) {
      // un ITEM (los objects del array lista_items) tiene los campos:
      //     codigo_product, name_product,description,categoria,
      //     stock, precio, cantidad
      for (let item of lista_items_mov) {
        const item_id = item.id_producto;
        // Obteniendo Producto del item
        let sql4 = `CALL sp_obtener_producto_por_id('${item_id}')`;
        const pool4 = mysql.createPool(config_mysql)
        const promiseQuery4 = promisify(pool4.query).bind(pool4)
        const promisePoolEnd4 = promisify(pool4.end).bind(pool4)
        const result4 = await promiseQuery4(sql4)
        promisePoolEnd4()
        const Producto_item = JSON.parse(JSON.stringify(result4[0][0]));
        
        console.log(Producto_item);

        const item_code = Producto_item.codigo;

        if (!Producto_item) {
          return res.json({
            status: 404,
            message: "No se encontró el producto del item",
          });
        }
        // Validación de operacion aceptada con el stock
        if (item.cantidad > Producto_item.stock) {
          return res.status(400).json({
            status: 400,
            message: "NO SE PUEDE REALIZAR OPERACION, STOCK INSUFICIENTE",
          });
        }

        console.log("old stock", Producto_item.stock);
        const stock_new = Producto_item.stock + item.cantidad;
        console.log("new stock", stock_new);
        // Actualizar Colleccion Productos
        let sql5 = `CALL sp_actualizar_stock_producto_por_codigo('${item_code}','${stock_new}')`;
        const pool5 = mysql.createPool(config_mysql)
        const promiseQuery5 = promisify(pool5.query).bind(pool5)
        const promisePoolEnd5 = promisify(pool5.end).bind(pool5)
        const result5 = await promiseQuery5(sql5)
        promisePoolEnd5()
        const Producto_upd = JSON.parse(JSON.stringify(result5[0][0]));
        if (!Producto_upd) {
          return res.status(404).json({
            status: 404,
            message: "No se encontró al producto que se quiere actualizar",
          });
        }

        let sql6 = `CALL sp_obtener_producto_por_code('${item_code}')`;
        const pool6 = mysql.createPool(config_mysql)
        const promiseQuery6 = promisify(pool6.query).bind(pool6)
        const promisePoolEnd6 = promisify(pool6.end).bind(pool6)
        const result6 = await promiseQuery6(sql6)
        promisePoolEnd6()
        const updated_product = JSON.parse(JSON.stringify(result6[0][0]));

        movementsArray.push(updated_product);
      }
    }
    let sql7 = `CALL sp_anular_movimiento_salida('${movimiento_select.id}')`;
    const pool7 = mysql.createPool(config_mysql)
    const promiseQuery7 = promisify(pool7.query).bind(pool7)
    const promisePoolEnd7 = promisify(pool7.end).bind(pool7)
    const result7 = await promiseQuery7(sql7)
    promisePoolEnd7()
    const updated_mov = JSON.parse(JSON.stringify(result7[0][0]));
    if (!updated_mov) {
      return res.status(404).json({
        status: 404,
        message: "No se encontró al movimiento para anularlo",
      });
    }
    return res.status(200).json({
      status: 200,
      message: "Se ha anulado el movimiento",
      data: updated_mov,
      movimientos: movementsArray,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      message: "Ha aparecido un ERROR al momento de anular el movimiento",
    });
  }
};

export const getMovimientosAprobadosSalida = async (req, res) => {
  try{
    let sql2 = `CALL sp_obtener_movimientos_salida_aprobados()`;
    const pool2 = mysql.createPool(config_mysql)
    const promiseQuery2 = promisify(pool2.query).bind(pool2)
    const promisePoolEnd2 = promisify(pool2.end).bind(pool2)
    const result2 = await promiseQuery2(sql2)
    promisePoolEnd2()
    const movimientos = JSON.parse(JSON.stringify(result2[0]));
    if (!movimientos) {
      return res.status(404).json({
        status: 404,
        message: "No se encontró a los mov Aprobados",
      });
    }     
    return res.status(200).json(
      {status: 200,
       message: "Se ha obtenido los mov Aprobados",
       data: movimientos}
     );
  } catch (error) {
    return res.status(500).json(
      {status: 500,
      message: "Se ha producido un ERROR al obtener los mov Aprobados",
      }
      );
  }
}

export const getMovimientosAnuladosSalida = async (req, res) => {
  try{
    let sql2 = `CALL sp_obtener_movimientos_salida_anulados()`;
    const pool2 = mysql.createPool(config_mysql)
    const promiseQuery2 = promisify(pool2.query).bind(pool2)
    const promisePoolEnd2 = promisify(pool2.end).bind(pool2)
    const result2 = await promiseQuery2(sql2)
    promisePoolEnd2()
    const movimientos = JSON.parse(JSON.stringify(result2[0]));
    if (!movimientos) {
      return res.status(404).json({
        status: 404,
        message: "No se encontró a los mov Aprobados",
      });
    }     
    return res.status(200).json(
      {status: 200,
       message: "Se ha obtenido los mov Anulados",
       data: movimientos}
     );
  } catch (error) {
    return res.status(500).json(
      {status: 500,
      message: "Se ha producido un ERROR al obtener los mov Anulados",
      }
      );
  }
}
export const getItemsSalida = async (req, res) => {
  try {
    const { _id } = req.params;
    let sql = `CALL sp_obtener_productos_movimiento_salida('${_id}')`;
    const pool = mysql.createPool(config_mysql)
    const promiseQuery = promisify(pool.query).bind(pool)
    const promisePoolEnd = promisify(pool.end).bind(pool)
    const result = await promiseQuery(sql)
    promisePoolEnd()
    const categorias = Object.values(JSON.parse(JSON.stringify(result[0])));
    return res.json(
      {
        status: 200,
        message: "Se ha obtenido las items del movimiento de salida",
        data: categorias
      }
    );
  } catch (error) {
    console.log(error)
    return res.json(
      {
        status: 500,
        message: "Se ha producido un ERROR al obtener los items del movimiento de salida",
      }
    );
  }
}