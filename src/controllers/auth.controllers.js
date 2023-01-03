import jwt from 'jsonwebtoken'
import config  from '../config'
import { hashPassword, comparePassword } from "../core/bcrypt";

let mysql = require('mysql');
const { promisify } = require('util')
var config_mysql = require('../config_mysql.js')


export const signUp = async (req, res) => {
    try {
        const {
          username,
          email,
          password,
          direccion,
          telefono,
          dni          
        } = req.body;

        const newpassword=  await hashPassword(password);
        const rol_id= 121;
        let sql = `CALL sp_generar_usuario('${username}','${email}','${newpassword}','${direccion}','${telefono}','${dni}','${rol_id}')`;
        const pool = mysql.createPool(config_mysql)
        const promiseQuery = promisify(pool.query).bind(pool)
        const promisePoolEnd = promisify(pool.end).bind(pool)
        const result = await promiseQuery(sql)
    
        promisePoolEnd()
        const usuario = Object.values(JSON.parse(JSON.stringify(result[0])));
        return res.status(200).json(
          {
            status: 200,
            message: "Se ha creado el usuario correctamente ",
            data: usuario
          }
        );      

      } catch (error) {
        console.log(error)
    
        return res.status(500).json(
          {
            status: 500,
            message: "Se ha producido un ERROR al crear el  usuario",
            error
          }
        );
      }       
   
}

export const signIn = async (req, res) => {
  try{
    //const userFound= await User.findOne({email: req.body.email}).populate("roles");   
    const {
      email,
      password      
    } = req.body;
    
    //console.log(email,password)
    let sql = `CALL sp_obtener_usuario_correo('${email}')`;
    const pool = mysql.createPool(config_mysql)
    const promiseQuery = promisify(pool.query).bind(pool)
    const promisePoolEnd = promisify(pool.end).bind(pool)
    const result = await promiseQuery(sql)

    promisePoolEnd()
    const userFound = Object.values(JSON.parse(JSON.stringify(result[0])));
    const contrasenia= userFound[0].password;

    if(userFound[0].estado =="inhabilitado") return res.status(403).json({message:"Usuario sin Permisos"})
    if(!userFound) return res.status(400).json({message:"Usuario no encontrado"})

    const matchPassword= await comparePassword(password, contrasenia)

    if(!matchPassword) return res.status(401).json({token: null, message: 'Contraseña invalida'})
    
    const roles= userFound[0].rol;
    
   // console.log('role',roles)

    const id =userFound[0].id;
    const rol_id=userFound[0].rol;
    const nombre=userFound[0].username ;
    const token= jwt.sign({id: userFound[0].id, username: userFound[0].username, rol: roles}, config.SECRET,{
        expiresIn: 86400
    })

    res.status(200).json({
      id,rol_id,nombre,token

    
    
    })
  } catch (error) {
    console.log(error)

    return res.status(500).json(
      {
        status: 500,
        message: "Se ha producido un ERROR al  iniciar sesión ",
        error
      }
    );
  } 
}