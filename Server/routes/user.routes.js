import { Router } from "express";
import { pool } from "../db.js";
import multer from 'multer';
import fs from 'fs';
import { v4 } from "uuid";
import auth from "../lib/auth.js"; 
import flash from 'connect-flash';
import tma from "timeago.js";
import { ResultWithContextImpl } from "express-validator/src/chain/context-runner-impl.js";
const {timeago} = tma;
import session from "express-session";
import { log } from "console";

const router = Router();


    router.get("/inicio", auth.isLoggedIn , auth.isUser ,async (req,res)=>{ // Primero Voy a hacer la consulta a la sesion de que usuario se trata y luego voy a pedir que devuelva ese nombre.
        //const flash = req.session.mensaje
        //console.log(req.session.mensaje);
        //delete req.session.mensaje
        //const flash = req.flash('hola');
        //console.log(flash);
        res.render('index', {
                flash
            });
         });

    router.get("/Como_funciona", auth.isLoggedIn, auth.isUser ,(req,res)=> { 
        res.render('Como_funciona');
    })

router.get("/prereserva", auth.isLoggedIn , auth.isUser ,async (req,res)=>{ 
    const prereservaQuery = 'SELECT * FROM prereserva ORDER BY id';
    const result = await pool.query(prereservaQuery);
    let prereserva = result[0];
    res.render('prereserva', {
        prereserva : prereserva
    });
});

router.post("/prereserva/ordenar/:ordenID", auth.isLoggedIn , auth.isUser ,async (req,res)=>{ 
    //Pido el numero de orden para ingresarlo
    const id = req.params.ordenID;
    const prereservaQuery = 'SELECT * FROM prereserva WHERE id = ?';
    const result = await pool.query(prereservaQuery, [id]);
    let prereserva = result[0];
    //Ingreso el pedido a su nombre
    //Datos del pedido
    const nombre = prereserva[0].nombre;
    const precio = prereserva[0].precio;
    const Descripcion = prereserva[0].nombre;
    const copias = 1;
    const tipo_impresion = "Pre";
    const user_id = req.user.id;
    const formato = "Pre"; // A4 
    const anillado = "Prereserva"; // Sin info
    const Link = prereserva[0].nombre; 
    const Fotocopiadora = "Pre";
    const ahora = new Date();
    const fecha = ahora.toISOString().slice(0, 19).replace('T', ' '); // Convierte a formato  
    const color = 0;    
    const salida = nombre + ' ordenado correctamente. Andá a Historial para pagarlo!';
    req.session.mensaje = salida;    
    // Insertar el pedido de prereserva
    const insertQuery = 'INSERT INTO pedidos (precio, descripción, copias, tipo_impresion, user_id, formato, anillado, link, nombre, fotocopiadora, fecha, color) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);';
    await pool.query(insertQuery, [precio, Descripcion, copias, tipo_impresion, user_id, formato, anillado, Link, nombre, Fotocopiadora, fecha, color], (err, result) => {
      if (err) { 
        console.error('Error al insertar datos en la base de datos:', err);
        res.status(500).send('Error interno del servidor'); 
        return;
      }
      console.log('El pedido no se subió correctamente');
    });
    console.log(req.session.mensaje);   
    req.flash('mensaje', salida)

    res.redirect("/inicio");
});


router.get("/pedido",  auth.isLoggedIn, auth.isUser , (req,res)=> {
    res.render('pedido');
})


const upload = multer({ dest: 'uploads/' });

router.post("/pedido", auth.isUser, upload.single('archivo'), async (req, res) => {
    const archivo = req.file;
    const user = req.user;
    
    const id = req.user.id;
    const ahora = new Date();
    const fechaHora = ahora.toISOString().slice(0, 19).replace('T', ' '); // Convierte a formato  
 

    if(archivo) {
      
        const { originalname, mimetype, size } = archivo;
        const { select, copias, Descripcion, selectFaz, precio, Tipo, Anillado, Fotocopiadora, color } = req.body;
       
        let {Link} = req.body;
        const nombreArchivo = v4(); // Generar un nombre único para el archivo
        // Mover el archivo cargado a una ubicación permanente
        fs.renameSync(archivo.path, `uploads/${nombreArchivo}`);
    
        if(!Link) {
            Link = "No hay Link disponible";
        }
        
        // Insertar metadatos del archivo en la base de datos
        const insertQuery = 'INSERT INTO pedidos (tipo, precio, descripción, copias, tipo_impresion, user_id, nombre, nombre_archivo, tamaño, formato, anillado, link, fotocopiadora, fecha, color) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);';
        await pool.query(insertQuery, [mimetype, precio, Descripcion, copias, selectFaz, id, originalname , nombreArchivo, size, Tipo, Anillado, Link, Fotocopiadora, fechaHora, color], (err, result) => {
          if (err) { 
            console.error('Error al insertar datos en la base de datos:', err);
            res.status(500).send('Error interno del servidor'); 
            return;
          }
          console.log('Archivo subido correctamente.');
        });
    }
    else {

        const nombre = "Archivo en Link";
        
        const { select, copias, Descripcion, selectFaz, precio, Tipo, Link, Anillado, Fotocopiadora, color } = req.body;
        const insertQuery = 'INSERT INTO pedidos (precio, descripción, copias, tipo_impresion, user_id, formato, anillado, link, nombre, fotocopiadora, fecha, color) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);';
        await pool.query(insertQuery, [precio, Descripcion, copias, selectFaz, id, Tipo, Anillado, Link, nombre, Fotocopiadora, fechaHora, color], (err, result) => {
          if (err) { 
            console.error('Error al insertar datos en la base de datos:', err);
            res.status(500).send('Error interno del servidor'); 
            return;
          }
          console.log('Archivo subido correctamente.');
        });
    }
   
    req.flash('success', 'Pedido enviado correctamente');
    res.redirect("/inicio");
})

router.get('/download/:nombreArchivo', auth.isLoggedIn,  async (req, res)  => {
    const nombreArchivo = req.params.nombreArchivo;
  
    // Buscar el nombre del archivo en la base de datos
    const selectQuery = 'SELECT nombre, tipo FROM pedidos WHERE nombre_archivo = ?';

    try{
        const results = await pool.query(selectQuery, [nombreArchivo]);
        if (results[0].length === 0) {
            // Si no se encuentra el archivo, devolver un error 404
            return res.status(404).send('Archivo no encontrado');
        }
        const { nombre, tipo } = results[0][0];
        const path = `uploads/${nombreArchivo}`;
        //Revisamos que efectivamente esté
        fs.access(path, fs.constants.F_OK, (err) => {
            if (err) {
                // Si el archivo no existe, devolver un error 404
                return res.status(404).send('Archivo no encontrado');
            }
  
            // Envía el archivo como respuesta
            res.setHeader('Content-disposition', `attachment; filename=${nombre}`);
            res.setHeader('Content-type', tipo);
            fs.createReadStream(path).pipe(res);
        });

    } catch (err) {
        next(err);
    }
    });

// Para ver los comprobantes de pagos
    router.get('/downloadPago/:nombreArchivo', auth.isLoggedIn,  async (req, res)  => {
        const nombreArchivo = req.params.nombreArchivo;
        console.log(nombreArchivo);
        // Buscar el nombre del archivo en la base de datos
        const selectQuery = 'SELECT nombre, tipo FROM pagos WHERE nombreArchivo = ?';
    
        try{
            const results = await pool.query(selectQuery, [nombreArchivo]);
            if (results[0].length === 0) {
                // Si no se encuentra el archivo, devolver un error 404
                return res.status(404).send('Archivo no encontrado');
            }
            const { nombre, tipo } = results[0][0];
            const path = `uploads/${nombreArchivo}`;
            //Revisamos que efectivamente esté
            fs.access(path, fs.constants.F_OK, (err) => {
                if (err) {
                    // Si el archivo no existe, devolver un error 404
                    return res.status(404).send('Archivo no encontrado');
                }
      
                // Envía el archivo como respuesta
                res.setHeader('Content-disposition', `attachment; filename=${nombre}`);
                res.setHeader('Content-type', tipo);
                fs.createReadStream(path).pipe(res);
            });
    
        } catch (err) {
            next(err);
        }
    });
    


router.get("/cargar_saldo", auth.isLoggedIn, auth.isUser , (req,res)=> {
    res.render('cargar_saldo');
})

router.get("/historial",  auth.isLoggedIn, auth.isUser,  async (req,res)=> {
    const id = req.user.id; 
    const pedidosQuery = 'SELECT * FROM pedidos WHERE user_id = ? ORDER BY id DESC';
    const result = await pool.query(pedidosQuery, [id]);
    let pedidos = result[0];
    res.render('historial', {
        pedidos : pedidos
    });
}) 


router.get("/pedido/:id", auth.isLoggedIn, auth.isUser , async (req, res)=> {
    const {id} = req.params;

    const selectQuery = 'SELECT * FROM pedidos WHERE id = ?';
    const result = await pool.query(selectQuery, [id]);
    const pedido = result[0][0];
    if(pedido == undefined) {
        res.redirect("/inicio");
    } else {
        const user_id = result[0][0].user_id;
        const userQuery = 'SELECT nombre, saldo FROM users WHERE id = ?';
        const user = await pool.query(userQuery, [user_id]);
        const UserInformation = user[0][0];
    
        res.render('userHistorialUnidad', {
            pedido : pedido,
            user : UserInformation
        })
    }
}); 

router.get("/pedidoInformation/:id", auth.isLoggedIn , async (req, res)=> {
    const pedidoID = req.params.id;
    const precioQuery = 'SELECT precio, estadoPago, user_id, ingresado FROM pedidos WHERE id = ?';
    const pedidoResult = await pool.query(precioQuery, [pedidoID]);
    if(pedidoResult[0][0] == undefined) {
        res.redirect("/inicio");
    } else {
        const userID = pedidoResult[0][0].user_id;
        const saldoQuery = 'SELECT saldo FROM users Where id = ?';
        const userResult = await pool.query(saldoQuery, [userID]);         
        const information = {
            precio : pedidoResult[0][0].precio,
            estadoPago: pedidoResult[0][0].estadoPago,
            saldo : userResult[0][0].saldo,
            ingresado : pedidoResult[0][0].ingresado
        }
        res.send(information);
    
    }
});


router.put('/senarPedido/:id', auth.isLoggedIn , auth.isUser,  async (req, res) => {
      //lo quiere señar: pagar el 50%;
      const { id } = req.params;
      const redirecTURL =  `/pedido/${id}`;
      const precioQuery = 'SELECT precio, user_id, ingresado FROM pedidos WHERE id = ?';
      const pedidoResult = await pool.query(precioQuery, [id]);
      
      const { ingresado, precio, user_id} = pedidoResult[0][0];
      const saldoQuery = 'SELECT saldo FROM users WHERE id = ?';
      const userResult = await pool.query(saldoQuery, [user_id]);
      const { saldo } = userResult[0][0];
      const sena = precio/2; // Hasta acà queremos llegar
  
  
      if(ingresado < sena) { //¿Lo ingresado es más menor que la seña? Sino no hacemos nada, Nunca debio haber llegado;
          await pagarSena(ingresado, precio, saldo, user_id, id);
      } 
  
      async function pagarSena (ingresado, precio, saldo, user_id, id) {
          const descarga = (precio/2) - ingresado;
          const nuevoSaldo = saldo - descarga;
          const nuevoIngreso = ingresado + descarga;
          const changeSaldoQuery = `UPDATE users SET saldo = ? WHERE id = ${user_id}`;
          const saldoResult = await pool.query(changeSaldoQuery, [nuevoSaldo]);
          const updateIngresado = `UPDATE pedidos SET ingresado = ? WHERE id = ${id}`;
          const ingresadoResultado = await pool.query(updateIngresado, [nuevoIngreso]);
          const newState = 'Señado';
          const updateState = `UPDATE pedidos SET estadoPago = ? WHERE id = ${id}`;
          const newStateResult = await pool.query(updateState, [newState]);
          return saldoResult;
      }
  
      const redirectURL = `/Dashpedido/${id}`;
      res.redirect(redirecTURL);
});

router.put('/pagarPedido/:id', auth.isLoggedIn ,auth.isUser , async (req, res) => {
    const { id } = req.params;
    const redirecTURL =  `/pedido/${id}`;


    const precioQuery = 'SELECT precio, user_id, ingresado FROM pedidos WHERE id = ?';
    const pedidoResult = await pool.query(precioQuery, [id]);
    const { ingresado, precio, user_id} = pedidoResult[0][0];
    const saldoQuery = 'SELECT saldo FROM users WHERE id = ?';
    const userResult = await pool.query(saldoQuery, [user_id]);
    const { saldo } = userResult[0][0];
    const sena = precio/2; // Hasta acà queremos llegar


    if(ingresado < precio) { //¿Lo ingresado es más bajo que la seña? No debemos hacer nada sino
        await pagarAAbonar(ingresado, precio, saldo, user_id, id);
    } 

    async function pagarAAbonar (ingresado, precio, saldo, user_id, id) {
    
        const descarga = precio - ingresado;
        const nuevoSaldo = saldo - descarga;
        const nuevoIngreso = ingresado + descarga;
        const changeSaldoQuery = `UPDATE users SET saldo = ? WHERE id = ${user_id}`;
        const saldoResult = await pool.query(changeSaldoQuery, [nuevoSaldo]);
        const updateIngresado = `UPDATE pedidos SET ingresado = ? WHERE id = ${id}`;
        const ingresadoResultado = await pool.query(updateIngresado, [nuevoIngreso]);
        const newState = 'Abonado';
        const updateState = `UPDATE pedidos SET estadoPago = ? WHERE id = ${id}`;
        const newStateResult = await pool.query(updateState, [newState]);
        return saldoResult;
    }

    const redirectURL = `/Dashpedido/${id}`;
    res.sendStatus(200);
});

router.get("/cuenta", (req,res) => {
    res.render('cuenta');
});


// RUTA PARA INGRESAR PAGOS

router.post("/pago", auth.isUser, upload.single('archivo'), async (req, res) => {
    const archivo = req.file;
    const user = req.user;
    
    const user_id = req.user.id;
    const ahora = new Date();
    const fechaHora = ahora.toISOString().slice(0, 19).replace('T', ' '); // Convierte a formato  
 

    if(archivo) { // Si el archivo llegó
        const { originalname, mimetype, size } = archivo;
        const { monto } = req.body;
        const nombreArchivo = v4(); // Generar un nombre único para el archivo
        // Mover el archivo cargado a una ubicación permanente
        fs.renameSync(archivo.path, `uploads/${nombreArchivo}`);
        
        // Insertar metadatos del archivo en la base de datos // tipo, tamaño, nombre (originalname), nombreArchivo
        const insertQuery = 'INSERT INTO pagos (monto, user_id, tipo, nombre, nombreArchivo, tamaño) VALUES ( ?, ?, ?, ?, ?, ?);';
        await pool.query(insertQuery, [monto, user_id, mimetype, originalname , nombreArchivo, size], (err, result) => {
          if (err) { 
            console.error('Error al insertar datos en la base de datos:', err);
            res.status(500).send('Error interno del servidor'); 
            return;
          }
          console.log('Archivo subido correctamente.');
        });
    }
    else {

        const nombre = "No comprobante";
        
        const { select, copias, Descripcion, selectFaz, precio, Tipo, Link, Anillado, Fotocopiadora, color } = req.body;
        const insertQuery = 'INSERT INTO pedidos (user_id, nombre) VALUES (?, ?);';
        await pool.query(insertQuery, [precio, Descripcion, copias, selectFaz, user_id, Tipo, Anillado, Link, nombre, Fotocopiadora, fechaHora, color], (err, result) => {
          if (err) { 
            console.error('Error al insertar datos en la base de datos:', err);
            res.status(500).send('Error interno del servidor'); 
            return;
          }
          console.log('Archivo subido correctamente.');
        });
    }
   
    req.flash('success', 'Pago enviado');
    res.redirect("/inicio");
})






export default router;