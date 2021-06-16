/*Campos del form*/
var names = document.getElementById("names");
var lastname = document.getElementById("lastname");
var user = document.getElementById("user");
var password = document.getElementById("password");
var confirmpassword = document.getElementById("confirmpassword");
var role = document.getElementById("role");

var checkboxes = document.querySelectorAll(".valores");
var loading = document.getElementById("loading");

/*Mensajes de error*/
var errorNames = document.getElementById("errorNames");
var errorLastName = document.getElementById("errorLastName");
var errorUser = document.getElementById("errorUser");
var errorPassword = document.getElementById("errorPassword");
var errorConfirmPassword = document.getElementById("errorConfirmPassword");
var errorRole = document.getElementById("errorRole");
var error = document.getElementById("error");

const iconMessage = '<i class="material-icons left">error</i>';
var listValues = new Array();
var listSelectedValues = new Array();
var listUnselectedValues = new Array();

$("#formAddUser").submit(function(event) {
    loading.style.display = "block";
    cleanArray();
    cleanForm();
    
    event.preventDefault();

    obtenerCheckboxes();

    if(validateForm()) {
        ajax_add_user();
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

    if(!validarFields(names.value, errorNames, "The field cannot be empty.")) {
        flag = false;
    }

    if(!validarFields(lastname.value, errorLastName, "The field cannot be empty.")) {
        flag = false;
    }

    if(!validarFields(user.value, errorUser, "The field cannot be empty.")) {
        flag = false;
    }

    if(!validarFields(password.value, errorPassword, "The field cannot be empty.")) {
        flag = false;
    }

    if(role.value == "Select role") {
        errorRole.innerHTML = iconMessage + "You must select a role";
        errorRole.style.display = "block";
        flag = false;
    }

    if(confirmpassword.value === null || confirmpassword.value === "") {
        errorConfirmPassword.innerHTML = iconMessage + "The field cannot be empty."
        errorConfirmPassword.style.display = "block";
        flag = false;
    } else if(password.value != confirmpassword.value) {
        errorConfirmPassword.innerHTML = iconMessage + "Verification password does not match."
        errorConfirmPassword.style.display = "block";
        flag = false;
    }

    if(!flag) {
        return false;
    }

    return true;
}

function validarFields(param, error, message) {
    if(param === null || param === "") {
        error.innerHTML = iconMessage + message;
        error.style.display = "block";
        return false;
    }
    return true;
}

function cleanForm() {
    errorNames.style.display = "none";
    errorLastName.style.display = "none";
    errorUser.style.display = "none";
    errorPassword.style.display = "none";
    errorConfirmPassword.style.display = "none";
    errorRole.style.display = "none";
    error.style.display = "none";
}

function ajax_add_user() {
    $.ajax({
        url: "/ajax-add-user/" + listValues + "/" + listSelectedValues + "/" + listUnselectedValues,
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