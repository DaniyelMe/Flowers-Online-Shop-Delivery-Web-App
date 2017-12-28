function logUsers() {
    let something = {}

    $.ajax('users').done(response => {
        something.one = response;
    });
}



logUsers();