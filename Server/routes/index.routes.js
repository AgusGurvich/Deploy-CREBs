import {Router} from 'express';
import { pool } from '../db.js';
import auth from '../lib/auth.js';
const router = Router();

router.get('/', (req, res) => {
    res.render('login');
});

router.get("/cancion/para/mi/muerte", async (req, res) => {
    res.render('ingresoControl');
});

router.get('/control', auth.isLinea ,(req, res) => {
    res.render('control');
});

router.get('/crearBecario', auth.isLinea ,(req, res) => {
    res.render('crearBecario');
});



// Tambien podriamos usar
//[rows] paara devolver directamente las filas


export default router;