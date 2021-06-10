$(document).ready(function() {
    var loading = document.getElementById("loading");
    const iconMessage = '<i class="material-icons left icon-size">error</i>';

    function validateForm() {
        var username = document.getElementById("username");
        var password = document.getElementById("password");
        var error = document.getElementById("error");

        if(username.value === null || username.value === "" || password.value === null || password.value === "") {
            error.innerHTML = iconMessage + "The username or password must not be empty";
            error.style.display = "block";
            return false;
        }
        return true
    }

    function cleanForm() {
        error.style.display = "none";
    }

    function ajax_login() {
        $.ajax({
            url: "/ajax-login",
            data: $("form").serialize(),
            type: "POST",
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

    $("#formLogin").submit(function(event) {
        loading.style.display = "block";
        event.preventDefault();
        cleanForm();
        if(validateForm()) {
            ajax_login();
        } else {
            loading.style.display = "none";
        }
    })
})

var statePassword = false;
function togglePassword() {
    if(statePassword) {
        document.getElementById("password").setAttribute("type","password");
        document.getElementById("eyePassword").style.color = "white";
        statePassword = false;
    } else {
        document.getElementById("password").setAttribute("type", "text");
        document.getElementById("eyePassword").style.color = "rgb(127 127 127)";
        statePassword = true;
    }
}