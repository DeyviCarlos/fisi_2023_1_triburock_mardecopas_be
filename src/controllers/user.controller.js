import { hashPassword, comparePassword } from "../core/bcrypt";

let mysql = require('mysql');
const { promisify } = require('util')
var config_mysql = require('../config_mysql.js')

// Autor: Jonatan Pacora Vega
// 17/10/22
/* el codigo aqui es usado para el
 CUS registrar a un usuario*/
export const createUser = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      direccion,      
      telefono,
      dni,
      rol_id
    } = req.body;

    const newpassword=  await hashPassword(password);
    let sql = `CALL sp_generar_usuario('${username}','${email}','${newpassword}','${direccion}','${telefono}','${dni}','${rol_id}')`;
    const pool = mysql.createPool(config_mysql)
    const promiseQuery = promisify(pool.query).bind(pool)
    const promisePoolEnd = promisify(pool.end).bind(pool)

    const result = await promiseQuery(sql)

    promisePoolEnd()
    const usuario = Object.values(JSON.parse(JSON.stringify(result[0])));
    return res.json(
      {
        status: 200,
        message: "Se ha creado el usuario correctamente ",
        data: usuario
      }
    );
  } catch (error) {
    console.log(error)

    return res.json(
      {
        status: 500,
        message: "Se ha producido un ERROR al crear el  usuario",
        error
      }
    );
  }

};
/* el codigo aqui es permite listar
 los usuarios  habilitadas*/
export const getUsers = async (req, res) => {
  try {
    let sql = `CALL sp_obtener_usuario_habilitado()`;
    const pool = mysql.createPool(config_mysql)
    const promiseQuery = promisify(pool.query).bind(pool)
    const promisePoolEnd = promisify(pool.end).bind(pool)
    const result = await promiseQuery(sql)
    promisePoolEnd()
    const usuarios = Object.values(JSON.parse(JSON.stringify(result[0])));
    for (var i = 0; i < usuarios.length; i++) {
        if(usuarios[i].rol == 100){
          usuarios[i].rol_display = "Administrador"; 
        }
        if(usuarios[i].rol == 120)
        {
          usuarios[i].rol_display = "Jefe de Almacen"; 
        }
        if(usuarios[i].rol == 121)
        {
          usuarios[i].rol_display = "Almacenero";
        }
        
  }
    
    
    return res.json(
      {
        status: 200,
        message: "Se ha obtenido los usuarioos habilitados",
        data: usuarios
       
      }
    );
  } catch (error) {
    console.log(error)
    return res.json(
      {
        status: 500,
        message: "Se ha producido un ERROR al obtener los usuarios habilitados",
      }
    );
  }
};
// Autor: Jonatan Pacora Vega
// 18/10/22
/* el codigo aqui permite listar
 los usuarios inhabilitados*/
export const getUsersInhabiltados = async (req, res) => {
  try {
    let sql = `CALL sp_obtener_usuario_inhabiltados()`;
    const pool = mysql.createPool(config_mysql)
    const promiseQuery = promisify(pool.query).bind(pool)
    const promisePoolEnd = promisify(pool.end).bind(pool)
    const result = await promiseQuery(sql)
    promisePoolEnd()
    const usuarios = Object.values(JSON.parse(JSON.stringify(result[0])));
    for (var i = 0; i < usuarios.length; i++) {
      if(usuarios[i].rol == 100){
        usuarios[i].rol_display = "Administrador"; 
      }
      if(usuarios[i].rol == 120)
      {
        usuarios[i].rol_display = "Jefe de Almacen"; 
      }
      if(usuarios[i].rol == 121)
      {
        usuarios[i].rol_display = "Almacenero";
      }
      
}
    return res.json(
      {
        status: 200,
        message: "Se ha obtenido los usuarios inhabilitadas",
        data: usuarios
      }
    );
  } catch (error) {
    console.log(error)
    return res.json(
      {
        status: 500,
        message: "Se ha producido un ERROR al obtener los usuarios inhabilitados",
      }
    );
  }
};
// Autor: Jonatan Pacora Vega
// 19/10/22
/* el codigo aqui permite Buscar
  a un usuario por su dni*/
export const getUserDni = async (req, res) => {
  try {
    const { dni } = req.params;

    let sql = `CALL sp_obtener_usuario_dni('${dni}')`;
    const pool = mysql.createPool(config_mysql)
    const promiseQuery = promisify(pool.query).bind(pool)
    const promisePoolEnd = promisify(pool.end).bind(pool)
    const result = await promiseQuery(sql)

    promisePoolEnd()
    const usuario = Object.values(JSON.parse(JSON.stringify(result[0])));
    for (var i = 0; i < usuario.length; i++) {
      if(usuario[i].rol == 100){
        usuario[i].rol_display = "Administrador"; 
      }
      if(usuario[i].rol == 120)
      {
        usuario[i].rol_display = "Jefe de Almacen"; 
      }
      if(usuario[i].rol == 121)
      {
        usuario[i].rol_display = "Almacenero";
      }
      
}
    return res.json(
      {
        status: 200,
        message: "Se ha obtenido el usuario solicitado por dni",
        data: usuario
      }
    );
  } catch (error) {
    console.log(error)
    return res.json(
      {
        status: 500,
        message: "Se ha producido un ERROR al obtener el usuario por su dni",
        error
      }
    );
  }

};
/* el codigo aqui permite editar un usuario*/
export const updateUserById = async (req, res) => {
  try {
    const { email, password ,telefono, direccion,rol } = req.body;   
    const { _id } = req.params;
    // Encriptando contraseñ al editar
    const contrasenia= await hashPassword(password);

    let sql = `CALL sp_actualizar_usuario_por_id('${_id}','${email}','${contrasenia}','${telefono}','${direccion}','${rol}')`;
    const pool = mysql.createPool(config_mysql)
    const promiseQuery = promisify(pool.query).bind(pool)
    const promisePoolEnd = promisify(pool.end).bind(pool)

    const result = await promiseQuery(sql)

    promisePoolEnd()
    const usuario_updated = Object.values(JSON.parse(JSON.stringify(result[0])));
    if (!usuario_updated.length==1) {
      return res.json({
        status: 404,
        message: "No se encontró al usuario que se quiere editar",
      });
    }
    return res.json(
      {
        status: 200,
        message: "Se ha actualizado al usuario correctamente ",
        data: usuario_updated
      }
    );   
   
  } catch (error) {
    console.log(error);
    return res.json({
      status: 500,
      message: "Ha aparecido un ERROR al momento de actualizar a un usuario",

    });
  }


}
/* el codigo aqui permite dar de baja a un usuario*/
export const updateUserInhabilitar = async (req, res) => {
  try {
    const { _id } = req.params;

    let sql = `CALL sp_actualizar_usuario_inhabilitar('${_id}')`;
    const pool = mysql.createPool(config_mysql)
    const promiseQuery = promisify(pool.query).bind(pool)
    const promisePoolEnd = promisify(pool.end).bind(pool)
    const result = await promiseQuery(sql)

    promisePoolEnd()
    const usuario = Object.values(JSON.parse(JSON.stringify(result[0])));
    return res.json(
      {
        status: 200,
        message: "Se ha dado de baja al usuario",
        data: usuario
      }
    );
  } catch (error) {
    console.log(error)
    return res.json(
      {
        status: 500,
        message: "Se ha producido un ERROR al dar de baja usuario",
        error
      }
    );
  }
}

/* el codigo aqui permite dar de Alta a un usuario*/
export const updateUserHabilitar = async (req, res) => {
  try {
    const { _id } = req.params;

    let sql = `CALL sp_actualizar_usuario_habilitar('${_id}')`;
    const pool = mysql.createPool(config_mysql)
    const promiseQuery = promisify(pool.query).bind(pool)
    const promisePoolEnd = promisify(pool.end).bind(pool)
    const result = await promiseQuery(sql)

    promisePoolEnd()
    const usuario = Object.values(JSON.parse(JSON.stringify(result[0])));
    return res.json(
      {
        status: 200,
        message: "Se ha habilitado el usuario",
        data: usuario
      }
    );
  } catch (error) {
    console.log(error)
    return res.json(
      {
        status: 500,
        message: "Se ha producido un ERROR al dar de alta al usuario",
        error
      }
    );
  }

}
