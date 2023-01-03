import express from 'express'
import morgan from 'morgan'

import { createRoles } from './libs/initialSetup'


import auhtRoutes from './routes/auth'
import usersRoutes from './routes/user'

import rolRoutes from './routes/roles'


const cors = require('cors')
let corsOptions = {
    origin: '*' // Compliant
  };
let app = express();
app.disable("x-powered-by");
app.use(cors(corsOptions))
//createRoles();
app.use(morgan("dev"));
app.use(express.json());

app.use('/api/auth',auhtRoutes)
app.use('/api/users',usersRoutes)

app.use('/api/roles',rolRoutes)



export default app;