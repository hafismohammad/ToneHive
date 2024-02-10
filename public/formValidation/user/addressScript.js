

    const lnameId = document.getElementById('lname');
    const fnameId = document.getElementById('fname');
    const mobileId = document.getElementById('mobile');
    const emailId = document.getElementById('email');
    const addressId = document.getElementById('address');
    const countryId = document.getElementById('country');
    const stateId = document.getElementById('state');
    const cityId = document.getElementById('city');
    const pincodeId = document.getElementById('pincode');

    const error1 = document.getElementById('error1');
    const error2 = document.getElementById('error2');
    const error3 = document.getElementById('error3');
    const error4 = document.getElementById('error4');
    const error5 = document.getElementById('error5');
    const error6 = document.getElementById('error6');
    const error7 = document.getElementById('error7');
    const error8 = document.getElementById('error8');
    const error9 = document.getElementById('error9');

    const formId = document.getElementById('formId');

    function fnameValidate() {
        const fnameVal = fnameId.value.trim();
        if (fnameVal === '') {
            error1.style.display = 'block';
            error1.innerHTML = 'Please enter a valid name';
            setTimeout(() => {
                error1.style.display = 'none';
                error1.innerHTML = '';
            }, 3000);
            return false;
        } else if (/^\d+$/.test(fnameVal)) {
            error1.style.display = 'block';
            error1.innerHTML = 'Please enter a name without numbers';
            setTimeout(() => {
                error1.style.display = 'none';
                error1.innerHTML = '';
            }, 3000);
            return false;
        } else {
            error1.style.display = 'none';
            error1.innerHTML = '';
        }
        return true;
    }

    function lnameValidate() {
        const lnameVal = lnameId.value.trim();
        if (lnameVal === '') {
            error2.style.display = 'block';
            error2.innerHTML = 'Please enter a valid name';
            setTimeout(() => {
                error2.style.display = 'none';
                error2.innerHTML = '';
            }, 3000);
            return false;
        } else if (/^\d+$/.test(lnameVal)) {
            error2.style.display = 'block';
            error2.innerHTML = 'Please enter a name without numbers';
            setTimeout(() => {
                error2.style.display = 'none';
                error2.innerHTML = '';
            }, 3000);
            return false;
        } else {
            error2.style.display = 'none';
            error2.innerHTML = '';
        }
        return true;
    }

    function mobileValidate() {
        const mobileVal = mobileId.value.trim();
        if (mobileVal === '') {
            error3.style.display = 'block';
            error3.innerHTML = 'Enter a valid mobile number';
            setTimeout(() => {
                error3.style.display = 'none';
                error3.innerHTML = '';
            }, 3000);
            return false;
        } else if (mobileVal.length !== 10 || !/^\d+$/.test(mobileVal)) {
            error3.style.display = 'block';
            error3.innerHTML = 'Please enter exactly 10 digits';
            setTimeout(() => {
                error3.style.display = 'none';
                error3.innerHTML = '';
            }, 3000);
            return false;
        } else {
            error3.style.display = 'none';
            error3.innerHTML = '';
        }
        return true;
    }

    function emailValidate() {
        const emailVal = emailId.value.trim();
        const emailPattern = /^([a-zA-Z0-9._-]+)@([a-zA-Z.-]+)\.([a-zA-z]{2,4})$/;
        if (!emailPattern.test(emailVal)) {
            error4.style.display = 'block';
            error4.innerHTML = 'Please enter a valid email address';
            setTimeout(() => {
                error4.style.display = 'none';
                error4.innerHTML = '';
            }, 3000);
            return false;
        } else {
            error4.style.display = 'none';
            error4.innerHTML = '';
        }
        return true;
    }

    function addressValidate() {
        const addressVal = addressId.value.trim();
        if (addressVal === '') {
            error5.style.display = 'block';
            error5.innerHTML = 'Please enter an address';
            setTimeout(() => {
                error5.style.display = 'none';
                error5.innerHTML = '';
            }, 3000);
            return false;
        } else {
            error5.style.display = 'none';
            error5.innerHTML = '';
        }
        return true;
    }

    function countryValidate() {
        const countryVal = countryId.value.trim();
        if (countryVal === '') {
            error6.style.display = 'block';
            error6.innerHTML = 'Please enter a country';
            setTimeout(() => {
                error6.style.display = 'none';
                error6.innerHTML = '';
            }, 3000);
            return false;
        } else {
            error6.style.display = 'none';
            error6.innerHTML = '';
        }
        return true;
    }

    function stateValidate() {
        const stateVal = stateId.value.trim();
        if (stateVal === '') {
            error7.style.display = 'block';
            error7.innerHTML = 'Please enter a state';
            setTimeout(() => {
                error7.style.display = 'none';
                error7.innerHTML = '';
            }, 3000);
            return false;
        } else {
            error7.style.display = 'none';
            error7.innerHTML = '';
        }
        return true;
    }

    function cityValidate() {
        const cityVal = cityId.value.trim();
        if (cityVal === '') {
            error8.style.display = 'block';
            error8.innerHTML = 'Please enter a city';
            setTimeout(() => {
                error8.style.display = 'none';
                error8.innerHTML = '';
            }, 3000);
            return false;
        } else {
            error8.style.display = 'none';
            error8.innerHTML = '';
        }
        return true;
    }

    function pincodeValidate() {
        const pincodeVal = pincodeId.value.trim();
        if (pincodeVal === '') {
            error9.style.display = 'block';
            error9.innerHTML = 'Please enter a pincode';
            setTimeout(() => {
                error9.style.display = 'none';
                error9.innerHTML = '';
            }, 3000);
            return false;
        } else {
            error9.style.display = 'none';
            error9.innerHTML = '';
        }
        return true;
    }


    fnameId.addEventListener('blur', fnameValidate);
    lnameId.addEventListener('blur', lnameValidate);
    mobileId.addEventListener('blur', mobileValidate);
    emailId.addEventListener('blur', emailValidate);
    addressId.addEventListener('blur', addressValidate);
    countryId.addEventListener('blur', countryValidate);
    stateId.addEventListener('blur', stateValidate);
    cityId.addEventListener('blur', cityValidate);
    pincodeId.addEventListener('blur', pincodeValidate);

    editFormid.addEventListener('submit', function (e) {
        const validFname = fnameValidate();
        const validLname = lnameValidate();
        const validMobile = mobileValidate();
        const validEmail = emailValidate();
        const validAddress = addressValidate();
        const validCountry = countryValidate();
        const validState = stateValidate();
        const validCity = cityValidate();
        const validPincode = pincodeValidate();

        if (!validFname || !validLname || !validMobile || !validEmail || !validAddress || !validCountry || !validState || !validCity || !validPincode) {
            e.preventDefault();
        }
    });

