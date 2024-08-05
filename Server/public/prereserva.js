const años = document.querySelectorAll(".pestaña")
let opciones = document.querySelectorAll(".opcion")
let botones = document.querySelectorAll(".boton");

// Selector de años 
años.forEach(año => {
    año.addEventListener("mouseover", ()=>{
        opciones.forEach(elemento => { // mostrar los elementos correspondientes
            if(!elemento.classList.contains(año.textContent)) {     
                elemento.style.display = "none";
            }
            else {
                elemento.style.display = "flex";
            }
        })
        años.forEach((pestaña)=> {
            if(año.textContent == pestaña.textContent) {
                año.style.color = "var(--thirdty)";
                año.style.borderBottom = "2px solid var(--thirdty)";
            }
            else {
                pestaña.style.color = "var(--text)"
                pestaña.style.borderBottom = "0px solid var(--thirdty)";
            }
        })
    })
})


// Enviar orden
botones.forEach(opcion =>{
    opcion.addEventListener("click", async ()=>{
        console.log("opcion numero" + opcion.id);
        ordenID = opcion.id;
        const orderURL = `/prereserva/ordenar/${ordenID}`;
        let response = await fetch(orderURL, {
            method: 'POST',
        });
        window.location.href = `/inicio`;
    })
})
