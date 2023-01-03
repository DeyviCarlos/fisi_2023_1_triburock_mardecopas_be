import { Router } from 'express';
const router = Router();
import * as productosCtrl from '../controllers/producto.controllers';
import {authJwt} from '../middlewares'
// Definimos las rutas::
router.get('/', productosCtrl.getProductos);
router.get('/inhabilitados/', productosCtrl.getProductosInhabilitados);
router.get('/read/:codigo', productosCtrl.getProductoByCode);
router.get('/stockminimo/', productosCtrl.getProductoByStockMinimo); /// Enpoint de listar stock minimo
router.get('/:_id', productosCtrl.getProductoById);

router.post('/', [authJwt.verifyToken,authJwt.isJefeAlmacen],productosCtrl.createProducto);
router.put('/:_id',[authJwt.verifyToken,authJwt.isJefeAlmacen], productosCtrl.updateProductById);
router.put("/inhabilitar/:_id",[authJwt.verifyToken,authJwt.isJefeAlmacen],  productosCtrl.updateProductInhabilitar);
router.put("/habilitar/:_id",[authJwt.verifyToken,authJwt.isJefeAlmacen], productosCtrl.updateProductHabilitar);

module.exports= router;