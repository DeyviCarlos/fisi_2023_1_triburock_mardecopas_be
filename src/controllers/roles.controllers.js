let mysql = require('mysql');
const { promisify } = require('util')
var config_mysql = require('../config_mysql.js')

export const getRoles = async (req, res) => {
    try {
      let sql = `CALL sp_obtener_roles()`;
      const pool = mysql.createPool(config_mysql)
      const promiseQuery = promisify(pool.query).bind(pool)
      const promisePoolEnd = promisify(pool.end).bind(pool)
      const result = await promiseQuery(sql)
      promisePoolEnd()
      const roles = Object.values(JSON.parse(JSON.stringify(result[0])));
      return res.json(
        {
          status: 200,
          message: "Se ha obtenido los roles",
          data: roles
        }
      );
    } catch (error) {
      console.log(error)
      return res.json(
        {
          status: 500,
          message: "Se ha producido un ERROR los roles",
        }
      );
    }
  }