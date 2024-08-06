const estado = document.querySelectorAll('.estado');
const estadoPago = document.querySelectorAll('.estadoPago');
const archivos = document.querySelectorAll('.nombre_archivo');
const selecciones = document.querySelectorAll('.pestaña');
const entradas = document.querySelectorAll(".historial_entrada");

archivos.forEach( archivo => {
    archivo.onclick = (e) => {   
        e.target.style.cssText = 'background-color: var(--Blue); color: var(--fondo);'

    }
})

selecciones.forEach(selector => {
    if(selector.textContent == 'Prereserva') { // caso Prereserva donde filtramos por faz (tipo_impresion en sql)
        selector.addEventListener('mouseover', ()=> {
            entradas.forEach( entrada => {
                if(!entrada.classList.contains('Pre')) {     
                    entrada.style.display = "none";
                }
                else {
                    entrada.style.display = "flex";
                }
            });
        });
    } else { // caso pendientes y listos donde filtramos por estado
        selector.addEventListener('mouseover', ()=> {
            entradas.forEach( entrada => {
                if(!entrada.classList.contains(selector.textContent)) {     
                    entrada.style.display = "none";
                }
                else {
                    entrada.style.display = "flex";
                }
            });
        });
    }
 
});

// console.log(document.querySelectorAll('#estadoPago'));

estadoPago.forEach(estado => {

    if(estado.textContent == 'No abonado') {
        estado.style.cssText = "background-color: var(--red);";
    }
    if(estado.textContent == 'Abonado') {
        estado.style.cssText = "background-color: var(--thirdty);";
    }
    if(estado.textContent == 'Señado') {
        estado.style.cssText = "background-color: var(--yellow);";
    }
});

estado.forEach(estado => {

    if(estado.textContent == 'Pendiente') {
        estado.style.cssText = "background-color: var(--red);";
    }
    if(estado.textContent == 'Listo') {
        estado.style.cssText = "background-color: var(--thirdty);";
    }
});

const nombresArchivo = document.querySelectorAll('.nombre_archivo')

nombresArchivo.forEach(nombre => {
    if(nombre.textContent.length > 20) {
        nombre.textContent = 'Nombre muy largo'
    }
})