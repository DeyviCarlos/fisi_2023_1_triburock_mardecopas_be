import app from './app'
import './database'


const mongoose = require("mongoose");
// SETTING
app.set("port", process.env.PORT);
app.set("host", process.env.HOST);
// SERVER  ESCUCHANDO
app.listen(app.get("port"), app.get("host"), () => {
  console.log("Servidor en puerto", app.get("port"));
});
