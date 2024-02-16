const nameId = document.getElementById('name');
const houseId = document.getElementById('house');
const cityId = document.getElementById('city');
const stateId = document.getElementById('state');
const countryId = document.getElementById('country');
const pincodeId = document.getElementById('pincode');
const mobileId = document.getElementById('mobile');

const error1 = document.getElementById('error1');
const error2 = document.getElementById('error2');
const error3 = document.getElementById('error3');
const error4 = document.getElementById('error4');
const error5 = document.getElementById('error5');
const error6 = document.getElementById('error6');
const error7 = document.getElementById('error7');

const formId = document.getElementById('formId');



 function nameValidate() {
    const nameVal = nameId.value.trim();
    if (nameVal === '') {
        error1.style.display = 'block';
        error1.innerHTML = 'Please enter a valid name';
        setTimeout(() => {
            error1.style.display = 'none';
            error1.innerHTML = '';
        }, 3000);
        return false;
    } else if (/^-?\d+$/.test(nameVal)) {
        error1.style.display = 'block';
        error1.innerHTML = 'Please enter a name without numbers';
        setTimeout(() => {
            error1.style.display = 'none';
            error1.innerHTML = '';
        }, 3000);
        return false;
    }else if (/\d/.test(nameVal)) {
        error1.style.display = 'block';
        error1.innerHTML = 'Please enter a name without numbers';
        setTimeout(() => {
            error1.style.display = 'none';
            error1.innerHTML = '';
        }, 3000);
        return false;
    }
     else {
        error1.style.display = 'none';
        error1.innerHTML = '';
    }
    return true;
}

function houseValidate() {
    const houseVal = houseId.value.trim();
    if (houseVal === '') {
        error2.style.display = 'block';
        error2.innerHTML = 'Please enter a valid house';
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

function cityValidate() {
    const cityVal = cityId.value.trim();
    if (cityVal === '') {
        error3.style.display = 'block';
        error3.innerHTML = 'Please enter a valid city';
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

function stateValidate() {
    const stateVal = stateId.value.trim();
    if (stateVal === '') {
        error4.style.display = 'block';
        error4.innerHTML = 'Please enter a valid state';
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

function countryValidate() {
    const countryVal = countryId.value.trim();
    if (countryVal === '') {
        error5.style.display = 'block';
        error5.innerHTML = 'Please enter a valid country';
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

function pincodeValidate() {
    const pincodeVal = pincodeId.value.trim();
    if (pincodeVal === '' || !/^\d{6}$/.test(pincodeVal)) {
        error6.style.display = 'block';
        error6.innerHTML = 'Please enter a valid 6-digit pincode';
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

function mobileValidate() {
    const mobileVal = mobileId.value.trim();
    if (mobileVal === '' || !/^\d{10}$/.test(mobileVal)) {
        error7.style.display = 'block';
        error7.innerHTML = 'Please enter a valid 10-digit mobile number';
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


nameId.addEventListener('blur', nameValidate);
houseId.addEventListener('blur', houseValidate);
cityId.addEventListener('blur', cityValidate);
stateId.addEventListener('blur', stateValidate);
countryId.addEventListener('blur', countryValidate);
pincodeId.addEventListener('blur', pincodeValidate);
mobileId.addEventListener('blur', mobileValidate);
// Select the submit button element

formId.addEventListener('submit', function (e) {

    const isNameValid = nameValidate();
    const isHouseValid = houseValidate();
    const isCityValid = cityValidate();
    const isStateValid = stateValidate();
    const isCountryValid = countryValidate();
    const isPincodeValid = pincodeValidate();
    const isMobileValid = mobileValidate();

    if (!isNameValid || !isHouseValid || !isCityValid || !isStateValid || !isCountryValid || !isPincodeValid || !isMobileValid) {
        e.preventDefault();
    }
});


