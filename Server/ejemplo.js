const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const mysql = require('mysql');
import timeago from 'timeago.js';

const timeagoInstance = timeago();

// Configuración de la base de datos
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'usuario',
  password: 'contraseña',
  database: 'basededatos'
});

connection.connect(err => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
    return;
  }
  console.log('Conexión a la base de datos establecida.');
});

// Configuración de multer para manejar la carga de archivos
const upload = multer({ dest: 'uploads/' });

// Configuración de Express
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// Ruta para la carga de archivos
app.post('/upload', upload.single('archivo'), (req, res) => {
  const archivo = req.file;
  const { originalname, mimetype, size } = archivo;
  const nombreArchivo = uuidv4(); // Generar un nombre único para el archivo

  // Mover el archivo cargado a una ubicación permanente
  fs.renameSync(archivo.path, `uploads/${nombreArchivo}`);

  // Insertar metadatos del archivo en la base de datos
  const insertQuery = 'INSERT INTO archivos (nombre, tipo, tamaño, nombre_archivo) VALUES (?, ?, ?, ?)';
  connection.query(insertQuery, [originalname, mimetype, size, nombreArchivo], (err, result) => {
    if (err) {
      console.error('Error al insertar datos en la base de datos:', err);
      res.status(500).send('Error interno del servidor');
      return;
    }
    console.log('Archivo subido correctamente.');
    res.send('Archivo subido correctamente');
  });
});

// Ruta para la descarga de archivos
app.get('/download/:nombreArchivo', (req, res) => {
  const nombreArchivo = req.params.nombreArchivo;

  // Buscar el nombre del archivo en la base de datos
  const selectQuery = 'SELECT nombre, tipo FROM archivos WHERE nombre_archivo = ?';
  connection.query(selectQuery, [nombreArchivo], (err, results) => {
    if (err) {
      console.error('Error al buscar datos en la base de datos:', err);
      res.status(500).send('Error interno del servidor');
      return;
    }

    if (results.length === 0) {
      res.status(404).send('Archivo no encontrado');
      return;
    }

    const { nombre, tipo } = results[0];
    const path = `uploads/${nombreArchivo}`;

    // Envía el archivo como respuesta
    res.setHeader('Content-disposition', `attachment; filename=${nombre}`);
    res.setHeader('Content-type', tipo);
    fs.createReadStream(path).pipe(res);
  });
});

// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor en ejecución en el puerto ${PORT}`);
});

 


// pasar del timestamp mysql a milisegundos 
const fechaString = '2024-03-07 15:30:00';
const partesFecha = fechaString.split(' ');
const partesFechaNum = partesFecha[0].split('-').map(Number);
const partesHoraNum = partesFecha[1].split(':').map(Number);

const fecha = new Date(partesFechaNum[0], partesFechaNum[1] - 1, partesFechaNum[2], partesHoraNum[0], partesHoraNum[1], partesHoraNum[2]);
const timestampEnSegundos = fecha.getTime() / 1000; // Convertir a segundos dividiendo por 1000
console.log(timestampEnSegundos);



// Manejar errores de descarga



router.get('/download/:nombreArchivo', auth.isLoggedIn, async (req, res, next) => {
  const nombreArchivo = req.params.nombreArchivo;

  // Buscar el nombre del archivo en la base de datos
  const selectQuery = 'SELECT nombre, tipo FROM pedidos WHERE nombre_archivo = ?';

  try {
      const results = await pool.query(selectQuery, [nombreArchivo]);
      if (results[0].length === 0) {
          // Si no se encuentra el archivo, devolver un error 404
          return res.status(404).send('Archivo no encontrado');
      }

      const { nombre, tipo } = results[0][0];
      const path = `uploads/${nombreArchivo}`;

      // Verificar si el archivo existe en el sistema de archivos
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
      // Manejo de errores en la consulta SQL
      next(err);
  }
});







{/* <div id="selector">
<% let lista = [] %>
<% pedidos.forEach((elemento)  => { %>
    <% bandera = true %>
    <% largo = lista.length %>
    <% for (let i = 0; i<largo; i++) { %>
        <% if(elemento.estado == lista[i]) { %>
            <% bandera = false%>
        <% } %>
    <% } %>
    <% if(bandera) {%>
        <p class="pestaña"><%= elemento.estado %></p>
        <% lista.push(elemento.estado) %>
    <% } %>
<% }) %>
</div> */}


let libros = [];
pedidos.forEach(pedido => {
    let bandera = true;
    let largo = lista.length; 
    let encontrado = "";
    for(let i = 0; i<largo; i++) {  // buscamos este libro en nuestra lista
      if(pedido.nombre == lista[i][0]) {
        bandera = false; // Ya aparece este libro en la lista
        encontrado = lista[i][0];
      }
    }
    if(bandera) { // El elemento es un libro nuevo -> Agregar entrada a la lista
      // Creamos las posibles entradas
      if(pedido.estadoPago == "Señado") {
        if(pedido.estado == "Pendiente") {
          let nuevo = [pedido.nombre, 1, 1, 0, 0, 1]; // Entrada
        } else {
          let nuevo = [pedido.nombre, 1, 1, 0, 1, 0]; // Entrada
        }
      } else {
          if(pedido.estadoPago == "Abonado") {
            if(pedido.estado == "Pendiente") {
              let nuevo = [pedido.nombre, 1, 0, 1, 0, 1]; // Entrada
            } else {
              let nuevo = [pedido.nombre, 1, 0, 1, 1, 0]; // Entrada
            }   
          }
      } else { // Es no abonado
        if(pedido.estado == "Pendiente") {
          let nuevo = [pedido.nombre, 1, 0, 0, 0, 1]; // Entrada
        } else {
          let nuevo = [pedido.nombre, 1, 0, 0, 1, 0]; // no señado no abonado pero listo por alguna extraña razón
        }
      }
      lista.push(nuevo);
    } else { // El elemento ya está en la lista -> Sumar valores a la entrada de la lista
      if(pedido.estadoPago == "Señado") {
        if(pedido.estado == "Pendiente") { // Sumar 1 pedido 1 señado 1 pendiente
          lista[pedido.nombre][1] += 1;
          lista[pedido.nombre][2] += 1;
          lista[pedido.nombre][5] += 1;
        } else { // Sumar 1 pedido 1 señado 1 listo
          lista[pedido.nombre][1] += 1;
          lista[pedido.nombre][2] += 1;
          lista[pedido.nombre][4] += 1;
        }
      } else {
          if(pedido.estadoPago == "Abonado") {
            if(pedido.estado == "Pendiente") {
              lista[pedido.nombre][1] += 1;
              lista[pedido.nombre][3] += 1;
              lista[pedido.nombre][5] += 1;
            } else {
              lista[pedido.nombre][1] += 1;
              lista[pedido.nombre][3] += 1;
              lista[pedido.nombre][4] += 1;
            }   
          }
      } else { // Es no abonado
        if(pedido.estado == "Pendiente") {
          lista[pedido.nombre][1] += 1;
          lista[pedido.nombre][5] += 1;
        } else { // no señado no abonado pero listo por alguna extraña razón
          lista[pedido.nombre][1] += 1;
          lista[pedido.nombre][4] += 1;
        }
      }
    }
});



// let nuevo = [nombre, pedidos, señados, abonados, hechos(listo), restantes(pendiente)]
if(pedido.estadoPago == "Señado") {
  if(pedido.estado == "Pendiente") {
    let nuevo = [pedido.nombre, 1, 1, 0, 0, 1];
  } else {
    let nuevo = [pedido.nombre, 1, 1, 0, 1, 0];
  }
} else {
    if(pedido.estadoPago == "Abonado") {
      if(pedido.estado == "Pendiente") {
        let nuevo = [pedido.nombre, 1, 0, 1, 0, 1];
      } else {
        let nuevo = [pedido.nombre, 1, 0, 1, 1, 0];
      }   
    }
} else { // Es no abonado
  if(pedido.estado == "Pendiente") {
    let nuevo = [pedido.nombre, 1, 0, 0, 0, 1];
  } else {
    let nuevo = [pedido.nombre, 1, 0, 0, 1, 0]; // no señado no abonado pero listo por alguna extraña razón
  }
}


// let nuevo = [nombre 0, pedidos 1, señados 2, abonados 3, hechos(listo) 4, restantes(pendiente) 5]
// Sumar nuevas entradas 
if(pedido.estadoPago == "Señado") {
  if(pedido.estado == "Pendiente") { // Sumar 1 pedido 1 señado 1 pendiente
    lista[pedido.nombre][1] += 1;
    lista[pedido.nombre][2] += 1;
    lista[pedido.nombre][5] += 1;
  } else { // Sumar 1 pedido 1 señado 1 listo
    lista[pedido.nombre][1] += 1;
    lista[pedido.nombre][2] += 1;
    lista[pedido.nombre][4] += 1;
  }
} else {
    if(pedido.estadoPago == "Abonado") {
      if(pedido.estado == "Pendiente") {
        lista[pedido.nombre][1] += 1;
        lista[pedido.nombre][3] += 1;
        lista[pedido.nombre][5] += 1;
      } else {
        lista[pedido.nombre][1] += 1;
        lista[pedido.nombre][3] += 1;
        lista[pedido.nombre][4] += 1;
      }   
    }
} else { // Es no abonado
  if(pedido.estado == "Pendiente") {
    lista[pedido.nombre][1] += 1;
    lista[pedido.nombre][5] += 1;
  } else { // no señado no abonado pero listo por alguna extraña razón
    lista[pedido.nombre][1] += 1;
    lista[pedido.nombre][4] += 1;
  }
}
