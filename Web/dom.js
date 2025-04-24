// Funciones principales
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar todas las características
    initNavMenu();
    initShoppingCart();
    initReadMoreButtons();
    initFilters();
    initCheckoutPage();
    initAccordions();
    initLoadMore();
});

// Menú de navegación responsive
function initNavMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (!menuToggle || !navMenu) return;
    
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Cerrar al hacer clic en enlaces o fuera del menú
    document.querySelectorAll('.header__nav-link').forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
    
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
}

// Acordeones (FAQ)
function initAccordions() {
    document.querySelectorAll('.faq__question').forEach(item => {
        item.addEventListener('click', () => {
            const parent = item.parentElement;
            parent.classList.toggle('active');
            
            Array.from(parent.parentNode.children)
                .filter(child => child !== parent)
                .forEach(sibling => sibling.classList.remove('active'));
        });
    });
}

// Carrito de compra
function initShoppingCart() {
    const cartButtons = document.querySelectorAll('.Shop__Button');
    const cartIcon = document.querySelector('.header__carrito');
    const cartContainer = document.querySelector('.header__hidden');
    const cartCount = document.getElementById('cartCount');
    const emptyCartMessage = document.getElementById('carritoVacio');
    
    if (!cartButtons.length || !cartCount) return;
    
    // Estado del carrito
    let cartItems = JSON.parse(localStorage.getItem('cartItems') || '{}');
    updateCartCount();
    
    // Mostrar/ocultar carrito
    if (cartIcon && cartContainer) {
        cartIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            cartContainer.classList.toggle('active');
        });
        
        document.addEventListener('click', (e) => {
            if (!cartContainer.contains(e.target) && e.target !== cartIcon) {
                cartContainer.classList.remove('active');
            }
        });
    }
    
    // Añadir producto al carrito
    cartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const product = button.closest('.Shop__product');
            const productName = product.querySelector('.Shop__Name').textContent;
            const productPrice = product.querySelector('.Shop__Price').textContent;
            const productImage = product.querySelector('.Shop__Image')?.src || 'Imagenes/Logonegro.png';
            
            // Añadir o incrementar
            if (cartItems[productName]) {
                cartItems[productName].quantity++;
            } else {
                cartItems[productName] = {
                    price: productPrice,
                    quantity: 1,
                    image: productImage
                };
            }
            
            // Actualizar UI
            updateCartUI(productName);
            saveCart();
            showNotification(`${productName} añadido al carrito`);
        });
    });
    
    // Inicializar productos guardados
    renderCartItems();
    
    // Funciones auxiliares
    function updateCartCount() {
        let count = 0;
        for (const item in cartItems) {
            count += cartItems[item].quantity;
        }
        cartCount.textContent = count;
        return count;
    }
    
    function updateCartUI(productName) {
        if (!cartContainer) return;
        
        // Ocultar mensaje de carrito vacío
        if (emptyCartMessage) {
            emptyCartMessage.style.display = 'none';
        }
        
        // Actualizar o crear elemento en el carrito
        let productEl = Array.from(cartContainer.querySelectorAll('.header__product'))
            .find(el => el.querySelector('.header__Name').textContent === productName);
        
        const item = cartItems[productName];
        const price = parseFloat(item.price.replace('€', '').trim());
        
        if (productEl) {
            // Actualizar elemento existente
            productEl.querySelector('.header__quantity').textContent = item.quantity;
            productEl.querySelector('.header__Price').textContent = `${(price * item.quantity).toFixed(2)}€`;
        } else {
            // Crear nuevo elemento
            productEl = document.createElement('div');
            productEl.className = 'header__product';
            productEl.innerHTML = `
                <img src="${item.image}" alt="${productName}" class="header__product-image">
                <div class="header__info">
                    <div class="header__product-row">
                        <span class="header__quantity">${item.quantity}</span>
                        <p class="header__Name">${productName}</p>
                    </div>
                    <p class="header__Price">${(price * item.quantity).toFixed(2)}€</p>
                </div>
                <div class="header__buttons">
                    <button class="header__decrease">-</button>
                    <img src="Imagenes/X.png" alt="X" class="header__close">
                </div>
            `;
            
            // Añadir evento para disminuir cantidad
            productEl.querySelector('.header__decrease').addEventListener('click', (e) => {
                e.stopPropagation();
                removeItem(productName, false);
            });
            
            // Añadir evento para eliminar producto
            productEl.querySelector('.header__close').addEventListener('click', (e) => {
                e.stopPropagation();
                removeItem(productName, true);
            });
            
            cartContainer.appendChild(productEl);
        }
        
        updateCartCount();
        updateTotalUI();
    }
    
    function removeItem(productName, removeAll) {
        if (!cartItems[productName]) return;
        
        if (removeAll || cartItems[productName].quantity <= 1) {
            delete cartItems[productName];
            
            // Eliminar del DOM
            const productEl = Array.from(cartContainer.querySelectorAll('.header__product'))
                .find(el => el.querySelector('.header__Name').textContent === productName);
            
            if (productEl) {
                productEl.remove();
            }
        } else {
            cartItems[productName].quantity--;
            
            // Actualizar cantidad en el DOM
            const productEl = Array.from(cartContainer.querySelectorAll('.header__product'))
                .find(el => el.querySelector('.header__Name').textContent === productName);
            
            if (productEl) {
                const quantityEl = productEl.querySelector('.header__quantity');
                const priceEl = productEl.querySelector('.header__Price');
                const price = parseFloat(cartItems[productName].price.replace('€', '').trim());
                
                quantityEl.textContent = cartItems[productName].quantity;
                priceEl.textContent = `${(price * cartItems[productName].quantity).toFixed(2)}€`;
            }
        }
        
        saveCart();
        updateCartCount();
        updateTotalUI();
        
        // Mostrar mensaje de carrito vacío si corresponde
        if (Object.keys(cartItems).length === 0 && emptyCartMessage) {
            emptyCartMessage.style.display = 'block';
        }
    }
    
    function renderCartItems() {
        if (!cartContainer) return;
        if (Object.keys(cartItems).length === 0) {
            if (emptyCartMessage) emptyCartMessage.style.display = 'block';
            return;
        }
        
        if (emptyCartMessage) emptyCartMessage.style.display = 'none';
        
        // Renderizar cada producto
        for (const productName in cartItems) {
            updateCartUI(productName);
        }
    }
    
    function updateTotalUI() {
        let totalElement = document.getElementById('cartTotal');
        let totalContainer = document.querySelector('.header__total-container');
        
        // Calcular total
        let total = 0;
        for (const productName in cartItems) {
            const item = cartItems[productName];
            const price = parseFloat(item.price.replace('€', '').trim());
            total += price * item.quantity;
        }
        
        // Crear elementos si no existen
        if (!totalElement) {
            totalElement = document.createElement('div');
            totalElement.id = 'cartTotal';
            totalElement.className = 'header__total';
            
            const checkoutBtn = document.createElement('button');
            checkoutBtn.className = 'header__checkout-btn';
            checkoutBtn.textContent = 'Confirmar Compra';
            checkoutBtn.addEventListener('click', () => {
                window.location.href = 'confirmar-compra.html';
            });
            
            totalContainer = document.createElement('div');
            totalContainer.className = 'header__total-container';
            totalContainer.appendChild(totalElement);
            totalContainer.appendChild(checkoutBtn);
            
            cartContainer.appendChild(totalContainer);
        }
        
        totalElement.textContent = `Total: ${total.toFixed(2)}€`;
        
        // Mostrar/ocultar según haya productos
        if (Object.keys(cartItems).length > 0 && totalContainer) {
            totalContainer.style.display = 'flex';
        } else if (totalContainer) {
            totalContainer.style.display = 'none';
        }
    }
    
    function saveCart() {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }
    
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => document.body.removeChild(notification), 300);
            }, 2000);
        }, 10);
    }
}

// Página de confirmación de compra
function initCheckoutPage() {
    if (!document.querySelector('.checkout')) return;
    
    const metodoPago = document.querySelectorAll('input[name="metodo-pago"]');
    const detallesTarjeta = document.getElementById('detallesTarjeta');
    const checkoutItems = document.getElementById('checkout-items');
    const checkoutEmpty = document.getElementById('checkoutEmpty');
    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('total');
    const shippingEl = document.getElementById('shipping');
    const discountRow = document.getElementById('discount-row');
    const discountEl = document.getElementById('discount');
    const checkoutForm = document.getElementById('checkoutForm');
    const aplicarDescuentoBtn = document.getElementById('aplicarDescuento');
    const descuentoInput = document.getElementById('descuento');
    
    // Gestionar método de pago
    metodoPago.forEach(metodo => {
        metodo.addEventListener('change', function() {
            const isTarjeta = this.value === 'tarjeta';
            detallesTarjeta.style.display = isTarjeta ? 'block' : 'none';
            
            // Gestionar campos requeridos
            document.querySelectorAll('#detallesTarjeta input').forEach(input => {
                input.required = isTarjeta;
            });
        });
    });
    
    // Cargar productos
    loadCheckoutItems();
    
    // Aplicar código de descuento
    if (aplicarDescuentoBtn && descuentoInput) {
        aplicarDescuentoBtn.addEventListener('click', () => {
            const codigo = descuentoInput.value.trim().toUpperCase();
            
            // Aplicar diferentes tipos de descuento
            if (codigo === 'DESCUENTO10' || codigo === 'DESCUENTO20') {
                const porcentaje = codigo === 'DESCUENTO10' ? 0.1 : 0.2;
                const subtotal = parseFloat(subtotalEl.textContent);
                const descuento = subtotal * porcentaje;
                
                discountRow.style.display = 'flex';
                discountEl.textContent = `${descuento.toFixed(2)}€`;
                
                // Actualizar total
                const shipping = parseFloat(shippingEl.textContent);
                totalEl.textContent = `${(subtotal + shipping - descuento).toFixed(2)}€`;
                
                alert(`¡Descuento del ${porcentaje * 100}% aplicado!`);
            } else if (codigo === 'ENVIOGRATIS') {
                shippingEl.textContent = '0.00€';
                
                // Actualizar total
                const subtotal = parseFloat(subtotalEl.textContent);
                const descuento = discountRow.style.display !== 'none' ? 
                    parseFloat(discountEl.textContent) : 0;
                    
                totalEl.textContent = `${(subtotal - descuento).toFixed(2)}€`;
                
                alert('¡Envío gratuito aplicado!');
            } else if (codigo) {
                alert('Código de descuento no válido');
            }
        });
    }
    
    // Procesar formulario
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Verificar carrito
            const cartItems = JSON.parse(localStorage.getItem('cartItems') || '{}');
            if (Object.keys(cartItems).length === 0) {
                alert('No hay productos en tu carrito');
                return;
            }
            
            // Validar campos básicos
            const campos = ['nombre', 'apellido', 'email', 'telefono', 'direccion', 
                           'ciudad', 'codigo-postal', 'pais'];
            
            for (const campo of campos) {
                const input = document.getElementById(campo);
                if (!input || !input.value.trim()) {
                    alert('Por favor, completa todos los campos obligatorios');
                    return;
                }
            }
            
            // Validar email
            const email = document.getElementById('email').value.trim();
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                alert('Por favor, introduce un email válido');
                return;
            }
            
            // Validar tarjeta si es necesario
            const metodoPagoSeleccionado = document.querySelector('input[name="metodo-pago"]:checked');
            if (metodoPagoSeleccionado && metodoPagoSeleccionado.value === 'tarjeta') {
                const camposTarjeta = ['numero-tarjeta', 'fecha-expiracion', 'cvv'];
                for (const campo of camposTarjeta) {
                    const input = document.getElementById(campo);
                    if (!input || !input.value.trim()) {
                        alert('Por favor, completa todos los campos de la tarjeta');
                        return;
                    }
                }
            }
            
            // Procesar pago
            alert('¡Gracias por tu compra! Tu pedido ha sido procesado correctamente.');
            localStorage.removeItem('cartItems');
            window.location.href = 'index.html';
        });
    }
    
    // Cargar items del carrito en la página de checkout
    function loadCheckoutItems() {
        const cartItems = JSON.parse(localStorage.getItem('cartItems') || '{}');
        let subtotal = 0;
        const shippingCost = 4.95;
        
        // Gestionar carrito vacío
        if (Object.keys(cartItems).length === 0) {
            if (checkoutEmpty) checkoutEmpty.style.display = 'block';
            if (subtotalEl) subtotalEl.textContent = '0.00€';
            if (shippingEl) shippingEl.textContent = `${shippingCost.toFixed(2)}€`;
            if (totalEl) totalEl.textContent = `${shippingCost.toFixed(2)}€`;
            return;
        }
        
        // Ocultar mensaje de carrito vacío
        if (checkoutEmpty) checkoutEmpty.style.display = 'none';
        
        // Limpiar contenedor
        Array.from(checkoutItems.children).forEach(child => {
            if (!child.classList.contains('checkout__empty-cart')) {
                checkoutItems.removeChild(child);
            }
        });
        
        // Añadir productos
        for (const productName in cartItems) {
            const item = cartItems[productName];
            const price = parseFloat(item.price.replace('€', '').trim());
            const totalPrice = price * item.quantity;
            subtotal += totalPrice;
            
            const productEl = document.createElement('div');
            productEl.className = 'checkout__product';
            productEl.innerHTML = `
                <img src="${item.image || 'Imagenes/Logonegro.png'}" alt="${productName}" class="checkout__product-image">
                <div class="checkout__product-info">
                    <h3 class="checkout__product-name">${productName}</h3>
                    <p class="checkout__product-details">Cantidad: ${item.quantity}</p>
                    <span class="checkout__product-price">${totalPrice.toFixed(2)}€</span>
                </div>
            `;
            
            checkoutItems.appendChild(productEl);
        }
        
        // Actualizar totales
        if (subtotalEl) subtotalEl.textContent = `${subtotal.toFixed(2)}€`;
        if (shippingEl) shippingEl.textContent = `${shippingCost.toFixed(2)}€`;
        if (discountRow) discountRow.style.display = 'none';
        if (totalEl) totalEl.textContent = `${(subtotal + shippingCost).toFixed(2)}€`;
    }
}

// Filtros de productos
function initFilters() {
    const filterBtn = document.querySelector('.Shop__filter-button');
    const resetBtn = document.querySelector('.Shop__filter-reset');
    const priceRange = document.getElementById('priceRange');
    const priceValue = document.getElementById('priceValue');
    const categoryCheckboxes = document.querySelectorAll('input[name="category"]');
    const products = document.querySelectorAll('.Shop__product');
    
    if (!filterBtn || !products.length) return;
    
    // Mostrar valor del slider
    if (priceRange && priceValue) {
        priceRange.addEventListener('input', function() {
            priceValue.textContent = `${this.value}€`;
        });
    }
    
    // Aplicar filtros
    if (filterBtn) {
        filterBtn.addEventListener('click', () => {
            // Obtener categorías seleccionadas
            const selectedCategories = Array.from(categoryCheckboxes)
                .filter(checkbox => checkbox.checked)
                .map(checkbox => checkbox.value);
            
            // Obtener precio máximo
            const maxPrice = priceRange ? parseInt(priceRange.value) : 100;
            
            // Filtrar productos
            products.forEach(product => {
                const productName = product.querySelector('.Shop__Name').textContent.toLowerCase();
                const productPrice = parseInt(product.querySelector('.Shop__Price').textContent.replace('€', '').trim());
                
                // Determinar categoría
                let productCategory = '';
                if (productName.includes('camiseta')) productCategory = 'camisetas';
                else if (productName.includes('sudadera')) productCategory = 'sudaderas';
                else if (productName.includes('chaqueta')) productCategory = 'chaquetas';
                else if (productName.includes('top')) productCategory = 'tops';
                
                // Aplicar filtros
                const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(productCategory);
                const matchesPrice = productPrice <= maxPrice;
                
                product.style.display = (matchesCategory && matchesPrice) ? 'flex' : 'none';
            });
        });
    }
    
    // Resetear filtros
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            categoryCheckboxes.forEach(checkbox => checkbox.checked = false);
            
            if (priceRange) {
                priceRange.value = 100;
                if (priceValue) priceValue.textContent = '100€';
            }
            
            products.forEach(product => product.style.display = 'flex');
        });
    }
}

// Funcionalidad "Ver más"
function initLoadMore() {
    const moreBtn = document.querySelector('.Shop__Button--more');
    if (!moreBtn) return;
    
    moreBtn.addEventListener('click', () => {
        const hiddenProducts = document.querySelectorAll('.Shop__product--hidden');
        
        if (hiddenProducts.length > 0) {
            // Mostrar productos ocultos
            hiddenProducts.forEach(product => {
                product.classList.remove('Shop__product--hidden');
                product.classList.add('Shop__product');
            });
            moreBtn.textContent = 'Ver menos';
        } else {
            // Ocultar productos
            const productsToHide = document.querySelectorAll('.Shop__product[id="hidden"]');
            productsToHide.forEach(product => {
                product.classList.remove('Shop__product');
                product.classList.add('Shop__product--hidden');
            });
            moreBtn.textContent = 'Ver más';
        }
    });
    
    // Cargar más noticias/posts
    const loadMoreNewsBtn = document.getElementById('loadMoreNews');
    const loadMorePostsBtn = document.getElementById('loadMorePosts');
    
    if (loadMoreNewsBtn) {
        loadMoreNewsBtn.addEventListener('click', function() {
            this.textContent = 'CARGANDO...';
            setTimeout(() => {
                this.textContent = 'CARGAR MÁS NOTICIAS';
                this.style.display = 'none';
            }, 1000);
        });
    }
    
    if (loadMorePostsBtn) {
        loadMorePostsBtn.addEventListener('click', function() {
            this.textContent = 'CARGANDO...';
            setTimeout(() => {
                this.textContent = 'VER MÁS ARTÍCULOS';
                this.style.display = 'none';
            }, 1000);
        });
    }
}

// Botones de leer más
function initReadMoreButtons() {
    // Noticias
    document.querySelectorAll('.news__card-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const card = this.closest('.news__card-content');
            const fullText = card.querySelector('.news__card-full-text');
            
            if (fullText) {
                fullText.classList.toggle('hidden');
                this.textContent = fullText.classList.contains('hidden') ? 'Leer más' : 'Leer menos';
            }
        });
    });
    
    // Noticia destacada
    const featuredReadMore = document.querySelector('.news__readmore');
    if (featuredReadMore) {
        featuredReadMore.addEventListener('click', function(e) {
            e.preventDefault();
            const content = this.closest('.news__featured-content');
            const fullText = content.querySelector('.news__full-text');
            
            if (!fullText) {
                const fullTextDiv = document.createElement('div');
                fullTextDiv.className = 'news__full-text';
                fullTextDiv.innerHTML = '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquet nisl, nec aliquet nisl nisl sit amet nisl. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquet nisl, nec aliquet nisl nisl sit amet nisl.</p>';
                content.querySelector('.news__excerpt').after(fullTextDiv);
                this.textContent = 'Leer menos';
            } else {
                fullText.classList.toggle('hidden');
                this.textContent = fullText.classList.contains('hidden') ? 'Leer más' : 'Leer menos';
            }
        });
    }
    
    // Blog
    document.querySelectorAll('.blog__read-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const article = this.closest('.blog__article-content');
            const fullText = article.querySelector('.blog__article-full-text');
            
            if (fullText) {
                fullText.classList.toggle('hidden');
                this.textContent = fullText.classList.contains('hidden') ? 
                    'Leer artículo completo' : 'Mostrar menos';
            }
        });
    });
}