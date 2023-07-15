import { Router } from 'express';
const router = Router();
import * as productosCtrl from '../controllers/producto.controllers';
import {authJwt} from '../middlewares'
// Definimos las rutas::
router.get('/obtener-productos-habilitados', productosCtrl.getProductos);
router.get('/obtener-productos-deshabilitados', productosCtrl.getProductosInhabilitados);
router.get('/obtener-productos/codigo/:codigo', productosCtrl.getProductoByCode);
router.get('/obtener-productos-stock-minimo', productosCtrl.getProductoByStockMinimo); /// Enpoint de listar stock minimo
router.get('/obtener-productos/:_id', productosCtrl.getProductoById);

router.post('/agregar-productos', [authJwt.verifyToken,authJwt.isJefeAlmacen],productosCtrl.createProducto);
router.put('/actualizar-productos/:_id',[authJwt.verifyToken,authJwt.isJefeAlmacen], productosCtrl.updateProductById);
router.put("/dar-baja-productos/:_id",[authJwt.verifyToken,authJwt.isJefeAlmacen],  productosCtrl.updateProductInhabilitar);
router.put("/dar-alta-productos/:_id",[authJwt.verifyToken,authJwt.isJefeAlmacen], productosCtrl.updateProductHabilitar);

module.exports= router;