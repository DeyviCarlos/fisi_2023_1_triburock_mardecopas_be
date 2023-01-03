//Validation
import User from "../models/m_user";

let mysql = require('mysql');
const { promisify } = require('util')
var config_mysql = require('../config_mysql.js')
//Jonatan Pacora Vega
// 17/10/22
// Esta funcion es para verificacion la existencia de un usuario con el mismo username
// O si el correo ya existe en la base de datos
export const checkExistingUser = async (req, res, next) => {
  try {
    let sql = `CALL sp_obtener_usuario_username('${req.body.username}')`;
    const pool = mysql.createPool(config_mysql)
    const promiseQuery = promisify(pool.query).bind(pool)
    const promisePoolEnd = promisify(pool.end).bind(pool)
    const result = await promiseQuery(sql)
    promisePoolEnd()
    const userFound = Object.values(JSON.parse(JSON.stringify(result[0])));   
    if (userFound.length==1){
       console.log(userFound)
      return res.status(400).json({ message: "El usuario ya existe" });}

    // Para el correo:
    let sql2 = `CALL sp_obtener_usuario_correo('${req.body.email}')`;
    const pool2 = mysql.createPool(config_mysql)
    const promiseQuery2 = promisify(pool2.query).bind(pool2)
    const promisePoolEnd2 = promisify(pool2.end).bind(pool2)
    const result2 = await promiseQuery2(sql2)
    promisePoolEnd2()
    const userFound2 = Object.values(JSON.parse(JSON.stringify(result2[0])));   
    if (userFound2.length==1) {  
      console.log(userFound2.email) 
      return res.status(400).json({ message: "el email ya existe" });}
    
    // Para el dni:
    let sql3 = `CALL sp_obtener_usuario_dni('${req.body.dni}')`;
    const pool3 = mysql.createPool(config_mysql)
    const promiseQuery3 = promisify(pool3.query).bind(pool3)
    const promisePoolEnd3 = promisify(pool3.end).bind(pool3)
    const result3 = await promiseQuery3(sql3)
    promisePoolEnd3()
    const userFound3 = Object.values(JSON.parse(JSON.stringify(result3[0])));   
    if (userFound3.length==1)
        return res.status(400).json({ message: "Ya existe un usuario con ese DNI" });

    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// // Para verificacion de la existencia del Rol de usuario
// export const checkExistingRole = (req, res, next) => {
  

//   if (!req.body.roles) return res.status(400).json({ message: "No roles" });

  
//   if (!ROLES.includes(req.body.roles)) {
//       return res.status(400).json({
//         message: `Role ${req.body.roles} does not exist`,
//       });
//   }
  
//   next();
// };