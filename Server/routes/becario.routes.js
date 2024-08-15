import { Router } from "express";
import { pool } from "../db.js";
import tma from "timeago.js";
const {timeago} = tma;
import auth from "../lib/auth.js"; 
import multer from 'multer';
import fs from 'fs';
import { v4 } from "uuid";
const router = Router();



router.get("/seleccion", (req,res)=> {
    res.render('seleccion');
});


router.get("/dashboard",  auth.isLoggedIn, auth.isBecario , async (req,res)=> {
    
    res.render('dashboard');
});

router.get("/prereservaDashboard",  auth.isLoggedIn, auth.isBecario , async (req,res)=> {
    const prereservaQuery = 'SELECT * FROM prereserva ORDER BY id';
    const result = await pool.query(prereservaQuery);
    let prereserva = result[0];
    res.render('prereservaDashboard', {
        prereserva : prereserva
    });
});

router.get("/agregar/:id",  auth.isLoggedIn, auth.isBecario , async (req,res) => {
    const { id } = req.params;
    console.log(id);

        const prereservaQuery = 'SELECT * FROM prereserva WHERE id = ?';
        const result = await pool.query(prereservaQuery, [id]);
        let prereserva = result[0];    
        res.render('prereservaModificar', {
            prereserva : prereserva
        });
});

router.post("/agregarPrereserva", auth.isLoggedIn, auth.isBecario , async (req,res) => {
    const { nombre , precio, año } = req.body;
    const insertQuery = 'INSERT INTO prereserva (nombre, precio, año) VALUES (?, ?, ?);';
    await pool.query(insertQuery, [nombre, precio, año]);
    res.redirect("/dashboard");
});

router.post("/modificarPrereserva", auth.isLoggedIn, auth.isBecario , async (req,res) => {
    const { nombre , precio, año, id} = req.body;
    const modifyQuery = 'UPDATE prereserva SET año = ?, nombre = ?, precio = ? WHERE id = ?;';
    await pool.query(modifyQuery, [año, nombre, precio, id]);
    res.redirect("/dashboard");
});

router.delete("/prereserva/eliminar/:id", auth.isLoggedIn, auth.isBecario , async (req,res) => {
        const { id } = req.params;    
        const deleteQuery = 'DELETE FROM prereserva WHERE id = ?;';
        await pool.query(deleteQuery, [id]);
    res.redirect("/dashboard");
});



router.get("/pedidosPrereserva", auth.isLoggedIn, auth.isBecario , async (req,res)=> {
    const result = await pool.query('SELECT * FROM pedidos WHERE tipo_impresion = "Pre" ORDER BY id DESC');
    let pedidos = result[0];
    res.render('dashHistorialPrereserva', {
        pedidos : pedidos
    }); 
}) 

router.post("/marcarHechos", auth.isLoggedIn, auth.isBecario , async (req,res)=> {
     const { nombre , agregar } = req.body;
     const  Query = 'SELECT * FROM pedidos WHERE tipo_impresion = "Pre" AND nombre = ? ORDER BY id DESC';
     const result = await pool.query(Query, nombre);
     let pedidos = result[0];

    if(agregar < 0) {
        let cantidad = Math.abs(agregar);
        let contador = 0;
        for(let i=0; i<pedidos.length; i++) {
            if(pedidos[i].estado == "Listo") {
                const updateQuery = 'UPDATE pedidos SET estado = "Pendiente" WHERE id = ?'
                const id = pedidos[i].id;
                const result = await pool.query(updateQuery, id);
                contador += 1;
            }
            if(contador == cantidad) {
                break;
            }
         }
         res.redirect("/pedidosPrereserva");
    } else {
        if(agregar == 0) {
            res.redirect("/pedidosPrereserva");   
        } else {
            let contador = 0;
            for(let i=0; i<pedidos.length; i++) {
                if(pedidos[i].estado == "Pendiente") {
                    const updateQuery = 'UPDATE pedidos SET estado = "Listo" WHERE id = ?'
                    const id = pedidos[i].id;
                    const result = await pool.query(updateQuery, id);
                    contador += 1;
                }
                if(contador == agregar) {
                    break;
                }
             }
             console.log(pedidos);
             res.redirect("/pedidosPrereserva");
        }
    }
    
     
}) 


router.get("/historial_pendientes", auth.isLoggedIn, auth.isBecario , async (req,res)=> {
    const result = await pool.query('SELECT * FROM pedidos WHERE Estado = "Pendiente" ORDER BY id DESC');
    let pedidos = result[0];
    res.render('dashHistorial', {
        pedidos : pedidos
    }); 
}) 

router.get("/usuario/historial/:id", auth.isLoggedIn, auth.isBecario , async (req,res)=> {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM pedidos WHERE user_id = ?', [id]);
    
    let pedidos = result[0];
    res.render('dashHistorial', {
        pedidos : pedidos
    });
}) 


router.get("/cargar_cuenta",  auth.isLoggedIn, auth.isBecario , (req,res)=> {
    res.render("dashboard_cargarSaldo");
})

router.get("/historial_general", async (req,res)=> {
    const result = await pool.query('SELECT  * FROM pedidos ORDER BY id DESC');
    let pedidos = result[0];
    res.render('dashHistorial', {
        pedidos:pedidos
    });
})

router.get("/usuarios", auth.isLoggedIn, auth.isBecario , async (req,res)=> {
    

    const result = await pool.query('SELECT * FROM users WHERE licencia = 1');
    let usuarios = result[0];

    res.render("dashboard_Usuarios", {
        usuarios : usuarios
    });
})

router.get("/usuariosFetch", auth.isBecario, auth.isLoggedIn , async (req,res)=> {
    
    const result = await pool.query('SELECT * FROM users');
    let usuarios = result[0];

    res.send(usuarios);

});


router.get("/usuario/:DNI", auth.isLoggedIn, auth.isBecario ,  async (req, res) => {
    const DNI = req.params.DNI;
    const selectQuery = 'SELECT * FROM users WHERE DNI = ?'
    const results = await pool.query(selectQuery, [DNI]);

    const usuario = results[0][0];
    if(usuario != undefined) {
        res.render("usuario", {
            usuario : usuario
        });
    } else {
        res.redirect("/dashboard");
    }
    
})

router.get("/IngresarPedido", auth.isLoggedIn, auth.isBecario , (req,res)=> {
    res.render("dashIngresarPedido");
})

const upload = multer({ dest: 'uploads/' });

router.post("/pedidoFromDash", auth.isBecario, upload.single('archivo'), async (req, res) => {
    const archivo = req.file;
    const DNI = req.body.DNI;

    //Obtener el id from USERDNI
    const userIDQuery = 'SELECT id FROM users WHERE DNI = ?';
    const resultUserID = await pool.query(userIDQuery, [DNI])
    const id = resultUserID[0][0].id;
    const ahora = new Date();
    const fechaHora = ahora.toISOString().slice(0, 19).replace('T', ' '); // Convierte a formato  
    

    if(archivo) {
        console.log('archivo positivo');
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
        console.log('archivo negativo');
        const nombre = "Archivo en Link";
        
        const { select, copias, Descripcion, selectFaz, precio, Tipo, Link, Anillado, Fotocopiadora } = req.body;
        const insertQuery = 'INSERT INTO pedidos (precio, descripción, copias, tipo_impresion, user_id, formato, anillado, link, nombre, fotocopiadora, fecha, color) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);';
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
    res.redirect("/dashboard");
})



router.put("/nuevaCarga", auth.isBecario , async (req,res)=> {
    // Definiciones
    const nuevaCarga = req.body.valor;
    const userID = req.body.id;
    const { DNI } = req.body;
    //Consultar Saldo
    const selectQuery = 'SELECT saldo FROM users WHERE id = ? '
    const saldoActual = await pool.query(selectQuery, [userID]);
    const nuevoSaldo = saldoActual[0][0].saldo + parseInt(nuevaCarga);
    // Actualizar saldo
    const updateQuery = 'UPDATE users SET saldo = ' + nuevoSaldo + ' WHERE id = ' + userID;  
    await pool.query(updateQuery);
    // Obtener DNI
    const redirectURL = `/usuario/${DNI}`;
    res.redirect(redirectURL);
})
  

router.get("/Dashpedido/:id", auth.isLoggedIn, auth.isBecario , async (req, res)=> {
    const {id} = req.params;
    const selectQuery = 'SELECT * FROM pedidos WHERE id = ?';
    const result = await pool.query(selectQuery, [id]);
    const pedido = result[0][0];
    const user_id = result[0][0].user_id;
    console.log(user_id);
    const userQuery = 'SELECT * FROM users WHERE id = ?';
    const user = await pool.query(userQuery, [user_id]);
    const UserInformation = user[0][0];
 
    res.render('dashHistorialUnidad', {
        pedido : pedido,
        user : UserInformation
    })

});

router.put('/pedido/changeEstado/:id', async (req,res) => {
    const { id } = req.params;
    const estadoQuery = 'SELECT estado FROM pedidos WHERE id = ?';
    const result = await pool.query(estadoQuery, [id]);
    const estado = result[0][0].estado;

    if(estado != 'Pendiente') {
        const changeQuery = "UPDATE pedidos SET estado = 'Pendiente' WHERE id = ?";
        const changeResult = await pool.query(changeQuery, [id]);
        
    }
    if (estado != 'Listo') {
        const changeQuery = "UPDATE pedidos SET estado = 'Listo' WHERE id = ?";
        const changeResult = await pool.query(changeQuery, [id]);
        
    }

    const redirectURL = `/Dashpedido/${id}`;
    res.redirect(redirectURL);
});

router.put('/pedido/changePrecio/:id/:newPrice', auth.isBecario, async (req,res) => {
    
    const { id , newPrice } = req.params;
    const informationQuery = 'SELECT ingresado, precio, estadoPago, user_id FROM pedidos WHERE id = ?';
    const resultInformation = await pool.query(informationQuery, [id]);
    const {ingresado, precio, estadoPago, user_id} = resultInformation[0][0];
    const userIDQuery =  'SELECT saldo FROM users WHERE id = ?';
    const saldoResult = await pool.query(userIDQuery, user_id);
    const { saldo } = saldoResult[0][0];
    

    const redirectURL = `/Dashpedido/${id}`;
    if(estadoPago == 'Abonado') { // ¿Estaba abonado ya?
        if(newPrice == precio) { // ¿El nuevo y el viejo son iguales?
           console.log('Nada');
        }
        else { // No son iguales
            if(newPrice > precio) { // ¿El nuevo precio es mayor que el viejo?
                actualizarPrecio(newPrice, id);  //Actualizar precio
                const nuevoEstado = "Señado";   //Actualizar a estado señado
                actualizarEstado(nuevoEstado, id);
            } else { // El nuevo Precio es mas bajo que el ya pagado
                actualizarPrecio(newPrice, id);  //Actualizar precio
                devolverSobrante(precio, newPrice, saldo, user_id, id);  // Devolvemos Saldo sobrante
            }
        }
    } else { // No estaba abonado
        if(estadoPago == 'Señado') { // ¿Estaba señado?
            if(ingresado > newPrice) { // ¿Lo que se había señado es más que el nuevo Precio?
                await devolverSobrante(ingresado, newPrice, saldo, user_id, id);  // Devolver Saldo Sobrante
                const nuevoEstado = "Abonado";  // Actualizamos a estado Abonado
                await actualizarEstado(nuevoEstado, id);  // Cambiar estado a abonado                
                await actualizarPrecio(newPrice, id);  //Actualizar precio
            } else { // La seña era menor que el nuevo precio
                if(ingresado == newPrice) { // ¿Es la seña exactamente igual al nuevo precio?
                    const nuevoEstado = "Abonado";
                   await actualizarPrecio(newPrice, id);  //Actualizar precio
                   await actualizarEstado(nuevoEstado, id);  // Cambiar estado a abonado
                } else { // La seña era menor al nuevo precio
                    
                    await actualizarPrecio(newPrice, id);  //Actualizar precio
                }
            }
        } else { //No estaba señado tampoco. Quiere decir que ingresado == 0;

            await actualizarPrecio(newPrice, id);  //Actualizar precio
        }
    }

    async function actualizarPrecio (newPrice, id)  {
        console.log('Actualizar Precio');
        const changeQuery = `UPDATE pedidos SET precio = ? WHERE id = ${id}`;
        const result = await pool.query(changeQuery, [newPrice]);
        // return result;
    }
    
    async function actualizarEstado (nuevoEstado, id)  {
        console.log('Actualizar Estado');
        const changeStateQuery = `UPDATE pedidos SET estadoPago = ? WHERE id = ${id}`;
        const result = await pool.query(changeStateQuery, [nuevoEstado]);
        // return result;
    }

    async function devolverSobrante (viejo, nuevo, saldo, userID, id) {
        console.log('Devolviendo Sobrante');
        const sobrante = viejo - nuevo;
        const nuevoSaldo = sobrante + saldo;
        const nuevoIngresado = nuevo;
        const rechargeQuery = `UPDATE users SET saldo = ? WHERE id = ${userID}`;
        const result = await pool.query(rechargeQuery, [nuevoSaldo]);
        const changeIngresadoQuery = `UPDATE pedidos SET ingresado = ? WHERE id = ${id}`;
        const resultIngresado = await pool.query(changeIngresadoQuery, [nuevoIngresado]);
        // return result;
    }



    res.redirect(redirectURL);
});

router.put('/Dashpedido/dash/senarPedido/:id', auth.isLoggedIn , async (req, res) => {
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
        pagarSena(ingresado, precio, saldo, user_id, id);
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

router.put('/Dashpedido/dash/pagarPedido/:id', auth.isLoggedIn , async (req, res) => {
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
        console.log('ejecuentando funcion pagar a abonar');
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


export default router;