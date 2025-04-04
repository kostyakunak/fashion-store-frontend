if(document.readyState == 'loading'){
    document.addEventListener('DOMContentLoaded', ready)
}
else{
    ready()
}


function ready(){
    var removeCartItemButtons = document.getElementsByClassName('btn-danger')
    console.log(removeCartItemButtons)
    
    for(var i = 0; i < removeCartItemButtons.length; i++){
        var button = removeCartItemButtons[i]
        button.addEventListener('click', removeCartItem)
    }

    var quantityInputs = document.getElementsByClassName('cart-quantity-input')
    for(var i = 0; i < quantityInputs.length; i++){
        var input = quantityInputs[i]
        input.addEventListener('change', quantityChanger)
    }

    var addToCartButtons = document.getElementsByClassName('shop-item-button')
        for(var i = 0; i < addToCartButtons.length; i++){
            var button = addToCartButtons[i]
            button.addEventListener('click', addToCartClicked)
        }
    
}

function addToCartClicked(){

    var button = event.target
    var shopItem = button.parentElement.parentElement
    var title = shopItem.getElementsByClassName('shop-item-title')[0].innerText
    var image = shopItem.getElementsByClassName('shop-item-image')[0].src
    var price = shopItem.getElementsByClassName('shop-item-price')[0].innerText

    addItemToCart(title,price,image)
}

function addItemToCart(title,price,image){

    var cartRow = document.createElement('div')
    var cartItems = document.getElementsByClassName('cart-items')[0]
    var cartItemNames = cartItems.getElementsByClassName('cart-item-title')
    for(var i = 0; i < cartItemNames.length; i++){
        if(cartItemNames[i].innerText == title){
            
            a = parseInt(cart-quantity-input)[0].value + 1
            cartItems.getElementsByClassName('cart-quantity-input')[0].value = a
            return
        }
    }
    var cartRowContents = `
        <div class="cart-row">
            <div class="cart-item cart-column">
                <img class="cart-item-image" src="${image}" width="100" height="100">
                <span class="cart-item-title">${title}</span>
            </div>
            <span class="cart-price cart-column">${price}</span>
            <div class="cart-quantity cart-column">
                <input class="cart-quantity-input" type="number" value="1">
                <button class="btn btn-danger" type="button">REMOVE</button>
            </div>
        </div>
        `
        cartRow.innerHTML = cartRowContents
    cartItems.append(cartRow)
    cartRow.getElementsByClassName('btn-danger')[0].addEventListener('click', removeCartItem)
    cartRow.getElementsByClassName('cart-quantity-input')[0].addEventListener('change', quantityChanger)
    updateCartTotal()
}

function removeCartItem(event){
    var buttonClicked = event.target
    buttonClicked.parentElement.parentElement.remove()
    updateCartTotal()

}

function quantityChanger(event){

    var input = event.target 
    if (isNaN(input.value)|| input.value <= 0){
   input.value= 1
    }
    updateCartTotal()
}

function updateCartTotal(){

    var cartItemContainer = document.getElementsByClassName('cart-items')[0]
    var cartRows = cartItemContainer.getElementsByClassName('cart-row')
    var total = 0
    for(var i = 0; i < cartRows.length; i++ ){

        var cartRow = cartRows[i]
        var priceElement = cartRow.getElementsByClassName('cart-price')[0]
        var quantityElement = cartRow.getElementsByClassName('cart-quantity-input')[0]
        var price = parseFloat(priceElement.innerText.replace('$', ''))
        var quantity = quantityElement.value


        
        total = total + (price * quantity)
        total = Math.round(total*100)/100
    }
    document.getElementsByClassName('cart-total-price') [0].innerText ='$' + total
}