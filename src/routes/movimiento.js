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
//router.get('/reporte/:codigo'/*,[authJwt.verifyToken,authJwt.isJefeOrAlmacenero]*/, movCtrl.getReporte);
//-----------movimientos entrada-----------------------------------
router.post('/agregar-movimientos-entradas',[authJwt.verifyToken,authJwt.isJefeOrAlmacenero], movCtrl.createMovimientoEntrada);
router.get('/obtener-movimientos-entradas/:codigo',[authJwt.verifyToken,authJwt.isJefeOrAlmacenero], movCtrl.getMovimientoByCodeEntrada);
router.put('/anular-movimientos-entradas/:_id',[authJwt.verifyToken,authJwt.isJefeAlmacen], movCtrl.updateAnularEntrada);
router.get('/obtener-movimientos-entradas-aprobados',[authJwt.verifyToken,authJwt.isJefeOrAlmacenero], movCtrl.getMovimientosAprobadosEntrada);
router.get('/obtener-movimientos-entradas-anulados',[authJwt.verifyToken,authJwt.isJefeOrAlmacenero], movCtrl.getMovimientosAnuladosEntrada);
router.get('/obtener-items-entradas/:_id',[authJwt.verifyToken,authJwt.isJefeOrAlmacenero], movCtrl.getItemsEntrada);
//router.get('/entrada/movEntradaByCode/:codigo'/*,[authJwt.verifyToken,authJwt.isJefeOrAlmacenero]*/, movCtrl.obtenerMovEntradaCompletoByCode);
//-----------movimientos salida-----------------------------------
router.post('/agregar-movimientos-salidas',[authJwt.verifyToken,authJwt.isJefeOrAlmacenero], movCtrl.createMovimientoSalida);
router.get('/obtener-movimientos-salidas/:codigo',[authJwt.verifyToken,authJwt.isJefeOrAlmacenero], movCtrl.getMovimientoByCodeSalida);
router.put('/anular-movimientos-salidas/:_id',[authJwt.verifyToken,authJwt.isJefeAlmacen], movCtrl.updateAnularSalida);
router.get('/obtener-movimientos-salidas-aprobados',[authJwt.verifyToken,authJwt.isJefeOrAlmacenero], movCtrl.getMovimientosAprobadosSalida);
router.get('/obtener-movimientos-salidas-anulados',[authJwt.verifyToken,authJwt.isJefeOrAlmacenero], movCtrl.getMovimientosAnuladosSalida);
router.get('/obtener-items-salidas/:_id',[authJwt.verifyToken,authJwt.isJefeOrAlmacenero], movCtrl.getItemsSalida);
//router.get('/salida/movSalidaByCode/:codigo'/*,[authJwt.verifyToken,authJwt.isJefeOrAlmacenero]*/, movCtrl.obtenerMovSalidaCompletoByCode);


module.exports= router;