import { Schema,model } from "mongoose";

const movimientoEntradaSchema = new Schema(
{
    codigo:{
        type:String,  
        unique:true      
    },
    estado:{
        type:String,               
    },
    orden_compra:{
        type: String
     },  
    tipo:{
        type:String    
    },
    fecha:{
        type: Date       
    },
    id_usuario:{
     type: Number
    },
    proveedor:{
        type: String
    },
    lista_items:[]    
      
},
  // esto ultimo que coloco es para que identifique a la coleccion en la
  // que deseo trabajar, antes me creaba una nueva.
{ collection: 'movimientosentrada' },
{timestamps: true , versionKey:false},

);

// El esquema ayuda a decirle a mongo db como van a lucir los datos
// CREANDO MODELOS:

let M_mov = model('m_movimiento_entrada',movimientoEntradaSchema);
module.exports = M_mov;