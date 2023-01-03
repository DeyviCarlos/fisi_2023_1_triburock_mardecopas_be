import { Schema,model } from "mongoose";

const movimientoSchema = new Schema(
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
    tipo:{
        type:String    
    },
    fecha:{
        type: Date       
    },
    id_responsable:{
     type: Schema.Types.ObjectId
    },
    name_responsable:{
        type: String
    },
    lista_items:[]    
      
},
  // esto ultimo que coloco es para que identifique a la coleccion en la
  // que deseo trabajar, antes me creaba una nueva.
{ collection: 'movimientos' },
{timestamps: true , versionKey:false},

);

// El esquema ayuda a decirle a mongo db como van a lucir los datos
// CREANDO MODELOS:

let M_mov = model('m_movimiento',movimientoSchema);
module.exports = M_mov;