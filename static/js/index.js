function ocultarAlerta() {
    var alerta = document.getElementById("alerta");
    alerta.style.display = "none";
}

document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('.sidenav');
    var instances = M.Sidenav.init(elems);
});

const btnDelete = document.querySelectorAll(".btn-delete")

if(btnDelete) {
    const btnArray = Array.from(btnDelete);
    btnArray.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            if(!confirm("Are you sure you want to delete it?")) {
                e.preventDefault();
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('select');
    var instances = M.FormSelect.init(elems);
});

  // Or with jQuery

$(document).ready(function(){
    $('select').formSelect();
});