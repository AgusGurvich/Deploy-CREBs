const create = str => document.createElement(str);
const files = document.querySelectorAll('.fancy-file');


Array.from(files).forEach(
    f => {
        const label = create('label');
        const span_text = create('span');
        const span_name =create('span');
        const span_button = create('span');

        label.htmlFor = f.id;

        span_text.className = 'fancy-file__fancy-file-name';
        span_button.className = 'fancy-file__fancy-file-button';

        span_name.innerHTML = f.dataset.empty || 'Ningun archivo seleccionado';
        span_button.innerHTML = f.dataset.button || 'Buscar';

        label.appendChild(span_text);
        label.appendChild(span_button);
        span_text.appendChild(span_name);
        f.parentNode.appendChild(label);

        span_name.style.width = (span_text.clientWidth - 20)+'px';

        // Para la previsualización

        f.addEventListener('change', e => {
            if( f.files.length == 0 ){
                span_name.innerHTML = f.dataset.empty ||'Ningún archivo seleccionado';
                img.src = defaultFile;
                bandera = 0;
            }else if( f.files.length > 1 ){
                bandera = 1;
                span_name.innerHTML = f.files.length + ' archivos seleccionados';
                
                const reader = new FileReader();
                    reader.onload = function ( e ){
                        img.src = e.target.result;
                    }
                    reader.readAsDataURL(e.target.files[0]);
            
            }else{
                bandera = 1;
                span_name.innerHTML = f.files[0].name;


                // Mostrar si es imagen
                if(f.files[0].type == "image/*"){
                    img.type = "image/*";
                    img.src = URL.createObjectURL(f.files[0]);
                    console.log(e.target.files[0].type);
                }
                //mostrar si es pdf
                //if(f.files[0].type == "application/pdf"){
                 //       img.type = "application/pdf";
                 //       img.src = URL.createObjectURL(f.files[0]);
                  //      console.log(e.target.files[0].type);
                //    }
                //else {
                 //   const reader = new FileReader();
                  //  reader.onload = function ( e ){
                   //     img.src = e.target.result;
                   // }
                   // reader.readAsDataURL(e.target.files[0]);
                   // console.log(e.target.files[0].type);
               // }
            }
        } );   
    }
);




const form = document.getElementById('formulario');

        form.onsubmit = async (e) => {
            e.preventDefault();
            //Asigno variables pra chequear llenado
            const monto = document.getElementById('monto').value;

            if(monto != undefined){
                let formData = new FormData(form);
                let response = await fetch('/pago', {
                    method: 'POST',
                    body: formData
                });
                console.log(formData);
                window.location.href = "/inicio";
            }
            else {
                alert('Faltan campos por llenar');
            }

        };
