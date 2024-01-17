const nameid = document.getElementById("name");
const emailid = document.getElementById("email");
const mobileid = document.getElementById("mobile")
const passwordid = document.getElementById("password");
const error1 = document.getElementById("error1")
const error2 = document.getElementById("error2")
const error3 = document.getElementById("error3")
const error4 = document.getElementById("error4")
const regformid = document.getElementById("regForm")

function nameValidate(e) {
    const nameVal = nameid.value
    if(nameVal.trim() === "")
    {
        error1.style.display = "block";
        error1.innerHTML = "Please enter valid name";

        setTimeout(() => {
            error1.style.display = "none";
            error1.innerHTML = "";
        }, 3000);
    }else
    {
        error1.style.display = "none";
        error1.innerHTML = "";
    }
}
function emailValidation(e) {
    const emailVal = emailid.value;
    const emailPattrn = /^([a-zA-Z0-9._-]+)@([a-zA-Z.-]+).([a-zA-z]{2,4})$/ 
    if(!emailPattrn.test(emailVal))
    {
        error2.style.display = "block";
        error2.innerHTML = "Please enter valid email address";

        setTimeout(() => {
            error2.style.display = "none";
            error2.innerHTML = "";
        }, 3000);
    }else
    {
        error2.style.display = "none";
        error2.innerHTML = "";
    }

}

function mobileValidate(e) {
    const mobileVal = mobileid.value;
    if(mobileVal.trim() === "")
    {
        error3.style.display = "block";
        error3.innerHTML = "Enter a valid mobile number"

        setTimeout(() => {
            error3.style.display = "none";
            error3.innerHTML = "";
        }, 3000);
    }else if(mobileVal.length < 10 || mobileVal.length > 10)
    {
        error3.style.display = "block";
        error3.innerHTML = "Please enter exactly 10 digits"

        setTimeout(() => {
            error3.style.display = "none";
            error3.innerHTML = "";
        }, 3000);
    }else{
        error3.style.display = "none";
        error3.innerHTML = "";
    }

}

function passwordValidate(e) {
    const passwordVal = passwordid.value;
    const alpha =  /[a-zA-Z]/
    const digit = /\d/
    if(passwordVal.length < 8)
    {
        error4.style.display = "block";
        error4.innerHTML = "Must enter at least 8 characters";

        setTimeout(() => {
            error4.style.display = "none";
            error4.innerHTML = "";
        }, 3000);

    }else if(!alpha.test(passwordVal) || !digit.test(passwordVal))
    {
        error4.style.display = "block"
        error4.innerHTML = "Should contain number and alphabets !!"

        setTimeout(() => {
            error4.style.display = "none";
            error4.innerHTML = "";
        }, 3000);

    }else {
        error4.style.display = "none";
        error4.innerHTML = ""
    }
}


nameid.addEventListener("blur", nameValidate)
emailid.addEventListener("blur", emailValidation)
mobileid.addEventListener("blur", mobileValidate)
passwordid.addEventListener("blur", passwordValidate)


regformid.addEventListener("submit", function(e) {
    nameValidate()
    emailValidation()
    mobileValidate()
    passwordValidate()
    if(error1.innerHTML || error2.innerHTML || error3.innerHTML || error4.innerHTML) {

     e.preventDefault()
    }
 })