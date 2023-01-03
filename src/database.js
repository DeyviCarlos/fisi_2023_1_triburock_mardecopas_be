import mongoose from 'mongoose'
require("dotenv").config();
/*const url = process.env.MONGO_DB_URL;
mongoose
  .connect(url, { dbName: "PytoAlmacen"
  // ,userNewUrlparser:true,
  // useUnifiedTopology:true,
  // useFindAndModify:true
})
  .then(() => console.log("Conectado a Mongo Atlas"))
  .catch((e) => console.log("Error de conexion" + e));*/
var mysql=require('mysql');
var config_mysql=require('./config_mysql.js')
var conexion=mysql.createConnection(config_mysql)
conexion.connect(function(error){
  if(error){
    throw error;
  }else{
    console.log('CONEXION EXITOSA');
  }
});
conexion.end();
/*var conexion=mysql.createConnection(config_mysql)
    let sql = `CALL sp_get_categorias()`;
    conexion.query(sql, true, (error, results, fields) => {
        if (error) {
          return console.error(error.message);
        }
        console.log(results[0]);
    });
    //conexion.end();*/