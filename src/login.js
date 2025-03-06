function validateEmail() {
    var email_input = document.getElementsByName("email");
    if (!email_input.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]/)) {
        email_input.style.borderBottomColor = "red";
    } 
    else {
      email_input.style.borderBottomColor = "green";
    }
}

function validate_username(){
    var username_input = document.getElementsByName('username');
    if (!username_input.match(/^[A-Z][a-zA-Z]{5,7}$/)){
        username_input.style.borderBottomColor = "red";
    }
    else {
        username_input.style.borderBottomColor = "green";
    }
}
