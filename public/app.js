function logUsers() {
  let something = {}

  $.ajax('users').done(response => {
    something.one = response;
  });
}
console.log(document.getElementsByClassName("user")[0]);
var Login = document.getElementsByClassName("next")[0].getElementsByClassName("login")[0];
let Signin = document.getElementsByClassName("next")[0].getElementsByClassName("signup")[1];

Login.addEventListener("click", verify, false);

function verify() {
/*  $.ajax('users').done(donext =>
    {
      if(document.getElementsByClassName("user").value == )
           && document.getElementsByClassName("pass").value == "workshop" )
        {
            alert( "validation succeeded" );
            location.href="run.html";
        }
        else
        {
            alert( "validation failed" );
            location.href="fail.html";
        }
      }
    )
    */
};

logUsers();
