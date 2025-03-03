import {Router} from 'express';
import { pool } from "../db.js";
const router = Router();


router.get('/precios/information', async (req, res) => {

    const hojasQuery = 'SELECT * FROM precioPorHoja;';
    const resultHojas = await pool.query(hojasQuery);
    const anilladoQuery = 'SELECT * FROM precioPorAnillado;';
    const resultAnillado = await pool.query(anilladoQuery);


    const precios = {
        preciosAnillado : resultAnillado[0],
        preciosHojas : resultHojas[0]
    }

    res.send(precios);
});

export default router;