const años = document.querySelectorAll(".pestaña")
let opciones = document.querySelectorAll(".opcion")
let botonesEliminar = document.querySelectorAll(".eliminar");

// Selector de años 
años.forEach(año => {
    año.addEventListener("mouseover", ()=>{
        opciones.forEach(elemento => { // mostrar los elementos correspondientes
            console.log(elemento);
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
botonesEliminar.forEach(opcion =>{
    opcion.addEventListener("click", async ()=>{
        console.log("opcion numero" + opcion.id);
        ordenID = opcion.id;
        const orderURL = `/prereserva/eliminar/${ordenID}`;
        let response = await fetch(orderURL, {
            method: 'DELETE',
        });
        window.location.href = `/dashboard`;
    })
})
