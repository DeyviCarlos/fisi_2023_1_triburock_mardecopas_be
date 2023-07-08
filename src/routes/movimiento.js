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
router.post('/agregar-movimientos-entrada',[authJwt.verifyToken,authJwt.isJefeOrAlmacenero], movCtrl.createMovimientoEntrada);
router.get('/obtener-movimientos-entrada-por-codigo/:codigo',[authJwt.verifyToken,authJwt.isJefeOrAlmacenero], movCtrl.getMovimientoByCodeEntrada);
router.put('/anular-movimientos-entrada/:_id',[authJwt.verifyToken,authJwt.isJefeAlmacen], movCtrl.updateAnularEntrada);
router.get('/obtener-movimientos-entrada-aprobados',[authJwt.verifyToken,authJwt.isJefeOrAlmacenero], movCtrl.getMovimientosAprobadosEntrada);
router.get('/obtener-movimientos-entrada-anulados',[authJwt.verifyToken,authJwt.isJefeOrAlmacenero], movCtrl.getMovimientosAnuladosEntrada);
router.get('/obtener-items-entrada/:_id',[authJwt.verifyToken,authJwt.isJefeOrAlmacenero], movCtrl.getItemsEntrada);
//router.get('/entrada/movEntradaByCode/:codigo'/*,[authJwt.verifyToken,authJwt.isJefeOrAlmacenero]*/, movCtrl.obtenerMovEntradaCompletoByCode);
//-----------movimientos salida-----------------------------------
router.post('/agregar-movimientos-salida',[authJwt.verifyToken,authJwt.isJefeOrAlmacenero], movCtrl.createMovimientoSalida);
router.get('/obtener-movimientos-salida-por-codigo/:codigo',[authJwt.verifyToken,authJwt.isJefeOrAlmacenero], movCtrl.getMovimientoByCodeSalida);
router.put('/anular-movimientos-salida/:_id',[authJwt.verifyToken,authJwt.isJefeAlmacen], movCtrl.updateAnularSalida);
router.get('/obtener-movimientos-salida-aprobados',[authJwt.verifyToken,authJwt.isJefeOrAlmacenero], movCtrl.getMovimientosAprobadosSalida);
router.get('/obtener-movimientos-salida-anulados',[authJwt.verifyToken,authJwt.isJefeOrAlmacenero], movCtrl.getMovimientosAnuladosSalida);
router.get('/obtener-items-salida/:_id',[authJwt.verifyToken,authJwt.isJefeOrAlmacenero], movCtrl.getItemsSalida);
//router.get('/salida/movSalidaByCode/:codigo'/*,[authJwt.verifyToken,authJwt.isJefeOrAlmacenero]*/, movCtrl.obtenerMovSalidaCompletoByCode);


module.exports= router;