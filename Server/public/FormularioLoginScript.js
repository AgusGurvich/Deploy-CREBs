const signinBtn = document.querySelector(".signinBtn");
const signupBtn = document.querySelector(".signupBtn");
const formBx = document.querySelector(".formBx");
const body = document.querySelector("body");



signupBtn.addEventListener("click", ()=> {

    formBx.classList.add("active");
    body.classList.add("active");

})

signinBtn.addEventListener("click", ()=>{
    formBx.classList.remove("active");
    body.classList.remove("active");
})

// const formLoggear = document.getElementById('loggearUsuario');
// const formCrear = document.getElementById('crearUsuario');

//         formLoggear.onsubmit = async (e) => {
//             e.preventDefault();
            
//             if(faz != 'value0' && Tipo != 'value0' && anillado != 'value0' && (bandera || banderaLink) && copias && paginas){
//                 let formData = new FormData(form);
          
//                 let response = await fetch('/pedido', {
//                     method: 'POST',
//                     body: formData
//                 });
//                 console.log(formData);
//                 // window.location.href = "/inicio";
//             }
//             else {
//                 alert('Faltan campos por llenar');
//             }

//         };