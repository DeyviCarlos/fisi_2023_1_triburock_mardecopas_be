import { Schema, model } from "mongoose";

export const ROLES = ["user", "admin", "jefe_almacen","almacenero"];

const roleSchema = new Schema({
    name: String},
    {versionKey:false
    })

export default model("Role",roleSchema)
 
