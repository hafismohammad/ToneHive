
const nameid = document.getElementById("name");
const descriptionid = document.getElementById("description");
const priceid = document.getElementById("price")
const quantityid = document.getElementById("quantity");
const discountid = document.getElementById("discount");
const imgid = document.getElementById('image')


const error1 = document.getElementById("error1")
const error2 = document.getElementById("error2")
const error3 = document.getElementById("error3")
const error4 = document.getElementById("error4")
const error5 = document.getElementById("error5")
const error6 = document.getElementById("error6")


const editFormid = document.getElementById("editForm")


function nameVal(e) {
    const nameVal = nameid.value
    if(nameVal.trim() === "")
    {
        error1.style.display = "block";
        error1.innerHTML = "Please enter product name";

        setTimeout(() => {
            error1.style.display = "none";
            error1.innerHTML = "";
        }, 3000);
        return false
    }else if(/^(-?\d+)$/.test(nameVal)){
            error1.style.display = "block";
            error1.innerHTML = "Please enter a product name without numbers"; 
            
            setTimeout(() => {
                error1.style.display = "none";
                error1.innerHTML = "";
            }, 3000);
            return false;
        }else
       {
        error1.style.display = "none";
        error1.innerHTML = "";
      }
    return true
}


function descriptionVal(e) {
    const descVal = descriptionid.value
    if(descVal.trim() === "")
    {
        error2.style.display = "block";
        error2.innerHTML = "Please enter description";

        setTimeout(() => {
            error2.style.display = "none";
            error2.innerHTML = "";
        }, 3000);
        return false
    }else if(/^(-?\d+)$/.test(descVal)){
            error2.style.display = "block";
            error2.innerHTML = "Please enter a description  without numbers"; 
            
            setTimeout(() => {
                error2.style.display = "none";
                error2.innerHTML = "";
            }, 3000);
            return false;
        }else
        {
        error2.style.display = "none";
        error2.innerHTML = "";
        }
    return true
}

function priceVal(e) {
    const priceVal = priceid.value.trim();

    if (priceVal === "") {
        error3.style.display = "block";
        error3.innerHTML = "Please enter price";

        setTimeout(() => {
            error3.style.display = "none";
            error3.innerHTML = "";
        }, 3000);
        return false;
    } else if (!/^\d+$/.test(priceVal)) {
        error3.style.display = "block";
        error3.innerHTML = "Please enter a valid price";

        setTimeout(() => {
            error3.style.display = "none";
            error3.innerHTML = "";
        }, 3000);
        return false;
    } else {
        error3.style.display = "none";
        error3.innerHTML = "";
        return true;
    }
}

function quantityVal(e) {
    const quaVal = quantityid.value.trim();

    if (quaVal === "") {
        error4.style.display = "block";
        error4.innerHTML = "Please enter product quantity";

        setTimeout(() => {
            error4.style.display = "none";
            error4.innerHTML = "";
        }, 3000);
        return false;
    } else if (!/^\d+$/.test(quaVal)) {
        error4.style.display = "block";
        error4.innerHTML = "Please enter a valid numeric quantity";

        setTimeout(() => {
            error4.style.display = "none";
            error4.innerHTML = "";
        }, 3000);
        return false;
    } else {
        error4.style.display = "none";
        error4.innerHTML = "";
        return true;
    }
}


function discountVal(e) {
    const discVal = discountid.value
    if(discVal.trim() === "")
    {
        error5.style.display = "block";
        error5.innerHTML = "Please enter product discount";

        setTimeout(() => {
            error5.style.display = "none";
            error5.innerHTML = "";
        }, 3000);
        return false
    }else
    {
        error5.style.display = "none";
        error5.innerHTML = "";
        return true
    }
}
function imageVal(e) {
    const fileInput = imgid.files[0]; // Get the selected file
    const fileSize = fileInput ? fileInput.size : 0; // Check if fileInput exists and get its size
    const allowedExtensions = /(\.jpg|\.jpeg|\.png|\.gif|\.webp)$/i; // Define the allowed file extensions

    if (!fileInput) {
        // No file selected
        error6.style.display = "block";
        error6.innerHTML = "Please select an image";

        setTimeout(() => {
            error6.style.display = "none";
            error6.innerHTML = "";
        }, 3000);
        return false;
    } else if (!allowedExtensions.exec(fileInput.name)) {
        // Invalid file type
        error6.style.display = "block";
        error6.innerHTML = "Please select a valid image file (jpg, jpeg, png, gif, webp)";

        setTimeout(() => {
            error6.style.display = "none";
            error6.innerHTML = "";
        }, 3000);
        return false;
    } else if (fileSize > 5242880) {
        // File size exceeds 5MB
        error6.style.display = "block";
        error6.innerHTML = "Please select an image file smaller than 5MB";

        setTimeout(() => {
            error6.style.display = "none";
            error6.innerHTML = "";
        }, 3000);
        return false;
    } else {
        // Valid image
        error6.style.display = "none";
        error6.innerHTML = "";
        return true;
    }
}


nameid.addEventListener("blur", nameVal)
descriptionid.addEventListener("blur", descriptionVal)
priceid.addEventListener("blur", priceVal)
discountid.addEventListener("blur", discountVal)
quantityid.addEventListener("blur", quantityVal)
imgid.addEventListener("change", imageVal);

editFormid.addEventListener("submit", function (e) {
    // Run the validation functions and store the results
    const validName = nameVal();
    const validDescription = descriptionVal();
    const validPrice = priceVal();
    const validDiscount = discountVal();
    const validQuantity = quantityVal();
    const validImg = imageVal();

    // Check if any validation failed
    if (!validName || !validDescription || !validPrice || !validDiscount || !validQuantity || !validImg) {
        e.preventDefault(); // Prevent form submission if any validation fails
    }
});
