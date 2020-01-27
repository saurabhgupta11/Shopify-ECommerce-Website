const alertDiv = document.querySelector('#divElement');
const parentContainer = document.querySelector('#container');
let userId = document.querySelector('.navbar-text').id;
const checkOutBtn = document.querySelector('#CheckOut');
let isOutOfStock = false;


let qtys = document.getElementsByClassName("Qty");

let hiddenQtys = document.getElementsByClassName("hidden");
let errors = [];

for (let i = 0, len = hiddenQtys.length; i < len; i++) {
    if(Number(qtys[i].innerText) > Number(hiddenQtys[i].max)){
        isOutOfStock = true;
        console.log(Number(qtys[i].innerText) + " " + Number(hiddenQtys[i].max));
        errors.push('OOS');
    } else {
        errors.push('OK');
    }
}
for(let i=0;i<hiddenQtys.length;i++) {
    if(errors[i].localeCompare('OOS') === 0) {
        document.getElementById(`${i}`).innerText = 'Out Of Stock';
        document.getElementById(`${i}`).style.color = 'red';
    }
}

if(isOutOfStock || qtys.length === 0) {
    checkOutBtn.classList.remove('btn-success');
    checkOutBtn.classList.add('btn-danger');
}

checkOutBtn.addEventListener('click',(e) => {
    if(isOutOfStock) {
        $.ajax({
            method: "POST", url: "/users/cart/compute", data: {
                userId: userId,
            },
            success: function (data, status) {
                if (data.err == null) {
                    window.location.href = '/users/checkout';
                } else {
                    Alert(data.err);
                }
            }
        })
    } else {
        if (!isOutOfStock && qtys.length != 0) {
            $.ajax({
                method: "POST",url: "/users/cart/compute",data: {
                    userId: userId,
                },
                success: function(data,status) {
                    if(data.err == null) {
                        window.location.href = '/users/checkout';
                    } else {
                        Alert(data.err);
                    }
                }
            })
        }
    }
});


parentContainer.addEventListener('click',(e) => {
    if(e.target.classList.contains('Delete')) {
        let productId = e.target.parentElement.parentElement.id;
        $.ajax({
            method: "POST", url: "/users/cart/delete", data: {
                userId: userId,
                productId: productId,
            },
            success: function (err, data) {
                Alert('Deleted');
                removeProductFromDOM(e);
                window.location.href = `/users/cart/${userId}`;
            }
        });
    }
});

function removeProductFromDOM(e) {
    e.target.parentElement.parentElement.remove();
}

function Alert(str) {
    // make the alert visible and then hiding it after 1 second.....NICE
    alertDiv.style.display = 'block';
    alertDiv.firstElementChild.innerText = str;
    setTimeout(() => {
        alertDiv.style.display = 'none';
    }, 1000);
}