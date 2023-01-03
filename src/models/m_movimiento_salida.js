import { Schema,model } from "mongoose";

const movimientoSalidaSchema = new Schema(
{
    codigo:{
        type:String,  
        unique:true      
    },
    estado:{
        type:String,               
    },
    factura:{
        type: String
     },
    fecha:{
        type: Date       
    },
    id_usuario:{
        type: Number
    },
    cliente:{
        type: String
    },
    lista_items:[]    
      
},
  // esto ultimo que coloco es para que identifique a la coleccion en la
  // que deseo trabajar, antes me creaba una nueva.
{ collection: 'movimientosSalida' },
{timestamps: true , versionKey:false},

);

// El esquema ayuda a decirle a mongo db como van a lucir los datos
// CREANDO MODELOS:

let M_mov = model('m_movimientoSalida',movimientoSalidaSchema);
module.exports = M_mov;