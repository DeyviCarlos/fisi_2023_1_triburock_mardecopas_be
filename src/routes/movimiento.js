import { Router } from 'express';
const router = Router();
import * as movCtrl from '../controllers/movimiento.controllers';
import {authJwt} from '../middlewares'
// Definimos las rutas::

// router.post('/create',[authJwt.verifyToken,authJwt.isJefeOrAlmacenero], movCtrl.createMovimiento);
// router.get('/searchByCode/:codigo',[authJwt.verifyToken,authJwt.isJefeOrAlmacenero], movCtrl.getMovimientoByCode);
// router.put('/anular_mov/:_id',[authJwt.verifyToken,authJwt.isJefeAlmacen], movCtrl.updateAnular);
// router.get('/aprobados',[authJwt.verifyToken,authJwt.isJefeOrAlmacenero], movCtrl.getMovimientosAprobados);
// router.get('/anulados',[authJwt.verifyToken,authJwt.isJefeOrAlmacenero], movCtrl.getMovimientosAnulados);
// router.get('/reporte/:codigo'/*,[authJwt.verifyToken,authJwt.isJefeOrAlmacenero]*/, movCtrl.getReporte);
//-----------movimientos entrada-----------------------------------
router.post('/entrada/create',[authJwt.verifyToken,authJwt.isJefeOrAlmacenero], movCtrl.createMovimientoEntrada);
router.get('/entrada/searchByCode/:codigo',[authJwt.verifyToken,authJwt.isJefeOrAlmacenero], movCtrl.getMovimientoByCodeEntrada);
router.put('/entrada/anular_mov/:_id',[authJwt.verifyToken,authJwt.isJefeAlmacen], movCtrl.updateAnularEntrada);
router.get('/entrada/aprobados',[authJwt.verifyToken,authJwt.isJefeOrAlmacenero], movCtrl.getMovimientosAprobadosEntrada);
router.get('/entrada/anulados',[authJwt.verifyToken,authJwt.isJefeOrAlmacenero], movCtrl.getMovimientosAnuladosEntrada);
router.get('/entrada/items/:_id',[authJwt.verifyToken,authJwt.isJefeOrAlmacenero], movCtrl.getItemsEntrada);
//-----------movimientos salida-----------------------------------
router.post('/salida/create',[authJwt.verifyToken,authJwt.isJefeOrAlmacenero], movCtrl.createMovimientoSalida);
router.get('/salida/searchByCode/:codigo',[authJwt.verifyToken,authJwt.isJefeOrAlmacenero], movCtrl.getMovimientoByCodeSalida);
router.put('/salida/anular_mov/:_id',[authJwt.verifyToken,authJwt.isJefeAlmacen], movCtrl.updateAnularSalida);
router.get('/salida/aprobados',[authJwt.verifyToken,authJwt.isJefeOrAlmacenero], movCtrl.getMovimientosAprobadosSalida);
router.get('/salida/anulados',[authJwt.verifyToken,authJwt.isJefeOrAlmacenero], movCtrl.getMovimientosAnuladosSalida);
router.get('/salida/items/:_id',[authJwt.verifyToken,authJwt.isJefeOrAlmacenero], movCtrl.getItemsSalida);

module.exports= router;