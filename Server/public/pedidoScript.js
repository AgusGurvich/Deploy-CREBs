const create = str => document.createElement(str);
const files = document.querySelectorAll('.fancy-file');
const img = document.getElementById('img');
const defaultFile = 'folder-icon.webp';
let bandera = 0;
let banderaLink = false;
const precio_copia = document.getElementById('precio_copia');
const precio_total = document.getElementById('precio_total');
const calculadora = document.getElementById('calculadora');
const simpleFaz = 30;
const dobleFaz = 32.5;



// Para que no envíe automátiocamente el formulario y pedir valores de calculadora
        document.addEventListener('DOMContentLoaded', async () => {
            document.querySelectorAll('input[type=number]').forEach( node => node.addEventListener('keypress', e => {
            if(e.keyCode == 13) {
                e.preventDefault();
            }
            }))

         
        });



// Para decorar el input File
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

                        if(f.files[0].type == "application/pdf"){
                                img.type = "application/pdf";
                                img.src = URL.createObjectURL(f.files[0]);
                                console.log(e.target.files[0].type);
                            }
                        else {
                            const reader = new FileReader();
                            reader.onload = function ( e ){
                                img.src = e.target.result;
                            }
                            reader.readAsDataURL(e.target.files[0]);
                            console.log(e.target.files[0].type);
                        }
                    }
                } );   
            }
        );


//Calculadora del Usuario

        calculadora.addEventListener("click", async  () => {
           const result = await calcularPrecios();
           console.log(result);
        })




// Mandar el Formulario

        const form = document.getElementById('form_areas');

        form.onsubmit = async (e) => {
            e.preventDefault();
            
            let anillado = document.getElementById('Anillado').value;
            let Tipo = document.getElementById('Tipo').value;
            let copias = document.getElementById('copias').value;
            let faz = document.getElementById('Faz').value;
            let paginas = document.getElementById('paginas').value;
            
            banderaLink = bandera2(document.getElementById('Link').value);
            
            let resultadoTotal = 0;
            resultadoTotal = await calcularPrecios();


            if(faz != 'value0' && Tipo != 'value0' && anillado != 'value0' && (bandera || banderaLink) && copias && paginas){
                let formData = new FormData(form);
                formData.append("precio", resultadoTotal);
                let response = await fetch('/pedido', {
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


    // Calculadora del Sistema

   async function calcularPrecios () {
        const preciosURL = "/precios/information";
        const response = await fetch(preciosURL);
        const preciosInformation = await response.json();
        let precioFinal = 0;

        // Obtener los valores del pedido
        let copias = document.getElementById('copias').value;
        let faz = document.getElementById('Faz').value;
        let paginas = document.getElementById('paginas').value;
        let formato = document.getElementById('Tipo').value;
        let color = document.getElementById('color').value;
        let anillado = document.getElementById('Anillado').value;
        let resultadoCopia = "Falta llenar campos";
        let resultadoTotal = "Falta llenar campos";
        
        if(faz != "value0" && copias && paginas && color != "value0" && anillado != "value0" && formato != "value0") {
            console.log("Afirmativo");
            console.log("Todos los campos están llenos");
            let precioAnilladoTotal = 0;
            
        //Calcular precio anillado
             if(anillado == 'Anillado') {
                let precioAnillado = 0;
                if(paginas >= 500) {
                    preciosInformation.preciosAnillado.forEach( precio => {
                        if(precio.hojas == 500) {
                            precioAnillado = precio.precio;
                        }
                    })
                } else {
                    precioAnillado = 900; 
                    preciosInformation.preciosAnillado.forEach( precio => {
                        if(paginas > precio.hojas && precio.hojas != 0) {
                            precioAnillado = precio.precio;
                        }
                    })
                }
                    //Calcular el precio de las tapas
                    let precioTapas = 0;
                    preciosInformation.preciosAnillado.forEach( precio => {
                        if(precio.hojas == 0) {
                            precioTapas = precio.precio;
                        }
                    })
                    //Calculamos el anillado en general
                    precioAnilladoTotal = precioAnillado + precioTapas;    
            }

        //Calcular precio general
           if( faz == 'Simple') {
                if (color == 1) {
                    // Tiramos el precio directo
                    const precio = buscarPreciosEspecificos(preciosInformation.preciosHojas, faz, color, formato);
                    console.log(precio);
                    precioFinal = calcular(paginas, precio, copias, precioAnilladoTotal);
                    console.log(precioFinal);
                } else { // Tenemos que buscar el precio por faz
                    const precio = buscarPreciosEspecificos(preciosInformation.preciosHojas, faz, color, formato);
                    console.log(precio);
                    precioFinal = calcular(paginas, precio, copias, precioAnilladoTotal);
                    console.log(precioFinal);
                }
           }
           if (faz == 'Doble') {
                if(formato == 'A4') {
                    if (color == 1) {
                        // Tiramos el precio directo
                        const precio = buscarPreciosEspecificos(preciosInformation.preciosHojas, faz, color, formato);
                        console.log(precio);
                        precioFinal = calcular(paginas, precio, copias, precioAnilladoTotal);
                        console.log(precioFinal);
                    } else { // Tenemos que buscar el precio por faz
                        const precio = buscarPrecioHojas(preciosInformation.preciosHojas, paginas, faz, formato);
                        console.log(precio);
                        precioFinal = calcular(paginas, precio, copias, precioAnilladoTotal);
                        console.log(precioFinal);
                    }
                }
                if(formato == 'Oficio') {
                    if (color == 1) {
                        // Tiramos el precio directo
                        const precio = buscarPreciosEspecificos(preciosInformation.preciosHojas, faz, color, formato);
                        precioFinal = calcular(paginas, precio, copias, precioAnilladoTotal);
                        console.log(precioFinal);
                    } else { // Tenemos que buscar el precio por faz
                        const precio = buscarPrecioHojas(preciosInformation.preciosHojas, paginas, faz, formato);
                        precioFinal = calcular(paginas, precio, copias, precioAnilladoTotal);
                        console.log(precioFinal);
                    }
                }
           }    


           function buscarPrecioHojas (lista, hojas, faz, formato) {
                let id = 0;
                let contador = 0;
                let correcto = 0;

                if(faz == 'Doble') {
                    if(formato == 'A4') {
                        if(hojas >= 1500) {
                            lista.forEach( precio => {
                                if(precio.faz == 'Doble' && precio.tamaño == 'A4' && precio.hojas == 1500) {
                                        id = precio.id;
                                }
                            })
                        } else {
                            lista.forEach( precio => {
                                if(precio.faz == 'Doble' && precio.tamaño == 'A4') {
                                    if(contador == 0) {
                                        id = precio.id;
                                        contador = contador + 1;
                                    }
                                    if(hojas > precio.hojas) {
                                        id = precio.id + 1;
                                    }  
                                }
                            })
                        }
                    }
                    if(formato == 'Oficio') {
                        if(hojas >= 1500) {
                            lista.forEach( precio => {
                                if(precio.faz == 'Doble' && precio.tamaño == 'Oficio' && precio.hojas == 1500) {
                                        id = precio.id;
                                }
                            })
                        } else {
                            lista.forEach( precio => {
                                if(precio.faz == 'Doble' && precio.tamaño == 'Oficio') {
                                    if(contador == 0) {
                                        id = precio.id;
                                        contador = contador + 1;
                                    }
                                    if(hojas > precio.hojas) {
                                        id = precio.id + 1;
                                    }  
                                }
                            })
                        }
                    }
                }
                lista.forEach( precio => {
                    if(precio.id == id) {
                        correcto = precio.precio;
                    }
                })
                return correcto;
           }

           function buscarPreciosEspecificos (lista, faz, color, formato) {
                let correcto = 20;
                if(color == 1) {
                    if (faz == 'Simple') {
                       if(formato == 'Oficio') {
                        lista.forEach( precio => {
                            if(precio.faz == 'Simplecol' && precio.tamaño == 'Oficio') {
                                correcto = precio.precio;
                                return correcto;
                            }
                        })
                       }
                       if(formato == 'A4') {
                        lista.forEach( precio => {
                            if(precio.faz == 'Simplecol' && precio.tamaño == 'A4') {
                                correcto = precio.precio;
                                return correcto;
                            }
                        })
                       }
                    }
                    if (faz == 'Doble') {
                        if(formato == 'A4') {
                            if(formato == 'Oficio') {
                                lista.forEach( precio => {
                                    if(precio.faz == 'Doblecol' && precio.tamaño == 'A4') {
                                        correcto = precio.precio;
                                        return correcto;
                                    }
                                })
                            }
                        }
                        if(formato == 'Oficio') {
                            lista.forEach( precio => {
                                if(precio.faz == 'Doblecol' && precio.tamaño == 'Oficio') {
                                    correcto = precio.precio;
                                    return correcto;
                                }
                            })
                        }
                    } 
                } else {
                    if (faz == 'Simple') {
                        if(formato == 'Oficio') {
                         lista.forEach( precio => {
                             if(precio.faz == 'Simple' && precio.tamaño == 'Oficio') {
                                 correcto = precio.precio;
                                 return correcto;
                             }
                         })
                        }
                        if(formato == 'A4') {
                         lista.forEach( precio => {
                             if(precio.faz == 'Simple' && precio.tamaño == 'A4') {
                                 correcto = precio.precio;
                                 return correcto;
                             }
                         })
                        }
                     }
                     if (faz == 'Doble') {
                         if(formato == 'A4') {
                             if(formato == 'Oficio') {
                                 lista.forEach( precio => {
                                     if(precio.faz == 'Doble' && precio.tamaño == 'A4') {
                                         correcto = precio.precio;
                                         return correcto;
                                     }
                                 })
                             }
                         }
                         if(formato == 'Oficio') {
                             lista.forEach( precio => {
                                 if(precio.faz == 'Doble' && precio.tamaño == 'Oficio') {
                                     correcto = precio.precio;
                                     return correcto;
                                 }
                             })
                         }
                     } 
                }

                return correcto;
           }

        

           function calcular (paginas, precio, copias, anillado) {
            let resultadoCopia = paginas * precio + anillado;
            let resultadoTotal = paginas * precio * copias + anillado;
            precio_copia.innerHTML = "$" + resultadoCopia;
            precio_total.innerHTML = "$" + resultadoTotal;
            return resultadoTotal;
           }
           
        }
        else {
            
            precio_copia.innerHTML = resultadoCopia;
            precio_total.innerHTML = resultadoTotal;
        }

        return precioFinal;
    }


        function bandera2 (enlace) {
            let comprobante = "https://drive.google.com";
            let bandera = enlace.includes(comprobante);
            return bandera
        }

        //https://drive.google.com