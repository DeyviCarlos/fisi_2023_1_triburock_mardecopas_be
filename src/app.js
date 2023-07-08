import express from 'express'
import morgan from 'morgan'
import path from 'path'
import { createRoles } from './libs/initialSetup'

import productosRoutes from './routes/producto'
import categoriaRoutes from './routes/categoria'
import auhtRoutes from './routes/auth'
import usersRoutes from './routes/user'
import movimientoRoutes from './routes/movimiento'
import rolRoutes from './routes/roles'


const cors = require('cors')
let corsOptions = {
    origin: '*' // Compliant
  };
let app = express();
app.disable("x-powered-by");
app.use(cors(corsOptions))
app.use(express.static(path.join(__dirname, '../reportes')));
//createRoles();
app.use(morgan("dev"));
app.use(express.json());
app.use('/ne-gestion-productos/servicio-al-cliente/v1',productosRoutes)
app.use('/api/categoria',categoriaRoutes)
app.use('/api/auth',auhtRoutes)
app.use('/api/users',usersRoutes)
app.use('/api/movimiento',movimientoRoutes)
app.use('/api/roles',rolRoutes)



export default app;