// variables
const cartBtn = document.querySelector(".bag-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");



// main cart
let cart = [];
// buttons
let buttonsDOM = [];

// getting the products
class Products{
    async getProducts() {
        try {
            let result = await fetch("products.json");//kunin yung data
            let data =  await result.json();//hintayin na makuha data bago iexecute
            let products = data.items;//data na nakuha sa json products at yung mga items dun
            products = products.map(item => {//isa-isahin kunin yung data
                const {title,price} = item.fields;
                const {id} = item.sys;
                const image = item.fields.image.fields.file.url;
                return {title,price,id,image}
            })
            return products // pag nafetch na, ipapakita na ito.
        } catch (error) {
            console.log(error);//pag may nakitang error habang finefetch data, ila-log yung error na yun. 
        }
    }
}
// display products
class UI {
    displayProducts(products){
        let result = '';
        products.forEach(product => {
            result += `<!-- single product -->
            <article class="product">
                <div class="img-container">
                    <img src=${product.image} alt="product" class="product-img">
                    <button class="cart-btn" data-id=${product.id}>
                        <i class="fas fa-shopping-cart"></i>
                        add to cart
                    </button>
                </div>
                <h3>${product.title}</h3>
                <h4>P${product.price}</h4>
            </article>
            <!-- end of single product -->`;
        });
        productsDOM.innerHTML = result; // yung mismomg structure ng product. may image, title, price
    }
    getCartButtons(){
        const buttons = [...document.querySelectorAll(".cart-btn")];
        buttonsDOM = buttons;
        buttons.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);// hanapin pag may same id yung item
            if (inCart) {
                button.innerText = "In Cart";// ang lalabas na ay In Cart at hindi Add to Cart
                button.disabled = true;//disabled yung add to cart kapag napili na yung item na may same id. 
            }
            button.addEventListener("click", event => {
                event.target.innerText = "In Cart";
                event.target.disabled = true;
                // get product from the products
                let cartItem = { ...Storage.getProduct(id), amount: 1 };//dinagdagan ng amount yung item
                
                // add product tot he cart
                cart = [...cart, cartItem];

                // save cart in local storage
                Storage.saveCart(cart);

                // set cart values
                this.setCartValues(cart);

                // display cart item
                this.addCartItem(cartItem);

                // show the cart
                this.showCart();
            });
        });
    }
    setCartValues(cart){
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;// kabuuang amount ng price = price multiply by amount ng item(150 yung price * 2 amount ng items)
            itemsTotal += item.amount; // kung ilan yung amount ng title ayun yung total ng items
        })
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));//2 decimals pag pinakita na sa innertext
        cartItems.innerText = itemsTotal;// malalagyan ng number yung cart
    }
    addCartItem(item){
        const div = document.createElement('div');
        // div.classList.add('cart-item');
        div.innerHTML = `<div class="cart-item">
        <img src=${item.image} alt="product">
        <div>
            <h4>${item.title}</h4>
            <h5>P${item.price}</h5>
            <span class="remove-item" data-id=${item.id}>remove</span>
        </div>
            <div>
                <i class="fas fa-chevron-up" data-id=${item.id}></i>
                <p class="item-amount">${item.amount}</p>
                <i class="fas fa-chevron-down" data-id=${item.id}></i>
            </div>
    </div>`// eto yung template kapag mag-add item ka sa cart
    cartContent.appendChild(div);//idudugtong yung cartContent sa div
    }
    showCart() {
        cartOverlay.classList.add("transparentBcg");
        cartDOM.classList.add("showCart");
    }
    setupAPP() {
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click', this.showCart);
        closeCartBtn.addEventListener('click', this.hideCart);
    }
    populateCart(cart){
        cart.forEach(item =>this.addCartItem(item));
    }// add list of items sa cart
    hideCart(){
        cartOverlay.classList.remove("transparentBcg");
        cartDOM.classList.remove("showCart");
    }
    cartLogic(){
        clearCartBtn.addEventListener('click', () => {
            this.clearCart();
        });

        //cart functionality
        cartContent.addEventListener('click', event => {
            if (event.target.classList.contains("remove-item")){
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement.parentElement);
                this.removeItem(id);
            } else if (event.target.classList.contains("fa-chevron-up")) {
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.id===id);
                tempItem.amount = tempItem.amount + 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;
            }
            else if (event.target.classList.contains("fa-chevron-down")){
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id===id);
                tempItem.amount = tempItem.amount - 1;
                if (tempItem.amount > 0) {
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    lowerAmount.previousElementSibling.innerText = tempItem.amount;//lowering amount not less than 1
                } else {
                    cartContent.removeChild(lowerAmount.parentElement.parentElement.parentElement);
                    this.removeItem(id)// remove item when it hit 0
                }
            }
        });
    }
    ////function for clearing the cart
    clearCart() {
        let cartItems = cart.map(item => item.id);//gumawa ng bagong array na ang pangalan ay cartItems, ang laman ng array na yun ay ang bawat item dun sa cart
        cartItems.forEach(id => this.removeItem(id));//tatanggalin ang bawat items dun sa cart
        // console.log(cartContent.children);

        while(cartContent.children.length>0){
            cartContent.removeChild(cartContent.children[0])
        }
        this.hideCart();
    } 
// function for removing the item
    removeItem(id){
        cart = cart.filter(item => item.id !==id);//hanapin lang yung item na mapy parehas na id dun sa cart
        this.setCartValues(cart);//yung value ng cart, maiiba din pag niremove
        Storage.saveCart(cart);//yung laman ng storage maiiba din
        let button = this.getSingleButton(id);// etong button na to ay yung laman ng getSingleButton
        button.disabled = false;//false na kasi remove na yung item so meaning pwede na add to cart na ulit sya
        button.innerHTML = `<i class="fas fa-shopping-cart">add to cart</i>`//maiiba na yung text from in cart to add to cart na kasi naremove na yung item sa cart
    }
    getSingleButton(id) {
        return buttonsDOM.find(button => button.dataset.id === id);//
    }//hnapin yung buttons na may same id dun sa array button.
}
// local storage
class Storage{
    static saveProducts (products) {
        localStorage.setItem("products", JSON.stringify(products));
    }
    static getProduct (id){
        let products = JSON.parse(localStorage.getItem("products"));
        return products.find(product => product.id === id)
    }
    static saveCart (cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
    }
    static getCart(){
        return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')):[]
    }
};

document.addEventListener("DOMContentLoaded", ()=>{
    const ui = new UI();
    const products = new Products();
    ui.setupAPP();
    //This code is setting up an event listener for the DOMContentLoaded event. The DOMContentLoaded event is fired when the initial HTML document has been completely loaded and parsed, without waiting for stylesheets, images, and subframes to finish loading.When the DOMContentLoaded event is fired, a callback function is executed. This callback function creates two new objects: an instance of the UI class and an instance of the Products class. It then calls the setupAPP() method on the ui object.

// get all products
products.getProducts().then(products => {
    ui.displayProducts(products)
    Storage.saveProducts(products);
    }).then(()=>{
        ui.getCartButtons();
        ui.cartLogic();
    });
});
