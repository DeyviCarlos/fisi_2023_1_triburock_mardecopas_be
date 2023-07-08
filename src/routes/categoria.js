import { Router } from 'express';

const router = Router();

import * as categoriasCtrl from '../controllers/categoria.controllers';

import {authJwt} from '../middlewares'


// Definimos las rutas::
router.get('/obtener-categorias-habilitadas', categoriasCtrl.getCategorias);
router.get('/obtener-categorias-deshabilitadas', categoriasCtrl.getCategoriasInhabilitadas);
router.get('/obtener-categorias-por-codigo/:codigo', categoriasCtrl.getCategoriaByCode);
router.get('/obtener-categorias-por-nombre/:name', categoriasCtrl.getCategoriaByName);
router.post('/agregar-categorias',[authJwt.verifyToken,authJwt.isJefeAlmacen], categoriasCtrl.createCategoria);
router.put('/dar-baja-categorias/:_id',[authJwt.verifyToken,authJwt.isJefeAlmacen], categoriasCtrl.updateCategoriaInhabilitar);
router.put('/dar-alta-categorias/:_id',[authJwt.verifyToken,authJwt.isJefeAlmacen], categoriasCtrl.updateCategoriaHabilitar);


module.exports= router;