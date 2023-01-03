//authorizacion
import jwt from "jsonwebtoken";
import config from "../config";

import User from '../models/m_user'
import Role from '../models/m_role'


let mysql = require('mysql');
const { promisify } = require('util')
var config_mysql = require('../config_mysql.js')

// Jonatan Pacora Vega
// 17/10/22
// Esta funcion es para verificacion del token de sesion
export const verifyToken= async (req, res,next) => {
    try {
        const token = req.headers["x-access-token"];

        if(!token) return res.status(403).json({message:"No token provided"})
    
        const decoded = jwt.verify(token,config.SECRET)
        req.userId=decoded.id;

        let sql = `CALL sp_obtener_usuario_id('${req.userId}')`;
        const pool = mysql.createPool(config_mysql)
        const promiseQuery = promisify(pool.query).bind(pool)
        const promisePoolEnd = promisify(pool.end).bind(pool)
        const result = await promiseQuery(sql)
        promisePoolEnd()
        const userFound = Object.values(JSON.parse(JSON.stringify(result[0])));  
            
        if(!userFound.length==1) return res.status(404).json({message: "usuario no encontrado"})
    
        next()
    } catch (error) {
        return res.status(500).json({message: 'No autorizado'})
    }
   
};
// Esta funcion es para verificacion de que el usuario logueado es un Jefe de Almacen
export const isJefeAlmacen= async (req, res,next) => {
  let sql = `CALL sp_obtener_usuario_id('${req.userId}')`;
  const pool = mysql.createPool(config_mysql)
  const promiseQuery = promisify(pool.query).bind(pool)
  const promisePoolEnd = promisify(pool.end).bind(pool)
  const result = await promiseQuery(sql)
  promisePoolEnd()
  const user = Object.values(JSON.parse(JSON.stringify(result[0])));
  const rol=user[0].rol ;

    if(rol == 120){
        next();
        return;
    }
  
 return res.status(403).json({message:"Requiere Rol Jefe Almacen"});
};
// Esta funcion es para verificacion de que el usuario logueado es un Administrador
export const isAdmin= async (req, res,next) => {
  let sql = `CALL sp_obtener_usuario_id('${req.userId}')`;
  const pool = mysql.createPool(config_mysql)
  const promiseQuery = promisify(pool.query).bind(pool)
  const promisePoolEnd = promisify(pool.end).bind(pool)
  const result = await promiseQuery(sql)
  promisePoolEnd()
  const user = Object.values(JSON.parse(JSON.stringify(result[0])));
  const rol=user[0].rol ;

    if(rol == 100){
        next();
        return;
    }
  
 return res.status(403).json({message:"Requiere Rol de Admin"});
  };

// Esta funcion es para verificacion de que el usuario logueado es un Almacenero
 export const isALmacenero= async (req, res,next) => {
  let sql = `CALL sp_obtener_usuario_id('${req.userId}')`;
  const pool = mysql.createPool(config_mysql)
  const promiseQuery = promisify(pool.query).bind(pool)
  const promisePoolEnd = promisify(pool.end).bind(pool)
  const result = await promiseQuery(sql)
  promisePoolEnd()
  const user = Object.values(JSON.parse(JSON.stringify(result[0])));
  const rol=user[0].rol ;

    if(rol == 121){
        next();
        return;
    }
  
 return res.status(403).json({message:"Requiere Rol de Almacenero"});
   };

   export const isJefeOrAlmacenero= async (req, res,next) => {
    let sql = `CALL sp_obtener_usuario_id('${req.userId}')`;
    const pool = mysql.createPool(config_mysql)
    const promiseQuery = promisify(pool.query).bind(pool)
    const promisePoolEnd = promisify(pool.end).bind(pool)
    const result = await promiseQuery(sql)
    promisePoolEnd()
    const user = Object.values(JSON.parse(JSON.stringify(result[0])));
    const rol=user[0].rol ;

      if(rol == 120 || rol ==121){
          next();
          return;
      }   
    return res.status(403).json({message:"Requiere Rol de Jefe o Almacenero "});
   };

