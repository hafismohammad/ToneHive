const emailid = document.getElementById("email");
const passwordid = document.getElementById("password");
const error1 = document.getElementById("error1")
const error2 = document.getElementById("error2")
const logFormId = document.getElementById("logForm");



function emailValidate(e){
   const emailval = emailid.value;
   const emailPattrn = /^([a-zA-Z0-9._-]+)@([a-zA-Z.-]+).([a-zA-z]{2,4})$/ 
   if(!emailPattrn.test(emailval))
   {
        error1.style.display = "block";
        error1.innerHTML = "Please enter a valid email address";

        setTimeout(() => {
            error1.style.display = "none";
            error1.innerHTML = "";
        }, 3000);
   }else
   {
        error1.style.display = "none";
        error2.innerHTML = "";
   }
}
function passwordValidate(e) {
    const passwordVal = passwordid.value;
    const alpha = /[a-zA-Z]/;
    const digit = /\d/;

    if (passwordVal.length < 8) {
        error2.style.display = "block";
        error2.innerHTML = "Must enter at least 8 characters";

        setTimeout(() => {
            error2.style.display = "none";
            error2.innerHTML = "";
        }, 3000);
    } else if (!alpha.test(passwordVal) || !digit.test(passwordVal)) {
        error2.style.display = "block";
        error2.innerHTML = "Should contain Numbers and Alphabets!!";

        setTimeout(() => {
            error2.style.display = "none";
            error2.innerHTML = "";
        }, 3000);
    } else {
        error2.style.display = "none";
        error2.innerHTML = "";
    }
}


emailid.addEventListener("blur", emailValidate);
passwordid.addEventListener("blur", passwordValidate);


logFormId.addEventListener("submit", function(e) {
    emailValidate();
    passwordValidate();

    // if(error1.innerHTML || error2.innerHTML || error3.innerHTML || error4.innerHTML) {
    //     e.preventDefault()
    //    }
    // if(error1.innerHTML === "" || error2.innerHTML === "")
    // {
    //     e.preventDefault()
    // }
    if(
        error1.innerHTML === "Please enter a valid email address" || error2.innerHTML === "Must enter at least 8 characters" ||
        error2.innerHTML === "Should contain Numbers and Alphabets!!"
    ){
        e.preventDefault()
    }
})
