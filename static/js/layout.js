$(document).ready(function(){
    $('select').formSelect();
});

$(document).ready(function(){
    $('.tabs').tabs();
});

$(document).ready(function(){
    $('.collapsible').collapsible();
});

function ocultarAlerta() {
    var alerta = document.getElementById("alerta");
    alerta.style.display = "none";
}

document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('.sidenav');
    var instances = M.Sidenav.init(elems);
});