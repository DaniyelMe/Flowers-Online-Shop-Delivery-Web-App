
function logUsers() {
  let something = {}

  $.ajax('users').done(response => {
    something.one = response;
    console.log(something.one);
  });
}


var Login = document.getElementsByClassName("next")[0].getElementsByClassName("login")[0];
let Signin = document.getElementsByClassName("next")[0].getElementsByClassName("signup")[1];

Login.addEventListener("click", verify, false);

function verify() {
  let usernameinput = document.getElementsByClassName("user")[0].getElementsByClassName("form-control")[0].value;
  let passwordinput = document.getElementsByClassName("pass")[0].getElementsByClassName("form-control")[0].value;
  $.ajax('users').done(response => {
    response.forEach(
      function(element){
    //    alert(element.username + " = " + usernameinput + "\n" + element.password + " = " + passwordinput);
        if(element.username == usernameinput &&
           element.password == passwordinput)
           {
             alert("all good, we just moved to the shop");
             break;
           }
        else {
          alert("something is missing");
        }
      }
    )
  });
}
logUsers();
