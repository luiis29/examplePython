/*Campos del form*/
var names = document.getElementById("names");
var lastname = document.getElementById("lastname");
var user = document.getElementById("user");
var password = document.getElementById("password");
var confirmpassword = document.getElementById("confirmpassword");

var checkboxes = document.querySelectorAll(".valores");

/*Mensajes de error*/
var errorNames = document.getElementById("errorNames");
var errorLastName = document.getElementById("errorLastName");
var errorUser = document.getElementById("errorUser");
var errorPassword = document.getElementById("errorPassword");
var errorConfirmPassword = document.getElementById("errorConfirmPassword");

const iconMessage = '<i class="material-icons left">error</i>';

/*Global Vars*/
var listValues = new Array();
var listSelectedValues = new Array();
var listUnselectedValues = new Array();
var idUser = "";

(function() {
    let actual = window.location+'';
    let split = actual.split("/");
    idUser = split[split.length-1];

    $.ajax({
        url: "/ajax-get-user-permission/" + idUser,
        success: function(response) {
            if(response.status) {
                marcarPermissions(response.permissions);
            } else {
                console.error(response.mensaje);
            }
        },
        error: function({statusText}) {
            console.log(statusText);
        }
    })
})();

function marcarPermissions(permissions) {
    let cont = 3;
    checkboxes.forEach((e) => {
        if(permissions[0][cont] == 1) {
            $("#"+e.value+"").prop("checked",true);
        }
        cont++;
    });
}

function validarFormulario(param, error, message) {
    if(param === null || param === "") {
        error.innerHTML = iconMessage + message;
        error.style.display = "block";
        return false;
    }
    return true;
}

$("#formEditUser").submit(function(event) {
    loading.style.display = "block";
    cleanArray();
    cleanErrors();

    event.preventDefault();

    obtenerCheckboxes();

    if(validateForm()) {
        ajax_edit_user();
    } else {
        loading.style.display = "none";
    }
})

function cleanArray(){
    var contListValues = listValues.length,
        contListSelectedValues = listSelectedValues.length,
        contListUnselectedValues = listUnselectedValues.length;

    for(let i = 0; i < contListValues; i++) {
        listValues.pop()
    }

    for(let i = 0; i < contListSelectedValues; i++) {
        listSelectedValues.pop();
    }

    for(let i = 0; i < contListUnselectedValues; i++) {
        listUnselectedValues.pop();
    }
}

function obtenerCheckboxes() {
    checkboxes.forEach((e) => {
        listValues.push(e.value);
    });
    
    checkboxes.forEach((e) => {
        if(e.checked == true) {
            listSelectedValues.push(1);
        } else {
            listUnselectedValues.push(e.value)
            listSelectedValues.push(0);
        }
    });

    if(listUnselectedValues.length === 0) {
        listUnselectedValues.push("*");
    }
}

function validateForm() {
    var flag = true;

    if(!validarFormulario(names.value, errorNames, "The field cannot be empty.")) {
        flag = false;
    }
    
    if(!validarFormulario(lastname.value, errorLastName, "The field cannot be empty.")) {
        flag = false;
    }

    if(!(password.value === null || password.value === "") || !(confirmpassword.value === null || confirmpassword.value ==="")) {
        if(!(password.value === null || password.value === "") && (confirmpassword.value === null || confirmpassword.value ==="")) {
            errorConfirmPassword.innerHTML = iconMessage + "The field cannot be empty."
            errorConfirmPassword.style.display = "block";
            flag = false;
        } else if(!(confirmpassword.value === null || confirmpassword.value === "") && (password.value === null || password.value ==="")) {
            errorPassword.innerHTML = iconMessage + "The field cannot be empty.";
            errorPassword.style.display = "block";
            flag = false;
        } else if(password.value != confirmpassword.value) {
            errorConfirmPassword.innerHTML = iconMessage + "Verification password does not match."
            errorConfirmPassword.style.display = "block";
            flag = false;
        } 
    }

    if(!flag) {
        return false;
    }

    return true;
}

function cleanErrors() {
    errorNames.style.display = "none";
    errorLastName.style.display = "none";
    errorUser.style.display = "none";
    errorPassword.style.display = "none";
    errorConfirmPassword.style.display = "none";
}

function ajax_edit_user() {
    $.ajax({
        url: "/ajax-edit-user/" + idUser + "/" + listValues + "/" + listSelectedValues + "/" + listUnselectedValues,
        data: $("form").serialize(),
        method: "POST",
        success: function({status, mensaje}) {
            if(status) {
                location.href = "/users"
                loading.style.display = "none";
            } else {
                error.innerHTML = iconMessage + mensaje;
                error.style.display = "block";
                loading.style.display = "none";
            }         
        },
        error: function({statusText}) {
            error.innerHTML = iconMessage + statusText;
            error.style.display = "block";
            loading.style.display = "none";
        }
    })
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