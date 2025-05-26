const nameId = document.getElementById("name");
const discountId = document.getElementById("discount");
const maxDiscountAmountId = document.getElementById("maxDiscountAmount");
const minPurchaseAmountId = document.getElementById("minPurchaseAmount");
const startDateId = document.getElementById("startDate");
const expiryDateId = document.getElementById("expiryDate");

const error1 = document.getElementById("error1");
const error2 = document.getElementById("error2");
const error3 = document.getElementById("error3");
const error4 = document.getElementById("error4");
const error5 = document.getElementById("error5");
const error6 = document.getElementById("error6");

const editFormId = document.getElementById("editForm");

// Helper: hide error after 3 seconds
function hideError(el) {
  setTimeout(() => {
    el.style.display = "none";
    el.innerHTML = "";
  }, 3000);
}

// Name validation
function nameVal() {
  const name = nameId.value.trim();
  if (!name) {
    error1.style.display = "block";
    error1.innerHTML = "Please enter a valid name";
    hideError(error1);
    return false;
  } else if (!/^[A-Za-z\s]+$/.test(name)) {
    error1.style.display = "block";
    error1.innerHTML = "Name must not contain numbers or symbols";
    hideError(error1);
    return false;
  } else {
    error1.style.display = "none";
    return true;
  }
}

// Discount percentage validation
function discountVal() {
  const discount = discountId.value.trim();
  const discountNum = parseFloat(discount);
  if (!discount) {
    error2.style.display = "block";
    error2.innerHTML = "Please enter a discount value";
    hideError(error2);
    return false;
  } else if (isNaN(discountNum) || discountNum <= 0 || discountNum > 100) {
    error2.style.display = "block";
    error2.innerHTML = "Discount must be between 1 and 100";
    hideError(error2);
    return false;
  } else {
    error2.style.display = "none";
    return true;
  }
}

// Max discount amount validation
function maxDiscountAmountVal() {
  const maxAmount = maxDiscountAmountId.value.trim();
  const maxNum = parseFloat(maxAmount);
  if (!maxAmount) {
    error4.style.display = "block";
    error4.innerHTML = "Please enter a maximum discount amount";
    hideError(error4);
    return false;
  } else if (isNaN(maxNum) || maxNum <= 0) {
    error4.style.display = "block";
    error4.innerHTML = "Max discount must be greater than 0";
    hideError(error4);
    return false;
  } else {
    error4.style.display = "none";
    return true;
  }
}

// Min purchase amount validation
function minPurchaseAmountVal() {
  const minAmount = minPurchaseAmountId.value.trim();
  const minNum = parseFloat(minAmount);
  if (!minAmount) {
    error6.style.display = "block";
    error6.innerHTML = "Please enter a minimum purchase amount";
    hideError(error6);
    return false;
  } else if (isNaN(minNum) || minNum <= 0) {
    error6.style.display = "block";
    error6.innerHTML = "Minimum purchase amount must be greater than 0";
    hideError(error6);
    return false;
  } else {
    error6.style.display = "none";
    return true;
  }
}

// Start date validation
function startDateVal() {
  const startDate = startDateId.value.trim();
  if (!startDate) {
    error5.style.display = "block";
    error5.innerHTML = "Please enter a start date";
    hideError(error5);
    return false;
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(startDate);
    if (selectedDate < today) {
      error5.style.display = "block";
      error5.innerHTML = "Start date must be today or in the future";
      hideError(error5);
      return false;
    }
  }
  error5.style.display = "none";
  return true;
}

// Expiry date validation
function expiryDateVal() {
  const expiryDate = expiryDateId.value.trim();
  if (!expiryDate) {
    error3.style.display = "block";
    error3.innerHTML = "Please enter an expiry date";
    hideError(error3);
    return false;
  } else {
    const startDate = new Date(startDateId.value);
    const endDate = new Date(expiryDate);
    if (endDate <= startDate) {
      error3.style.display = "block";
      error3.innerHTML = "Expiry date must be after the start date";
      hideError(error3);
      return false;
    }
  }
  error3.style.display = "none";
  return true;
}

// Attach blur event listeners
nameId.addEventListener("blur", nameVal);
discountId.addEventListener("blur", discountVal);
maxDiscountAmountId.addEventListener("blur", maxDiscountAmountVal);
minPurchaseAmountId.addEventListener("blur", minPurchaseAmountVal);
startDateId.addEventListener("blur", startDateVal);
expiryDateId.addEventListener("blur", expiryDateVal);

// Final form validation on submit
editFormId.addEventListener("submit", function (e) {
  const isValid =
    nameVal() &&
    discountVal() &&
    maxDiscountAmountVal() &&
    minPurchaseAmountVal() &&
    startDateVal() &&
    expiryDateVal();

  if (!isValid) {
    e.preventDefault();
  }
});





    // const nameId = document.getElementById("name");
    // const discountId = document.getElementById("discount");
    // const expiryDateId = document.getElementById("expiryDate");
    // const error1 = document.getElementById("error1");
    // const error2 = document.getElementById("error2");
    // const error3 = document.getElementById("error3");
    // const editFormId = document.getElementById('editForm');

    // function nameVal() {
    //     const nameVal = nameId.value.trim();
    //     if (nameVal === '') {
    //         error1.style.display = 'block';
    //         error1.innerHTML = 'Please enter a valid name';
    //         setTimeout(() => {
    //             error1.style.display = 'none';
    //             error1.innerHTML = '';
    //         }, 3000);
    //         return false;
    //     } else if (/^-?\d+$/.test(nameVal)) {
    //         error1.style.display = 'block';
    //         error1.innerHTML = 'Please enter a name without numbers';
    //         setTimeout(() => {
    //             error1.style.display = 'none';
    //             error1.innerHTML = '';
    //         }, 3000);
    //         return false;
    //     } else {
    //         error1.style.display = 'none';
    //         error1.innerHTML = '';
    //     }
    //     return true;
    // }

    // function discountVal() {
    //     const discVal = discountId.value.trim();
    //     if (discVal === '') {
    //         error2.style.display = 'block';
    //         error2.innerHTML = 'Please enter a valid discount amount';
    //         setTimeout(() => {
    //             error2.style.display = 'none';
    //             error2.innerHTML = '';
    //         }, 3000);
    //         return false;
    //     } else if (isNaN(discVal) || parseInt(discVal) <= 0 || parseInt(discVal) > 100) {
    //         error2.style.display = 'block';
    //         error2.innerHTML = 'Please enter a valid discount percentage (between 1 and 100)';
    //         setTimeout(() => {
    //             error2.style.display = 'none';
    //             error2.innerHTML = '';
    //         }, 3000);
    //         return false;
    //     } else {
    //         error2.style.display = 'none';
    //         error2.innerHTML = '';
    //     }
    //     return true;
    // }

    // function expiryDateVal() {
    //     const expiryDateVal = expiryDateId.value.trim();
    //     if (expiryDateVal === '') {
    //         error3.style.display = 'block';
    //         error3.innerHTML = 'Please enter a valid expiry date';
    //         setTimeout(() => {
    //             error3.style.display = 'none';
    //             error3.innerHTML = '';
    //         }, 3000);
    //         return false;
    //     } else {
    //         const currentDate = new Date();
    //         const selectedDate = new Date(expiryDateVal);
    //         if (selectedDate <= currentDate) {
    //             error3.style.display = 'block';
    //             error3.innerHTML = 'Expiry date must be a future date';
    //             setTimeout(() => {
    //                 error3.style.display = 'none';
    //                 error3.innerHTML = '';
    //             }, 3000);
    //             return false;
    //         }
    //     }
    //     return true;
    // }

    // nameId.addEventListener("blur", nameVal)
    // discountId.addEventListener("blur", discountVal)
    // expiryDateId.addEventListener("blur", expiryDateVal)


    // editFormId.addEventListener('submit', function (e) {
    //     const validname=   nameVal();
    //    const validdiscount =  discountVal();
    //    const validexpiredDate=   expiryDateVal();

    //    if (!validname || !validdiscount ||!validexpiredDate ){
    //          e.preventDefault(); 
    //     }
    // });
