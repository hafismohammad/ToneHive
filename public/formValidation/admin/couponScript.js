
    const nameId = document.getElementById("name");
    const discountId = document.getElementById("discount");
    const expiryDateId = document.getElementById("expiryDate");
    const error1 = document.getElementById("error1");
    const error2 = document.getElementById("error2");
    const error3 = document.getElementById("error3");
    const editFormId = document.getElementById('editForm');

    function nameVal() {
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

    function discountVal() {
        const discVal = discountId.value.trim();
        if (discVal === '') {
            error2.style.display = 'block';
            error2.innerHTML = 'Please enter a valid discount amount';
            setTimeout(() => {
                error2.style.display = 'none';
                error2.innerHTML = '';
            }, 3000);
            return false;
        } else if (isNaN(discVal) || parseInt(discVal) <= 0 || parseInt(discVal) > 100) {
            error2.style.display = 'block';
            error2.innerHTML = 'Please enter a valid discount percentage (between 1 and 100)';
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

    function expiryDateVal() {
        const expiryDateVal = expiryDateId.value.trim();
        if (expiryDateVal === '') {
            error3.style.display = 'block';
            error3.innerHTML = 'Please enter a valid expiry date';
            setTimeout(() => {
                error3.style.display = 'none';
                error3.innerHTML = '';
            }, 3000);
            return false;
        } else {
            const currentDate = new Date();
            const selectedDate = new Date(expiryDateVal);
            if (selectedDate <= currentDate) {
                error3.style.display = 'block';
                error3.innerHTML = 'Expiry date must be a future date';
                setTimeout(() => {
                    error3.style.display = 'none';
                    error3.innerHTML = '';
                }, 3000);
                return false;
            }
        }
        return true;
    }

    nameId.addEventListener("blur", nameVal)
    discountId.addEventListener("blur", discountVal)
    expiryDateId.addEventListener("blur", expiryDateVal)


    editFormId.addEventListener('submit', function (e) {
        const validname=   nameVal();
       const validdiscount =  discountVal();
       const validexpiredDate=   expiryDateVal();

       if (!validname || !validdiscount ||!validexpiredDate ){
             e.preventDefault(); 
        }
    });
