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

function nameValidate(e) {
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
    } else {
        error1.style.display = 'none';
        error1.innerHTML = '';
    }
    return true;
}
function houseValidate(e) {
    const houseVal = houseId.value.trim(); 
    if (houseVal === '') {
        error2.style.display = 'block';
        error2.innerHTML = 'Please enter an address';
        setTimeout(() => {
            error2.style.display = 'none';
            error2.innerHTML = '';
        }, 3000);
        return false;
    } else if(/^(-?\d+)$/.test(houseVal)) {
        error2.style.display = "block";
        error2.innerHTML = "Please enter an address without numbers"; 
        
        setTimeout(() => {
            error2.style.display = "none";
            error2.innerHTML = "";
        }, 3000);
        return false;
    } else {
        error2.style.display = 'none';
        error2.innerHTML = '';
    }
    return true;
}

function cityValidate(e) {
    const cityVal = cityId.value.trim();
    if (cityVal === '') {
        error3.style.display = 'block';
        error3.innerHTML = 'Please enter a city';
        setTimeout(() => {
            error3.style.display = 'none';
            error3.innerHTML = '';
        }, 3000);
        return false;
    }else if(/^(-?\d+)$/.test(cityVal)) {
        error3.style.display = "block";
        error3.innerHTML = "Please enter a city  without numbers"; 
        
        setTimeout(() => {
            error3.style.display = "none";
            error3.innerHTML = "";
        }, 3000);
        return false;
    }  else {
        error3.style.display = 'none';
        error3.innerHTML = '';
    }
    return true;
}

function stateValidate(e) {
    const stateVal = stateId.value.trim();
    if (stateVal === '') {
        error4.style.display = 'block';
        error4.innerHTML = 'Please enter a state';
        setTimeout(() => {
            error4.style.display = 'none';
            error4.innerHTML = '';
        }, 3000);
        return false;
    }else if(/^(-?\d+)$/.test(stateVal)) {
        error4.style.display = "block";
        error4.innerHTML = "Please enter a state  without numbers"; 
        
        setTimeout(() => {
            error4.style.display = "none";
            error4.innerHTML = "";
        }, 3000);
        return false;
    }  else {
        error4.style.display = 'none';
        error4.innerHTML = '';
    }
    return true;
}

function countryValidate(e) {
    const countryVal = countryId.value.trim();
    if (countryVal === '') {
        error5.style.display = 'block';
        error5.innerHTML = 'Please enter a country';
        setTimeout(() => {
            error5.style.display = 'none';
            error5.innerHTML = '';
        }, 3000);
        return false;
    }else if(/^(-?\d+)$/.test(countryVal)) {
        error5.style.display = "block";
        error5.innerHTML = "Please enter a country  without numbers"; 
        
        setTimeout(() => {
            error5.style.display = "none";
            error5.innerHTML = "";
        }, 3000);
        return false;
    } else {
        error5.style.display = 'none';
        error5.innerHTML = '';
    }
    return true;
}

function pincodeValidate(e) {
    const pincodeVal = pincodeId.value.trim();
    if (pincodeVal === '') {
        error6.style.display = 'block';
        error6.innerHTML = 'Please enter a pincode';
        setTimeout(() => {
            error6.style.display = 'none';
            error6.innerHTML = '';
        }, 3000);
        return false;
    }else if (!/^\d+$/.test(pincodeVal)) {
        error6.style.display = "block";
        error6.innerHTML = "Please enter a valid pincode";

        setTimeout(() => {
            error6.style.display = "none";
            error6.innerHTML = "";
        }, 3000);
        return false;
    }  else {
        error6.style.display = 'none';
        error6.innerHTML = '';
    }
    return true;
}


function mobileValidate(e) {
    const mobileVal = mobileId.value;
    if(mobileVal.trim() === "")
    {
        error7.style.display = "block";
        error7.innerHTML = "Enter a valid mobile number"

        setTimeout(() => {
            error7.style.display = "none";
            error7.innerHTML = "";
        }, 3000)
        return false
    }else if(mobileVal.length < 10 || mobileVal.length > 10)
    {
        error7.style.display = "block";
        error7.innerHTML = "Please enter exactly 10 digits"

        setTimeout(() => {
            error7.style.display = "none";
            error7.innerHTML = "";
        }, 3000);
        return false
    }else if (!/^\d+$/.test(mobileVal)) {
        error7.style.display = "block";
        error7.innerHTML = "Please enter a valid Number";

        setTimeout(() => {
            error7.style.display = "none";
            error7.innerHTML = "";
        }, 3000);
        return false;
    } else{
        error7.style.display = "none";
        error7.innerHTML = "";
    }
    return true

}

nameId.addEventListener('blur', nameValidate);
houseId.addEventListener('blur', houseValidate);
cityId.addEventListener('blur', cityValidate);
stateId.addEventListener('blur', stateValidate);
countryId.addEventListener('blur', countryValidate);
pincodeId.addEventListener('blur', pincodeValidate);
mobileId.addEventListener('blur', mobileValidate);

formId.addEventListener('submit', function (e) {
    const validName = nameValidate();
    const validHouse = houseValidate();
    const validCity = cityValidate();
    const validState = stateValidate();
    const validCountry = countryValidate();
    const validPincode = pincodeValidate();
    const validMobile = mobileValidate();

    if (!validName || !validHouse || !validCity || !validState || !validCountry || !validPincode || !validMobile) {
        e.preventDefault();
    }
});
