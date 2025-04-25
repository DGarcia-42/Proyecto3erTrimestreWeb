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
    if (moreBtn) {
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
    }
    
    // Cargar más noticias
    const loadMoreNewsBtn = document.getElementById('loadMoreNews');
    if (loadMoreNewsBtn) {
        let clicked = false;
        loadMoreNewsBtn.addEventListener('click', function() {
            if (clicked) return;
            clicked = true;
            
            this.textContent = 'CARGANDO...';
            setTimeout(() => {
                // Crear nuevas noticias
                const newsGrid = document.querySelector('.news__grid');
                
                if (newsGrid) {
                    // Añadir nuevas noticias
                    const newsItems = [
                        {
                            image: 'Imagenes/Noticia6.png',
                            date: '15 de Junio, 2023',
                            title: 'Nueva colección sostenible',
                            excerpt: 'Lanzamos nuestra primera línea de ropa fabricada con materiales 100% reciclados.',
                            fullText: '<p>Nos enorgullece presentar nuestra nueva colección "Eco Spicy", elaborada íntegramente con materiales reciclados y procesos sostenibles. Cada prenda está confeccionada con tejidos provenientes de botellas de plástico recicladas y algodón orgánico.<br><br>Esta colección representa nuestro compromiso con el medio ambiente y marca el inicio de una nueva era en Spicy Gallery. Además de su enfoque sostenible, la colección mantiene nuestro distintivo estilo urbano y la calidad que nos caracteriza.<br><br>La colección incluye sudaderas, camisetas y accesorios, todos diseñados pensando en la durabilidad y el menor impacto ambiental posible.</p>'
                        },
                        {
                            image: 'Imagenes/Noticia7.png',
                            date: '5 de Junio, 2023',
                            title: 'Festival de Moda Urbana',
                            excerpt: 'Spicy Gallery organizará el primer festival de moda urbana en Barcelona.',
                            fullText: '<p>Este verano, Barcelona será el epicentro de la moda urbana con el primer Spicy Urban Festival. Un evento que combinará moda, música, arte urbano y cultura streetwear.<br><br>Durante tres días, el recinto del Fórum acogerá desfiles, exposiciones de artistas emergentes, conciertos de hip-hop y trap, y pop-up stores de marcas independientes. Spicy Gallery presentará en exclusiva su colección de otoño durante el evento.<br><br>Las entradas estarán disponibles a partir del 1 de julio, con descuentos especiales para los miembros de nuestra comunidad. ¡No te pierdas el evento del año!</p>'
                        }
                    ];
                    
                    newsItems.forEach(item => {
                        const newsCard = document.createElement('article');
                        newsCard.className = 'news__card';
                        
                        newsCard.innerHTML = `
                            <div class="news__card-image">
                                <img src="${item.image}" alt="${item.title}" class="news__image">
                            </div>
                            <div class="news__card-content">
                                <span class="news__date">${item.date}</span>
                                <h3 class="news__card-title">${item.title}</h3>
                                <p class="news__card-excerpt">${item.excerpt}</p>
                                <a href="#" class="news__card-link">Leer más</a>
                                <div class="news__card-full-text hidden">
                                    ${item.fullText}
                                </div>
                            </div>
                        `;
                        
                        newsGrid.appendChild(newsCard);
                    });
                    
                    // Inicializar botones de leer más para los nuevos elementos
                    const newLinks = newsGrid.querySelectorAll('.news__card-link:not([data-initialized])');
                    newLinks.forEach(link => {
                        link.setAttribute('data-initialized', 'true');
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
                    
                    this.textContent = 'NO HAY MÁS NOTICIAS';
                    this.disabled = true;
                }
            }, 1000);
        });
    }
    
    // Cargar más artículos del blog
    const loadMorePostsBtn = document.getElementById('loadMorePosts');
    if (loadMorePostsBtn) {
        let clicked = false;
        loadMorePostsBtn.addEventListener('click', function() {
            if (clicked) return;
            clicked = true;
            
            this.textContent = 'CARGANDO...';
            setTimeout(() => {
                // Crear nuevos artículos de blog
                const blogContent = document.querySelector('.blog__content');
                
                if (blogContent) {
                    // Añadir nuevos artículos
                    const blogItems = [
                        {
                            image: 'Imagenes/Blog4.png',
                            tag: 'Tendencias',
                            title: 'Los colores que dominarán la próxima temporada',
                            excerpt: 'Descubre cuáles serán los tonos más importantes y cómo incorporarlos a tu guardarropa streetwear.',
                            date: '15 de Abril, 2023',
                            author: 'Por: Ana Martínez',
                            fullText: '<p><strong>La paleta del futuro</strong><br>La próxima temporada viene cargada de contrastes y matices inesperados. Los tonos neón se mezclan con colores tierra, creando una paleta que refleja tanto la energía urbana como la conexión con lo natural.<br><br><strong>Tendencias cromáticas principales</strong><br>1. <u>Verde Digital:</u> Un tono vibrante que representa la fusión entre tecnología y naturaleza.<br><br>2. <u>Naranja Sunset:</u> Un color cálido que evoca los atardeceres urbanos y aporta energía a cualquier look.<br><br>3. <u>Azul Cyber:</u> Un tono eléctrico que representa la era digital.<br><br>4. <u>Beige Tech:</u> Un neutro modernizado que sirve como base perfecta.<br><br><strong>Cómo combinar los nuevos tonos</strong><br>- Contrasta el Verde Digital con negro para un look futurista<br>- Mezcla el Naranja Sunset con tonos grises para equilibrar su intensidad<br>- Usa el Azul Cyber como acento en looks monocromáticos<br>- El Beige Tech funciona como base versátil<br><br>La clave está en experimentar con estos colores mientras mantienes tu estilo personal. No temas a las combinaciones audaces - el streetwear trata de romper reglas y establecer nuevas tendencias.</p>'
                        },
                        {
                            image: 'Imagenes/Blog5.png',
                            tag: 'Cultura',
                            title: 'El arte urbano y su influencia en la moda actual',
                            excerpt: 'Exploramos cómo el grafiti y el arte callejero están modelando las últimas tendencias en diseño de ropa.',
                            date: '8 de Abril, 2023',
                            author: 'Por: Carlos Ruiz',
                            fullText: '<p><strong>Del muro a la pasarela</strong><br>El arte urbano ha evolucionado desde sus orígenes subversivos hasta convertirse en una fuerza creativa que influye directamente en el diseño de moda contemporáneo. Los elementos gráficos, las técnicas de color y la actitud rebelde del grafiti se traducen ahora en prendas que son verdaderas obras de arte portátiles.<br><br><strong>Elementos clave del arte urbano en la moda</strong><br>1. <u>Tipografías:</u> Los estilos de letra del grafiti inspiran estampados y logos.<br><br>2. <u>Técnicas de color:</u> Los degradados y superposiciones característicos del arte urbano se replican en tejidos.<br><br>3. <u>Simbolismo:</u> Iconografía urbana que transmite mensajes de resistencia y autenticidad.<br><br>4. <u>Texturas:</u> Efectos que emulan las superficies del arte callejero.<br><br><strong>La fusión perfecta</strong><br>El arte urbano no solo influye en la estética de la ropa, sino que también aporta una dimensión cultural y narrativa al streetwear. Cada prenda se convierte en un lienzo que cuenta una historia y representa una forma de vida.<br><br>En Spicy Gallery, celebramos esta fusión entre arte y moda, creando piezas que son tanto expresión artística como declaración de estilo.</p>'
                        }
                    ];
                    blogItems.forEach(item => {
                        const blogArticle = document.createElement('article');
                        blogArticle.className = 'blog__article';
                        
                        blogArticle.innerHTML = `
                            <div class="blog__article-image">
                                <img src="${item.image}" alt="${item.title}" class="blog__img">
                            </div>
                            <div class="blog__article-content">
                                <span class="blog__tag">${item.tag}</span>
                                <h3 class="blog__article-title">${item.title}</h3>
                                <p class="blog__article-excerpt">${item.excerpt}</p>
                                <div class="blog__meta">
                                    <span class="blog__date">${item.date}</span>
                                    <span class="blog__author">${item.author}</span>
                                </div>
                                <a href="#" class="blog__read-link">Leer artículo completo</a>
                                <div class="blog__article-full-text hidden">
                                    ${item.fullText}
                                </div>
                            </div>
                        `;
                        
                        blogContent.appendChild(blogArticle);
                    });
                    
                    // Inicializar botones de leer más para los nuevos elementos
                    const newLinks = blogContent.querySelectorAll('.blog__read-link:not([data-initialized])');
                    newLinks.forEach(link => {
                        link.setAttribute('data-initialized', 'true');
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
                    
                    this.textContent = 'NO HAY MÁS ARTÍCULOS';
                    this.disabled = true;
                }
            }, 1000);
        });
    }
}

// Botones de leer más
function initReadMoreButtons() {
    // Noticias
    document.querySelectorAll('.news__card-link:not([data-initialized])').forEach(link => {
        link.setAttribute('data-initialized', 'true');
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
    const featuredReadMore = document.querySelector('.news__readmore:not([data-initialized])');
    if (featuredReadMore) {
        featuredReadMore.setAttribute('data-initialized', 'true');
        featuredReadMore.addEventListener('click', function(e) {
            e.preventDefault();
            const content = this.closest('.news__featured-content');
            const fullText = content.querySelector('.news__full-text');
            
            if (!fullText) {
                const fullTextDiv = document.createElement('div');
                fullTextDiv.className = 'news__full-text';
                fullTextDiv.innerHTML = '<p>Nueva colección Spicy Urban es el resultado de años de investigación sobre tendencias urbanas globales. Nuestro equipo de diseño ha viajado por ciudades como Tokio, Berlín, Nueva York y Ciudad de México para capturar la esencia del streetwear contemporáneo y transformarla en piezas que son tanto funcionales como vanguardistas.<br><br>La colección incluye 35 piezas unisex, desde sudaderas y camisetas hasta accesorios y calzado, todas con el distintivo toque irreverente de Spicy Gallery. Los materiales son premium, con un enfoque en la durabilidad y el confort, dos valores esenciales para la vida urbana.<br><br>Además del lanzamiento online, organizaremos pop-ups en varias ciudades durante el verano, donde los visitantes podrán experimentar la colección completa con instalaciones inmersivas y eventos exclusivos.</p>';
                content.querySelector('.news__excerpt').after(fullTextDiv);
                this.textContent = 'Leer menos';
            } else {
                fullText.classList.toggle('hidden');
                this.textContent = fullText.classList.contains('hidden') ? 'Leer más' : 'Leer menos';
            }
        });
    }
    
    // Blog
    document.querySelectorAll('.blog__read-link:not([data-initialized])').forEach(link => {
        link.setAttribute('data-initialized', 'true');
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