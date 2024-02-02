const emailid = document.getElementById("email");
const passwordid = document.getElementById("password");
const error1 = document.getElementById("error1")
const error2 = document.getElementById("error2")
const logFormId = document.getElementById("logForm");



function emailValidate() {
    const emailval = emailid.value.trim(); 
    const emailPattern = /^([a-zA-Z0-9._-]+)@([a-zA-Z.-]+).([a-zA-z]{2,4})$/;
    if (!emailPattern.test(emailval)) {
         error1.style.display = "block";
         error1.innerHTML = "Please enter a valid email address";
 
         setTimeout(() => {
             error1.style.display = "none";
             error1.innerHTML = "";
         }, 3000);
         return false;
    } else {
         error1.style.display = "none";
         error1.innerHTML = "";
    }
    return true;
 }
 
 function passwordValidate() {
     const passwordVal = passwordid.value.trim(); 
     const alpha = /[a-zA-Z]/;
     const digit = /\d/;
     if (passwordVal.length < 8) {
         error2.style.display = "block";
         error2.innerHTML = "Must enter at least 8 characters";
         setTimeout(() => {
             error2.style.display = "none";
             error2.innerHTML = "";
         }, 3000);
         return false;
     } else if (!alpha.test(passwordVal) || !digit.test(passwordVal)) {
         error2.style.display = "block";
         error2.innerHTML = "Should contain Numbers and Alphabets!!";
 
         setTimeout(() => {
             error2.style.display = "none";
             error2.innerHTML = "";
         }, 3000);
         return false;
     } else {
         error2.style.display = "none";
         error2.innerHTML = "";
     }
     return true;
 }
 


emailid.addEventListener("blur", emailValidate);
passwordid.addEventListener("blur", passwordValidate);

logFormId.addEventListener("submit", function(e) {
   
    const isEmailValid = emailValidate();
    const isPasswordValid = passwordValidate();

    console.log('123',isEmailValid);
   
    if (!isEmailValid || !isPasswordValid) {
       
        e.preventDefault();
    }
});
