const otpVerify = document.getElementById("verify-otp");
const error1 = document.getElementById("error1");
const verifyOtpForm = document.getElementById("verifyotpForm");

// Assuming userEnteredOtp is obtained from the server side, not in the client-side script
const userEnteredOtp = "<your_server_obtained_otp_value>";

function otpValidate() {
    const otpValue = otpVerify.value.trim();

    if (otpValue === "") {
        error1.style.display = "block";
        error1.innerHTML = "Please enter OTP";

        setTimeout(() => {
            error1.style.display = "none";
            error1.innerHTML = "";
        }, 3000);
        return false; // Indicate validation failure
    } else if (otpValue !== userEnteredOtp) {
        error1.style.display = "block";
        error1.innerHTML = "Please enter a valid OTP";

        setTimeout(() => {
            error1.style.display = "none";
            error1.innerHTML = "";
        }, 3000);
        return false; // Indicate validation failure
    } else {
        error1.style.display = "none";
        error1.innerHTML = "";
        return true; // Indicate validation success
    }
}

otpVerify.addEventListener("blur", otpValidate);

verifyOtpForm.addEventListener("submit", function (e) {
    // Run the OTP validation function and store the result
    const isOtpValid = otpValidate();

    // Check if OTP validation failed
    if (!isOtpValid) {
        e.preventDefault(); // Prevent form submission if validation fails
    }
    
});

