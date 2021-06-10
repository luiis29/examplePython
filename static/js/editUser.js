//$(document).ready(function() {

const p = new Promise((resolve, reject) => {
    var actual = window.location+'';
    //Se realiza la división de la URL
    var split = actual.split("/");
    //Se obtiene el ultimo valor de la URL
    var id = split[split.length-1];

    $.ajax({
        url: "/ajax-obtener-user/" + id,
        success: function(response) {
            if(response.status) {
                console.log(response.idrole);
                resolve(response.idrole);
            } else {
                console.error(response.mensaje)
                reject(response.mensaje);
            }
        },
        error: function({statusText}) {
            console.log(statusText)
            reject(response.mensaje);
        }
    })
});


p.then(res => {
    //console.log("valor" + res);
    document.ready = document.getElementById("role").value = res;
})
.catch(error => {
    console.log(error);
});


/* sync function obtenerUser() {
    //Se obtiene el valor de la URL desde el navegador
    var actual = window.location+'';
    //Se realiza la división de la URL
    var split = actual.split("/");
    //Se obtiene el ultimo valor de la URL
    var id = split[split.length-1];
    //var respuesta = ajax_id(id);
    //return respuesta;

    let idFunction = (id)  => {
        $.ajax({
            url: "/ajax-obtener-user/" + id,
            success: function(response) {
                if(response.status) {
                    
                    console.log(response.idrole);
                    return response.idrole
                } else {
                    console.error(response.mensaje)
                }
            },
            error: function({statusText}) {
                console.log(statusText)
            }
        })
    }
    let res = await idFunction(id)
    

}

async function prue() {
    var resultado = await obtenerUser()
    var numero = 2;
    
}


prue() */

//document.getElementById("opciones").val = '0';
/*Campos del form*/
var names = document.getElementById("names");
var lastname = document.getElementById("lastname");
var user = document.getElementById("user");
var password = document.getElementById("password");
var confirmpassword = document.getElementById("confirmpassword");
var role = document.getElementById("role");

/*Mensajes de error*/
var errorNames = document.getElementById("errorNames");
var errorLastName = document.getElementById("errorLastName");
var errorUser = document.getElementById("errorUser");
var errorPassword = document.getElementById("errorPassword");
var errorConfirmPassword = document.getElementById("errorConfirmPassword");
var errorRole = document.getElementById("errorRole");

const iconMessage = '<i class="material-icons left">error</i>';

function validarFormulario(param, error, message) {
    if(param === null || param === "") {
        error.innerHTML = iconMessage + message;
        error.style.display = "block";
        return false;
    }
    return true;
}

var form =  document.getElementById("formEditUser");
form.addEventListener("submit", function(event) {
    ocultarErrores();

    if(!validarFormulario(names.value, errorNames, "The field cannot be empty.")) {
        event.preventDefault();
    }
    
    if(!validarFormulario(lastname.value, errorLastName, "The field cannot be empty.")) {
        event.preventDefault();
    }

    if(role.value == "Select role") {
        errorRole.innerHTML = iconMessage + "You must select a role";
        errorRole.style.display = "block";
        event.preventDefault();
    }

    if(!(password.value === null || password.value === "") || !(confirmpassword.value === null || confirmpassword.value ==="")) {
        if(!(password.value === null || password.value === "") && (confirmpassword.value === null || confirmpassword.value ==="")) {
            errorConfirmPassword.innerHTML = iconMessage + "The field cannot be empty."
            errorConfirmPassword.style.display = "block";
            event.preventDefault();
        } else if(!(confirmpassword.value === null || confirmpassword.value === "") && (password.value === null || password.value ==="")) {
            errorPassword.innerHTML = iconMessage + "The field cannot be empty.";
            errorPassword.style.display = "block";
            event.preventDefault();
        } else if(password.value != confirmpassword.value) {
            errorConfirmPassword.innerHTML = iconMessage + "Verification password does not match."
            errorConfirmPassword.style.display = "block";
            event.preventDefault();
        } 
    }
})

function ocultarErrores() {
    errorNames.style.display = "none";
    errorLastName.style.display = "none";
    errorUser.style.display = "none";
    errorPassword.style.display = "none";
    errorConfirmPassword.style.display = "none";
}

var statePassword = false;
function togglePassword() {
    if(statePassword) {
        document.getElementById("password").setAttribute("type","password");
        document.getElementById("eyePassword").style.color = "black";
        statePassword = false;
    } else {
        document.getElementById("password").setAttribute("type", "text");
        document.getElementById("eyePassword").style.color = "rgb(127 127 127)";
        statePassword = true;
    }
}

var stateConfirmPassword = false;
function toggleConfirmPassword() {
    if(stateConfirmPassword) {
        document.getElementById("confirmpassword").setAttribute("type","password");
        document.getElementById("eyeConfirmPassword").style.color = "black";
        stateConfirmPassword = false;
    } else {
        document.getElementById("confirmpassword").setAttribute("type", "text");
        document.getElementById("eyeConfirmPassword").style.color = "rgb(127 127 127)";
        stateConfirmPassword = true;
    }
}