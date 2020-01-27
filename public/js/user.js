const parentContainer = document.querySelector('#container');
let userId = document.querySelector('.navbar-text').id;
const alertDiv = document.querySelector('#divElement');

parentContainer.addEventListener('click',(e) => {
    if(e.target.classList.contains('addToCart')) {
        let productId = e.target.parentElement.parentElement.parentElement.parentElement.id;
        let name = e.target.parentElement.parentElement.parentElement.previousElementSibling.firstElementChild.innerText;
        let qty = e.target.parentElement.previousElementSibling.value;
        let price = e.target.parentElement.parentElement.parentElement.previousElementSibling.lastElementChild.innerText;
        let image = e.target.parentElement.parentElement.parentElement.previousElementSibling.previousElementSibling.src;
        $.ajax({
            method: "POST", url: "/users/add", data: {
                userId: userId,
                productId: productId,
                name: name,
                qty: qty,
                price: price,
                image: image,
            },
            success: function(err,data) {
                successAlert();
            }
        })
    }
});

parentContainer.addEventListener('keyup',(e) => {
    if(e.target.classList.contains('cartCheck')) {
        let qty = e.target.value;
        let btn = e.target.nextElementSibling.firstElementChild;
        if(qty <= 0) {
            btn.style.cursor = 'not-allowed';
            btn.setAttribute('disabled',true);
        } else {
            btn.style.cursor = 'pointer';
            btn.removeAttribute('disabled');
        }
    }
});

function successAlert() {
    // make the alert visible and then hiding it after 1 second.....NICE
    alertDiv.style.display = 'block';
    setTimeout(() => {
        alertDiv.style.display = 'none';
    }, 1000);
}