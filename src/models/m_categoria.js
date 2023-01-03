import { Schema,model } from 'mongoose';
const categoria = new Schema(
    {
        codigo:{
            type:String,
            unique:true
        },
        nombre:{
            type: String,
            unique:true
        },  
        estado:{
            type:String           
        }
        
    }
, { collection: 'categoria' });

// El esquema ayuda a decirle a mongo db como van a lucir los datos

// CREANDO MODELOS:

let M_categorias = model('m_categoria',categoria);
module.exports = M_categorias;