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
    initLanguageSwitch();
    initMemoryGame(); // Inicializar juego de pares
    
    // Inicializar el tema y el icono correspondiente
    initTheme();
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
            
            // Obtener el código de descuento ganado en el juego de pares
            const codigoJuego = localStorage.getItem('spicyDescuento');
            
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
                
            } else if (codigo === 'ENVIOGRATIS') {
                shippingEl.textContent = '0.00€';
                
                // Actualizar total
                const subtotal = parseFloat(subtotalEl.textContent);
                const descuento = discountRow.style.display !== 'none' ? 
                    parseFloat(discountEl.textContent) : 0;
                    
                totalEl.textContent = `${(subtotal - descuento).toFixed(2)}€`;
                
            } else if (codigoJuego && codigo === codigoJuego) {
                // Aplicar descuento del 50% (código ganado en el juego)
                const subtotal = parseFloat(subtotalEl.textContent);
                const descuento = subtotal * 0.5; // 50% de descuento
                
                discountRow.style.display = 'flex';
                discountEl.textContent = `${descuento.toFixed(2)}€`;
                
                // Actualizar total
                const shipping = parseFloat(shippingEl.textContent);
                totalEl.textContent = `${(subtotal + shipping - descuento).toFixed(2)}€`;
                
                // Marcar el código como usado (opcional)
                localStorage.removeItem('spicyDescuento');
                
            } else if (codigo) {
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
                    <p class="checkout__product-details"><span class="quantity-label">Cantidad:</span> ${item.quantity}</p>
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
                // Usar traducción según el idioma
                const lang = localStorage.getItem('language') || 'es';
                moreBtn.textContent = lang === 'en' ? 'View less' : 'Ver menos';
            } else {
                // Ocultar productos
                const productsToHide = document.querySelectorAll('.Shop__product[id="hidden"]');
                productsToHide.forEach(product => {
                    product.classList.remove('Shop__product');
                    product.classList.add('Shop__product--hidden');
                });
                // Usar traducción según el idioma
                const lang = localStorage.getItem('language') || 'es';
                moreBtn.textContent = lang === 'en' ? 'View more' : 'Ver más';
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
                                const lang = localStorage.getItem('language') || 'es';
                                this.textContent = fullText.classList.contains('hidden') ? 
                                    (lang === 'en' ? 'Read more' : 'Leer más') : 
                                    (lang === 'en' ? 'Read less' : 'Leer menos');
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
                                const lang = localStorage.getItem('language') || 'es';
                                this.textContent = fullText.classList.contains('hidden') ? 
                                    (lang === 'en' ? 'Read full article' : 'Leer artículo completo') : 
                                    (lang === 'en' ? 'Show less' : 'Mostrar menos');
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
                const lang = localStorage.getItem('language') || 'es';
                this.textContent = fullText.classList.contains('hidden') ? 
                    (lang === 'en' ? 'Read more' : 'Leer más') : 
                    (lang === 'en' ? 'Read less' : 'Leer menos');
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
                // Si no existe el div de texto completo, lo creamos
                const fullTextDiv = document.createElement('div');
                fullTextDiv.className = 'news__full-text hidden';
                fullTextDiv.innerHTML = `<p>La colección Spicy Urban representa nuestra visión más audaz hasta la fecha. Inspirada en la vida urbana y la arquitectura contemporánea, cada pieza combina funcionalidad con detalles de alta costura.<br><br>
                    Los tejidos premium, siluetas exageradas y detalles artesanales definen esta colección que difumina la línea entre streetwear y lujo. Hemos colaborado con diseñadores emergentes y utilizado técnicas innovadoras de confección para crear prendas que son tanto una declaración de estilo como piezas funcionales para el día a día.<br><br>
                    La colección incluye desde camisetas oversize con estampados exclusivos hasta chaquetas estructuradas con detalles metálicos, pasando por pantalones cargo reinventados y accesorios que complementan el look urbano-contemporáneo.<br><br>
                    Descubre todas las piezas en nuestra tienda online o visita los puntos de venta seleccionados para experimentar la calidad y el diseño de cerca.</p>`;
                
                content.querySelector('.news__excerpt').after(fullTextDiv);
                setTimeout(() => fullTextDiv.classList.remove('hidden'), 10);
                this.textContent = 'Leer menos';
            } else {
                // Si ya existe el div, lo mostramos u ocultamos
                fullText.classList.toggle('hidden');
                const lang = localStorage.getItem('language') || 'es';
                this.textContent = fullText.classList.contains('hidden') ? 
                    (lang === 'en' ? 'Read more' : 'Leer más') : 
                    (lang === 'en' ? 'Read less' : 'Leer menos');
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
                const lang = localStorage.getItem('language') || 'es';
                this.textContent = fullText.classList.contains('hidden') ? 
                    (lang === 'en' ? 'Read full article' : 'Leer artículo completo') : 
                    (lang === 'en' ? 'Show less' : 'Mostrar menos');
            }
        });
    });
}

// Funciones para el modo oscuro
function toggleTheme() {
    const body = document.body;
    const themeToggleBtn = document.getElementById('theme-toggle');
    
    // Alternar la clase dark-mode en el body
    if (body.classList.contains('dark-mode')) {
        body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
        // Cambiar a logos negros
        switchLogos('light');
        // Cambiar a icono de luna (modo claro)
        if (themeToggleBtn) {
            themeToggleBtn.innerHTML = '🌙';
        }
    } else {
        body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
        // Cambiar a logos blancos
        switchLogos('dark');
        // Cambiar a icono de sol (modo oscuro)
        if (themeToggleBtn) {
            themeToggleBtn.innerHTML = '☀️';
        }
    }
}

// Función para cambiar los logos según el tema
function switchLogos(theme) {
    // Cambiar logo de cuernos y cola
    const headerBrand = document.querySelector('.header__brand');
    const footerLogo = document.querySelector('.footer__logo');
    
    // Cambiar logo principal
    const headerLogo = document.querySelector('.header__logo');
    
    if (headerBrand) {
        headerBrand.src = theme === 'dark' ? 'Imagenes/cuernosycolablancos.png' : 'Imagenes/cuernosycolanegros.png';
    }
    
    if (footerLogo) {
        footerLogo.src = theme === 'dark' ? 'Imagenes/cuernosycolablancos.png' : 'Imagenes/cuernosycolanegros.png';
    }
    
    if (headerLogo) {
        headerLogo.src = theme === 'dark' ? 'Imagenes/Logoblanco.png' : 'Imagenes/Logonegro.png';
    }
}

// Función para inicializar el tema y el icono
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const themeToggleBtn = document.getElementById('theme-toggle');
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        // Aplicar logos correspondientes al tema oscuro
        switchLogos('dark');
        // Establecer el icono de sol para el modo oscuro
        if (themeToggleBtn) {
            themeToggleBtn.innerHTML = '☀️';
        }
    } else {
        // Asegurar que se usen los logos del tema claro
        switchLogos('light');
        // Establecer el icono de luna para el modo claro
        if (themeToggleBtn) {
            themeToggleBtn.innerHTML = '🌙';
        }
    }
}

// Función para el cambio de idioma
function initLanguageSwitch() {
    const languageFlags = document.querySelectorAll('.header__language-flag');
    
    if (!languageFlags.length) return;
    
    // Cargar diccionarios
    const translations = {
        es: {
            // Navegación
            "INICIO": "INICIO",
            "TIENDA": "TIENDA",
            "SOBRE NOSOTROS": "SOBRE NOSOTROS",
            "NOTICIAS Y BLOG": "NOTICIAS Y BLOG",
            "ÚNETE A NOSOTROS": "ÚNETE A NOSOTROS",
            "JUEGO": "JUEGO",
            
            // Header y secciones principales
            "Dare to be Spicy": "Dare to be Spicy",
            "Spicy Gallery": "Spicy Gallery",
            
            // Secciones de inicio
            "Tienda": "Tienda",
            "Echa un vistazo a nuestros productos más vendidos": "Echa un vistazo a nuestros productos más vendidos",
            "Camiseta": "Camiseta",
            "Camiseta de algodón premium": "Camiseta de algodón premium",
            "Sudadera": "Sudadera",
            "Sudadera confortable de algodón": "Sudadera confortable de algodón",
            "Chaqueta": "Chaqueta",
            "Chaqueta premium edición limitada": "Chaqueta premium edición limitada",
            "Para ver todos nuestros productos, accede a nuestra tienda": "Para ver todos nuestros productos, accede a nuestra tienda",
            "Ir a la tienda": "Ir a la tienda",
            
            // Introducción
            "Spicy Gallery es mucho más que una tienda de ropa. Somos estilo de vida. Nuestra pasión por el estilo y la moda urbana nos impulsa a ofrecer piezas únicas para jóvenes de espíritu libre.": "Spicy Gallery es mucho más que una tienda de ropa. Somos estilo de vida. Nuestra pasión por el estilo y la moda urbana nos impulsa a ofrecer piezas únicas para jóvenes de espíritu libre.",
            "Spicy Gallery no es solo ropa; es para quienes se atreven a combinar cualquier estilo que les guste sin miedo a lo que digan o piensen los demás.": "Spicy Gallery no es solo ropa; es para quienes se atreven a combinar cualquier estilo que les guste sin miedo a lo que digan o piensen los demás.",
            "En un mundo donde todos quieren encajar, Spicy Gallery es una marca que busca romper con lo establecido, una marca diseñada para el mundo.": "En un mundo donde todos quieren encajar, Spicy Gallery es una marca que busca romper con lo establecido, una marca diseñada para el mundo.",
            
            // Sobre nosotros
            "Sobre Nuestra Marca": "Sobre Nuestra Marca",
            "¿De donde nace nuestro Naming?": "¿De donde nace nuestro Naming?",
            "El nombre de Spicy Gallery surge de la idea de integrar un toque de intensidad y fuerza a la marca.": "El nombre de Spicy Gallery surge de la idea de integrar un toque de intensidad y fuerza a la marca.",
            "Al igual que una especia intensifica y mejora el sabor de un plato, los diseños de Spicy Gallery tratan de realzar la personalidad de quien la lleva, concediendo un distintivo a cada uno de vosotros.": "Al igual que una especia intensifica y mejora el sabor de un plato, los diseños de Spicy Gallery tratan de realzar la personalidad de quien la lleva, concediendo un distintivo a cada uno de vosotros.",
            "Spicy representa energía y una perspectiva atrevida, desafiando los límites y las barreras de la moda tradicional.": "Spicy representa energía y una perspectiva atrevida, desafiando los límites y las barreras de la moda tradicional.",
            "Nuestro Slogan Nuestra Voz": "Nuestro Slogan Nuestra Voz",
            "Nuestro slogan \"Dare to be Spicy\", engloba la filosofía de la marca en una frase corta y directa": "Nuestro slogan \"Dare to be Spicy\", engloba la filosofía de la marca en una frase corta y directa",
            "Nuestro slogan \"Dare to be Spicy\", engloba la filosofía de la marca en una frase corta y directa.": "Nuestro slogan \"Dare to be Spicy\", engloba la filosofía de la marca en una frase corta y directa.",
            "Es una invitación al atrevimiento a ser diferente, destacar y vivir sin miedo a expresarse. Proporciona una llamada a abrazar el estilo streetwear sin limitaciones.": "Es una invitación al atrevimiento a ser diferente, destacar y vivir sin miedo a expresarse. Proporciona una llamada a abrazar el estilo streetwear sin limitaciones.",
            "Spicy Gallery es un desafío para dejar atrás lo monótono y alcanzar una versión más vibrante de uno mismo.": "Spicy Gallery es un desafío para dejar atrás lo monótono y alcanzar una versión más vibrante de uno mismo.",
            "Propuesta de valor": "Propuesta de valor",
            "Buscamos ser una referencia global, conectando con una comunidad apasionada por el arte, la música y el estilo de vida urbano, mientras impulsamos la sostenibilidad y la innovación en cada colección.": "Buscamos ser una referencia global, conectando con una comunidad apasionada por el arte, la música y el estilo de vida urbano, mientras impulsamos la sostenibilidad y la innovación en cada colección.",
            "Nuestro propósito es que cada prenda logre transmitir confianza e intrepidez, motivandoos a superar fronteras y a construir vuestra propia trayectoria en el mundo.": "Nuestro propósito es que cada prenda logre transmitir confianza e intrepidez, motivandoos a superar fronteras y a construir vuestra propia trayectoria en el mundo.",
            "Queremos consolidar la marca como una de las más referentes en el mercado de la moda urbana, sirviendo como inspiración para vosotros, nuestra comunidad global y marcas emergentes desafiando lo convencional.": "Queremos consolidar la marca como una de las más referentes en el mercado de la moda urbana, sirviendo como inspiración para vosotros, nuestra comunidad global y marcas emergentes desafiando lo convencional.",
            "En Spicy Gallery queremos convertirnos en un movimiento cultural que fomente la creatividad y la diversidad. Esperamos expandirnos a nivel internacional y colaborar con artistas y diseñadores que compartan la filosofía y valores de la marca.": "En Spicy Gallery queremos convertirnos en un movimiento cultural que fomente la creatividad y la diversidad. Esperamos expandirnos a nivel internacional y colaborar con artistas y diseñadores que compartan la filosofía y valores de la marca.",
            "Nuestra Filosofía": "Nuestra Filosofía",
            "Esta marca de ropa streetwear online nace con la misión de redefinir la moda urbana, ofreciendo prendas de alta calidad con diseños exclusivos que reflejan la autenticidad y esencia de la cultura callejera.": "Esta marca de ropa streetwear online nace con la misión de redefinir la moda urbana, ofreciendo prendas de alta calidad con diseños exclusivos que reflejan la autenticidad y esencia de la cultura callejera.",
            "Spicy Gallery nace con la intención de romper la tradición y desafiar las normas establecidas de la moda urbana.": "Spicy Gallery nace con la intención de romper la tradición y desafiar las normas establecidas de la moda urbana.",
            "La marca defiende la autoexpresión sin miedo, valorando la autenticidad y la actitud de los individuos que se atrevan a ser diferentes.": "La marca defiende la autoexpresión sin miedo, valorando la autenticidad y la actitud de los individuos que se atrevan a ser diferentes.",
            "El propósito es que cada prenda logre transmitir confianza e intrepidez, motivando a los consumidores a superar las fronteras y a construir su propia trayectoria en el mundo.": "El propósito es que cada prenda logre transmitir confianza e intrepidez, motivando a los consumidores a superar las fronteras y a construir su propia trayectoria en el mundo.",
            "Se quiere consolidar la marca como una de las más referentes en el mercado de la moda urbana, sirviendo como inspiración para una comunidad global y marcas emergentes desafiando lo convencional.": "Se quiere consolidar la marca como una de las más referentes en el mercado de la moda urbana, sirviendo como inspiración para una comunidad global y marcas emergentes desafiando lo convencional.",
            "Spicy Gallery busca conseguir convertirse en un movimiento cultural que fomente la creatividad y la diversidad.": "Spicy Gallery busca conseguir convertirse en un movimiento cultural que fomente la creatividad y la diversidad.",
            "Se ambiciona a expandirse a nivel internacional y colaborar con artistas y diseñadores que compartan la filosofía y valores de la marca.": "Se ambiciona a expandirse a nivel internacional y colaborar con artistas y diseñadores que compartan la filosofía y valores de la marca.",
            "Nuestro Equipo": "Nuestro Equipo",
            
            // Join us
            "¿Estás cansado de trabajar en algo que no te apasiona?": "¿Estás cansado de trabajar en algo que no te apasiona?",
            "Únete a nuestra comunidad y descubre todo lo que tenemos para ofrecerte. En Spicy Gallery valoramos el talento, la creatividad y la pasión por la moda. Ofrecemos un ambiente laboral dinámico,  con oportunidades de crecimiento profesional y personal. Nuestro equipo está formado por personas apasionadas que comparten nuestra visión de revolucionar la industria de la moda. Si buscas un lugar donde tus ideas sean escuchadas y donde puedas desarrollar todo tu potencial, ¡este es tu sitio! No esperes más para formar parte de nuestra familia.": "Únete a nuestra comunidad y descubre todo lo que tenemos para ofrecerte. En Spicy Gallery valoramos el talento, la creatividad y la pasión por la moda. Ofrecemos un ambiente laboral dinámico,  con oportunidades de crecimiento profesional y personal. Nuestro equipo está formado por personas apasionadas que comparten nuestra visión de revolucionar la industria de la moda. Si buscas un lugar donde tus ideas sean escuchadas y donde puedas desarrollar todo tu potencial, ¡este es tu sitio! No esperes más para formar parte de nuestra familia.",
            "Únete a Nosotros": "Únete a Nosotros",
            "¡Únete a nuestra comunidad y descubre todo lo que tenemos para ofrecerte!": "¡Únete a nuestra comunidad y descubre todo lo que tenemos para ofrecerte!",
            "Para ello, solo tienes que rellenar el formulario de abajo y nos pondremos en contacto contigo.": "Para ello, solo tienes que rellenar el formulario de abajo y nos pondremos en contacto contigo.",
            "Nombre": "Nombre",
            "Email": "Email",
            "Teléfono": "Teléfono",
            "Nivel de estudios": "Nivel de estudios",
            "Selecciona tu nivel de estudios": "Selecciona tu nivel de estudios",
            "Primaria": "Primaria",
            "Secundaria": "Secundaria",
            "Universidad": "Universidad",
            "Idiomas": "Idiomas",
            "Español": "Español",
            "Inglés": "Inglés",
            "Francés": "Francés",
            "Género": "Género",
            "Hombre": "Hombre",
            "Mujer": "Mujer",
            "Otro": "Otro",
            "Curriculum Vitae": "Curriculum Vitae",
            "Enviar solicitud": "Enviar solicitud",
            
            // Shop
            "Nuestros productos": "Nuestros productos",
            "Filtros": "Filtros",
            "Categoría": "Categoría",
            "Camisetas": "Camisetas",
            "Sudaderas": "Sudaderas",
            "Chaquetas": "Chaquetas",
            "Tops": "Tops",
            "Precio": "Precio",
            "Aplicar filtros": "Aplicar filtros",
            "Reiniciar": "Reiniciar",
            "Ver más": "Ver más",
            "Ver menos": "Ver menos",
            "Añadir al carrito": "Añadir al carrito",
            "Camiseta Modelo 1": "Camiseta Modelo 1",
            "Camiseta Modelo 3": "Camiseta Modelo 3",
            "Camiseta con diseño exclusivo": "Camiseta con diseño exclusivo",
            "Camiseta Modelo 4": "Camiseta Modelo 4",
            "Camiseta urbana street style": "Camiseta urbana street style",
            "Camiseta Modelo 6": "Camiseta Modelo 6",
            "Camiseta oversized con gráficos": "Camiseta oversized con gráficos",
            "Sudadera Modelo 1": "Sudadera Modelo 1",
            "Sudadera con diseño exclusivo": "Sudadera con diseño exclusivo",
            "Sudadera Modelo 2": "Sudadera Modelo 2",
            "Sudadera con capucha estampada": "Sudadera con capucha estampada",
            "Sudadera Modelo 3": "Sudadera Modelo 3",
            "Sudadera oversized de edición limitada": "Sudadera oversized de edición limitada",
            "Sudadera Modelo 4": "Sudadera Modelo 4",
            "Sudadera premium con detalle bordado": "Sudadera premium con detalle bordado",
            "Chaqueta Modelo 2": "Chaqueta Modelo 2",
            "Chaqueta con estampado exclusivo": "Chaqueta con estampado exclusivo",
            "Chaqueta Modelo 3": "Chaqueta Modelo 3",
            "Chaqueta premium edición limitada": "Chaqueta premium edición limitada",
            "Top Modelo 1": "Top Modelo 1",
            "Top estampado de algodón": "Top estampado de algodón",
            "Top Modelo 2": "Top Modelo 2",
            "Top de temporada con diseño exclusivo": "Top de temporada con diseño exclusivo",
            "Confirmar Compra": "Confirmar Compra",
            "Tu carrito está vacío": "Tu carrito está vacío",
            "Añade productos para empezar a comprar": "Añade productos para empezar a comprar",

            
            // Confirmar Compra
            "Cantidad:": "Cantidad:",
            "Confirmación de Compra": "Confirmación de Compra",
            "Datos Personales": "Datos Personales",
            "Nombre*": "Nombre*",
            "Apellido*": "Apellido*",
            "Correo Electrónico*": "Correo Electrónico*",
            "Teléfono*": "Teléfono*",
            "Dirección de Envío": "Dirección de Envío",
            "Dirección*": "Dirección*",
            "Ciudad*": "Ciudad*",
            "Código Postal*": "Código Postal*",
            "País*": "País*",
            "Selecciona un país": "Selecciona un país",
            "España": "España",
            "Francia": "Francia",
            "Italia": "Italia",
            "Portugal": "Portugal",
            "Alemania": "Alemania",
            "Reino Unido": "Reino Unido",
            "Código de Descuento": "Código de Descuento",
            "Código (Opcional)": "Código (Opcional)",
            "Aplicar": "Aplicar",
            "Método de Pago": "Método de Pago",
            "Tarjeta de Crédito/Débito": "Tarjeta de Crédito/Débito",
            "PayPal": "PayPal",
            "Número de Tarjeta*": "Número de Tarjeta*",
            "Fecha de Expiración*": "Fecha de Expiración*",
            "CVV*": "CVV*",
            "Finalizar Compra": "Finalizar Compra",
            "Resumen del Pedido": "Resumen del Pedido",
            "No hay productos en tu carrito": "No hay productos en tu carrito",
            "Subtotal:": "Subtotal:",
            "Gastos de envío:": "Gastos de envío:",
            "Descuento:": "Descuento:",
            "Total:": "Total:",
            
            // News and Blog
            "Últimas Noticias": "Últimas Noticias",
            "Mantente al día con las novedades de Spicy Gallery": "Mantente al día con las novedades de Spicy Gallery",
            "Nueva colección Spicy Urban rompe todos los esquemas": "Nueva colección Spicy Urban rompe todos los esquemas",
            "Nuestra colección más esperada ha llegado por fin.": "Nuestra colección más esperada ha llegado por fin.",
            "Leer más": "Leer más",
            "Leer menos": "Leer menos",
            "CARGAR MÁS NOTICIAS": "CARGAR MÁS NOTICIAS",
            "Blog Spicy": "Blog Spicy",
            "Tendencias, estilos y actualidad": "Tendencias, estilos y actualidad",
            "Tendencias": "Tendencias",
            "Historia": "Historia",
            "Sostenibilidad": "Sostenibilidad",
            "Cultura": "Cultura",
            "Las 5 tendencias que dominarán el streetwear en 2023": "Las 5 tendencias que dominarán el streetwear en 2023",
            "De la calle a las pasarelas: La evolución del streetwear": "De la calle a las pasarelas: La evolución del streetwear",
            "Moda sostenible: ¿Es posible en el mundo del streetwear?": "Moda sostenible: ¿Es posible en el mundo del streetwear?",
            "El arte urbano y su influencia en la moda actual": "El arte urbano y su influencia en la moda actual",
            "Leer artículo completo": "Leer artículo completo",
            "Mostrar menos": "Mostrar menos",
            "VER MÁS ARTÍCULOS": "VER MÁS ARTÍCULOS",
            
            // Contacto
            "Contacto": "Contacto",
            "Dirección": "Dirección",
            "Teléfono": "Teléfono",
            "Email": "Email",

            // Juego

            "Juego de Pares - Spicy Gallery": "Juego de Pares - Spicy Gallery",
            "¡GANASTE!": "¡GANASTE!",
            "Encontrados: ": "Encontrados: ",
            "Faltantes: ": "Faltantes: ",
            "Tiempo: ": "Tiempo: ",
            "Intentos: ": "Intentos: ",
            "Reiniciar Juego": "Reiniciar Juego",

            
            // FAQ
            "Preguntas Frecuentes": "Preguntas Frecuentes",
            "¿Cuál es el tiempo de entrega de los pedidos?": "¿Cuál es el tiempo de entrega de los pedidos?",
            "El tiempo de entrega estándar es de 3 a 5 días hábiles en España peninsular. Para envíos internacionales, el tiempo puede variar entre 7 y 14 días dependiendo del destino.": "El tiempo de entrega estándar es de 3 a 5 días hábiles en España peninsular. Para envíos internacionales, el tiempo puede variar entre 7 y 14 días dependiendo del destino.",
            "¿Qué métodos de pago aceptáis?": "¿Qué métodos de pago aceptáis?",
            "Aceptamos tarjetas de crédito/débito (Visa, Mastercard, American Express), PayPal, transferencia bancaria y pago contra reembolso (con cargo adicional).": "Aceptamos tarjetas de crédito/débito (Visa, Mastercard, American Express), PayPal, transferencia bancaria y pago contra reembolso (con cargo adicional).",
            "¿Puedo devolver o cambiar un producto?": "¿Puedo devolver o cambiar un producto?",
            "Sí, tienes 14 días desde la recepción del pedido para solicitar una devolución o cambio. Los productos deben estar en perfecto estado, con todas las etiquetas y en su embalaje original.": "Sí, tienes 14 días desde la recepción del pedido para solicitar una devolución o cambio. Los productos deben estar en perfecto estado, con todas las etiquetas y en su embalaje original.",
            "¿Realizáis envíos internacionales?": "¿Realizáis envíos internacionales?",
            "Sí, realizamos envíos a nivel internacional. Los gastos de envío y tiempos de entrega varían según el país de destino. Puedes consultar las tarifas específicas durante el proceso de compra.": "Sí, realizamos envíos a nivel internacional. Los gastos de envío y tiempos de entrega varían según el país de destino. Puedes consultar las tarifas específicas durante el proceso de compra.",
            "¿Cómo puedo conocer el estado de mi pedido?": "¿Cómo puedo conocer el estado de mi pedido?",
            "Una vez realizado tu pedido, recibirás un correo de confirmación con un número de seguimiento. Podrás consultar el estado de tu envío a través de nuestra web en la sección \"Mi cuenta\" o directamente en la web de la empresa de transporte.": "Una vez realizado tu pedido, recibirás un correo de confirmación con un número de seguimiento. Podrás consultar el estado de tu envío a través de nuestra web en la sección \"Mi cuenta\" o directamente en la web de la empresa de transporte.",
            
            // Footer
            "Newsletter": "Newsletter",
            "Suscríbete a nuestra newsletter": "Suscríbete a nuestra newsletter",
            "Tu email": "Tu email",
            "Suscribirme": "Suscribirme",
            "Síguenos": "Síguenos",
            "Política de Privacidad": "Política de Privacidad",
            "Términos y Condiciones": "Términos y Condiciones",
            "Política de Cookies": "Política de Cookies",
            "Todos los derechos reservados.": "Todos los derechos reservados.",
            "© 2025 Spicy Gallery. Todos los derechos reservados.": "© 2025 Spicy Gallery. Todos los derechos reservados."
        },
        en: {
            // Navigation
            "INICIO": "HOME",
            "TIENDA": "SHOP",
            "SOBRE NOSOTROS": "ABOUT US",
            "NOTICIAS Y BLOG": "NEWS & BLOG",
            "ÚNETE A NOSOTROS": "JOIN US",
            "JUEGO": "GAME",
            
            // Header and main sections
            "Dare to be Spicy": "Dare to be Spicy",
            "Spicy Gallery": "Spicy Gallery",
            
            // Home sections
            "Tienda": "Shop",
            "Echa un vistazo a nuestros productos más vendidos": "Check out our best sellers",
            "Camiseta": "T-shirt",
            "Camiseta de algodón premium": "Premium cotton t-shirt",
            "Sudadera": "Sweatshirt",
            "Sudadera confortable de algodón": "Comfortable cotton sweatshirt",
            "Chaqueta": "Jacket",
            "Chaqueta premium edición limitada": "Premium limited edition jacket",
            "Para ver todos nuestros productos, accede a nuestra tienda": "To see all our products, visit our store",
            "Ir a la tienda": "Go to shop",
            
            // Introduction
            "Spicy Gallery es mucho más que una tienda de ropa. Somos estilo de vida. Nuestra pasión por el estilo y la moda urbana nos impulsa a ofrecer piezas únicas para jóvenes de espíritu libre.": "Spicy Gallery is much more than a clothing store. We are a lifestyle. Our passion for style and urban fashion drives us to offer unique pieces for free-spirited youth.",
            "Spicy Gallery no es solo ropa; es para quienes se atreven a combinar cualquier estilo que les guste sin miedo a lo que digan o piensen los demás.": "Spicy Gallery is not just clothing; it's for those who dare to mix any style they love without fear of what others might say or think.",
            "En un mundo donde todos quieren encajar, Spicy Gallery es una marca que busca romper con lo establecido, una marca diseñada para el mundo.": "In a world where everyone wants to fit in, Spicy Gallery is a brand that breaks the mold, a brand designed for the world.",
            
            // About us
            "Sobre Nuestra Marca": "About Our Brand",
            "¿De donde nace nuestro Naming?": "Where does our naming come from?",
            "El nombre de Spicy Gallery surge de la idea de integrar un toque de intensidad y fuerza a la marca.": "The name Spicy Gallery emerges from the idea of integrating a touch of intensity and strength to the brand.",
            "Al igual que una especia intensifica y mejora el sabor de un plato, los diseños de Spicy Gallery tratan de realzar la personalidad de quien la lleva, concediendo un distintivo a cada uno de vosotros.": "Just as a spice intensifies and enhances the flavor of a dish, Spicy Gallery designs aim to enhance the personality of the wearer, giving each of you a distinctive touch.",
            "Spicy representa energía y una perspectiva atrevida, desafiando los límites y las barreras de la moda tradicional.": "Spicy represents energy and a bold perspective, challenging the limits and barriers of traditional fashion.",
            "Nuestro Slogan Nuestra Voz": "Our Slogan Our Voice",
            "Nuestro slogan \"Dare to be Spicy\", engloba la filosofía de la marca en una frase corta y directa": "Our slogan \"Dare to be Spicy\", encompasses the brand's philosophy in a short and direct phrase",
            "Nuestro slogan \"Dare to be Spicy\", engloba la filosofía de la marca en una frase corta y directa.": "Our slogan \"Dare to be Spicy\", encompasses the brand's philosophy in a short and direct phrase.",
            "Es una invitación al atrevimiento a ser diferente, destacar y vivir sin miedo a expresarse. Proporciona una llamada a abrazar el estilo streetwear sin limitaciones.": "It's an invitation to dare to be different, stand out, and live without fear of self-expression. It provides a call to embrace streetwear style without limitations.",
            "Spicy Gallery es un desafío para dejar atrás lo monótono y alcanzar una versión más vibrante de uno mismo.": "Spicy Gallery is a challenge to leave the monotonous behind and achieve a more vibrant version of oneself.",
            "Propuesta de valor": "Value Proposition",
            "Buscamos ser una referencia global, conectando con una comunidad apasionada por el arte, la música y el estilo de vida urbano, mientras impulsamos la sostenibilidad y la innovación en cada colección.": "We are on a mission to be a global reference, connecting with a community passionate about art, music, and urban lifestyle, while driving sustainability and innovation in each collection.",
            "Nuestro propósito es que cada prenda logre transmitir confianza e intrepidez, motivandoos a superar fronteras y a construir vuestra propia trayectoria en el mundo.": "Our goal is for each piece to convey confidence and boldness, inspiring you to push boundaries and build your own path in the world.",
            "Queremos consolidar la marca como una de las más referentes en el mercado de la moda urbana, sirviendo como inspiración para vosotros, nuestra comunidad global y marcas emergentes desafiando lo convencional.": "We want to establish our brand as a leading reference in the urban fashion market, serving as inspiration for you, our global community, and emerging brands challenging the conventional.",
            "En Spicy Gallery queremos convertirnos en un movimiento cultural que fomente la creatividad y la diversidad. Esperamos expandirnos a nivel internacional y colaborar con artistas y diseñadores que compartan la filosofía y valores de la marca.": "We aspire to become a cultural movement that fosters creativity and diversity. We hope to expand internationally and collaborate with artists and designers who share our brand's philosophy and values.",
            "Nuestra Filosofía": "Our Philosophy",
            "Esta marca de ropa streetwear online nace con la misión de redefinir la moda urbana, ofreciendo prendas de alta calidad con diseños exclusivos que reflejan la autenticidad y esencia de la cultura callejera.": "This online streetwear brand was founded with the mission to redefine urban fashion, offering high-quality pieces with exclusive designs that reflect the authenticity and essence of street culture.",
            "Spicy Gallery nace con la intención de romper la tradición y desafiar las normas establecidas de la moda urbana.": "Spicy Gallery was founded with the intention to break tradition and challenge the established norms of urban fashion.",
            "La marca defiende la autoexpresión sin miedo, valorando la autenticidad y la actitud de los individuos que se atrevan a ser diferentes.": "The brand defends self-expression without fear, valuing authenticity and the attitude of individuals who dare to be different.",
            "El propósito es que cada prenda logre transmitir confianza e intrepidez, motivando a los consumidores a superar las fronteras y a construir su propia trayectoria en el mundo.": "The goal is for each piece to convey confidence and boldness, motivating consumers to overcome boundaries and build their own path in the world.",
            "Se quiere consolidar la marca como una de las más referentes en el mercado de la moda urbana, sirviendo como inspiración para una comunidad global y marcas emergentes desafiando lo convencional.": "We want to establish our brand as a leading reference in the urban fashion market, serving as inspiration for a global community, and emerging brands challenging the conventional.",
            "Spicy Gallery busca conseguir convertirse en un movimiento cultural que fomente la creatividad y la diversidad.": "Spicy Gallery aims to become a cultural movement that fosters creativity and diversity.",
            "Se ambiciona a expandirse a nivel internacional y colaborar con artistas y diseñadores que compartan la filosofía y valores de la marca.": "We aspire to expand internationally and collaborate with artists and designers who share our brand's philosophy and values.",
            "Se basa en valores como la autenticidad, el compromiso con el medio ambiente, la colaboración con creadores, la creatividad sin límites y el respeto por la esencia de la cultura streetwear, promoviendo la autoexpresión a través de cada prenda.": "The brand is based on values such as authenticity, commitment to the environment, collaboration with creators, limitless creativity, and respect for the essence of streetwear culture, promoting self-expression through each piece.",
            "Además de lo anteriormente mencionado, también abarcan la autenticidad, con la idea de lo importante que es ser fiel a uno mismo;": "In addition to the above, they also include authenticity, with the idea of how important it is to be true to oneself.",
            "el atrevimiento y la creatividad, desafiando las normas establecidas y diseñando prendas con estilos únicos;": "the courage and creativity, challenging the established norms and designing pieces with unique styles.",
            "la sostenibilidad e innovación, comprometiéndose con el medio ambiente en cada proceso y explorando nuevas tendencias; y construyendo una comunidad fuerte y fomentando la autoexpresión.": "sustainability and innovation, committing to the environment in each process and exploring new trends; and building a strong community and promoting self-expression.",
            "Nuestro Equipo": "Our Team",
            "Co-Encargada del área de marketing y comunicación digital": "Co-Head of Marketing and Digital Communication",
            "Encargada de la gestión administrativa y financiera de Spicy Gallery.": "Head of Administrative and Financial Management of Spicy Gallery.",
            "Encargada de atención al cliente": "Customer Service Representative",
            
            // Join us
            "¿Estás cansado de trabajar en algo que no te apasiona?": "Are you tired of working on something you're not passionate about?",
            "Únete a nuestra comunidad y descubre todo lo que tenemos para ofrecerte. En Spicy Gallery valoramos el talento, la creatividad y la pasión por la moda. Ofrecemos un ambiente laboral dinámico,  con oportunidades de crecimiento profesional y personal. Nuestro equipo está formado por personas apasionadas que comparten nuestra visión de revolucionar la industria de la moda. Si buscas un lugar donde tus ideas sean escuchadas y donde puedas desarrollar todo tu potencial, ¡este es tu sitio! No esperes más para formar parte de nuestra familia.": "Join our community and discover everything we have to offer you. In Spicy Gallery, we value talent, creativity, and passion for fashion. We offer a dynamic work environment, with opportunities for professional growth and personal development. Our team is made up of passionate people who share our vision of revolutionizing the fashion industry. If you're looking for a place where your ideas are heard and you can develop all your potential, this is your place! Don't wait any longer to become part of our family.",
            "Únete a Nosotros": "Join Us",
            "¡Únete a nuestra comunidad y descubre todo lo que tenemos para ofrecerte!": "Join our community and discover everything we have to offer you!",
            "Para ello, solo tienes que rellenar el formulario de abajo y nos pondremos en contacto contigo.": "To do so, just fill in the form below and we will contact you.",
            "Nombre": "Name",
            "Email": "Email",
            "Teléfono": "Phone",
            "Nivel de estudios": "Education Level",
            "Selecciona tu nivel de estudios": "Select your education level",
            "Primaria": "Primary",
            "Secundaria": "Secondary",
            "Universidad": "University",
            "Idiomas": "Languages",
            "Español": "Spanish",
            "Inglés": "English",
            "Francés": "French",
            "Género": "Gender",
            "Hombre": "Male",
            "Mujer": "Female",
            "Otro": "Other",
            "Curriculum Vitae": "Resume/CV",
            "Seleccionar archivo": "Select file",
            "Ningún archivo seleccionado": "No file selected",
            "Enviar solicitud": "Submit Application",
            
            // Shop
            "Nuestros productos": "Our products",
            "Filtros": "Filters",
            "Categoría": "Category",
            "Camisetas": "T-shirts",
            "Sudaderas": "Sweatshirts",
            "Chaquetas": "Jackets",
            "Tops": "Tops",
            "Precio": "Price",
            "Aplicar filtros": "Apply filters",
            "Reiniciar": "Reset",
            "Ver más": "View more",
            "Ver menos": "View less",
            "Añadir al carrito": "Add to cart",
            "Camiseta Modelo 1": "T-shirt Model 1",
            "Camiseta Modelo 3": "T-shirt Model 3",
            "Camiseta con diseño exclusivo": "T-shirt with exclusive design",
            "Camiseta Modelo 4": "T-shirt Model 4",
            "Camiseta urbana street style": "Urban street style t-shirt",
            "Camiseta Modelo 6": "T-shirt Model 6",
            "Camiseta oversized con gráficos": "Oversized t-shirt with graphics",
            "Sudadera Modelo 1": "Sweater Model 1",
            "Sudadera con diseño exclusivo": "Sweater with exclusive design",
            "Sudadera Modelo 2": "Sweater Model 2",
            "Sudadera con capucha estampada": "Sweater with printed hood",
            "Sudadera Modelo 3": "Sweater Model 3",
            "Sudadera oversized de edición limitada": "Sweater with printed hood",
            "Sudadera Modelo 4": "Sweater Model 4",
            "Sudadera premium con detalle bordado": "Premium sweater with embroidered detail",
            "Chaqueta Modelo 2": "Jacket Model 2",
            "Chaqueta con estampado exclusivo": "Jacket with exclusive print",
            "Chaqueta Modelo 3": "Jacket Model 3",
            "Chaqueta premium edición limitada": "Premium limited edition jacket",
            "Top Modelo 1": "Top Model 1",
            "Top estampado de algodón": "Cotton printed top",
            "Top Modelo 2": "Top Model 2",
            "Top de temporada con diseño exclusivo": "Seasonal top with exclusive design",
            "Confirmar Compra": "Confirm purchase",
            "Tu carrito está vacío": "Your cart is empty",
            "Añade productos para empezar a comprar": "Add products to start shopping",
            
            // Checkout
            "Cantidad:": "Quantity:",
            "Confirmación de Compra": "Purchase Confirmation",
            "Datos Personales": "Personal Information",
            "Nombre*": "Name*",
            "Apellido*": "Last Name*",
            "Correo Electrónico*": "Email*",
            "Teléfono*": "Phone*",
            "Dirección de Envío": "Shipping Address",
            "Dirección*": "Address*",
            "Ciudad*": "City*",
            "Código Postal*": "Postal Code*",
            "País*": "Country*",
            "Selecciona un país": "Select a country",
            "España": "Spain",
            "Francia": "France",
            "Italia": "Italy",
            "Portugal": "Portugal",
            "Alemania": "Germany",
            "Reino Unido": "United Kingdom",
            "Código de Descuento": "Discount Code",
            "Código (Opcional)": "Code (Optional)",
            "Aplicar": "Apply",
            "Método de Pago": "Payment Method",
            "Tarjeta de Crédito/Débito": "Credit/Debit Card",
            "PayPal": "PayPal",
            "Número de Tarjeta*": "Card Number*",
            "Fecha de Expiración*": "Expiration Date*",
            "CVV*": "CVV*",
            "Finalizar Compra": "Complete Purchase",
            "Resumen del Pedido": "Order Summary",
            "No hay productos en tu carrito": "There are no products in your cart",
            "Subtotal:": "Subtotal:",
            "Gastos de envío:": "Shipping:",
            "Descuento:": "Discount:",
            "Total:": "Total:",
            
            // News and Blog
            "Últimas Noticias": "Latest News",
            "Mantente al día con las novedades de Spicy Gallery": "Stay up to date with the latest from Spicy Gallery",
            "Nueva colección Spicy Urban rompe todos los esquemas": "New Spicy Urban collection breaks all the schemes",
            "Nuestra colección más esperada ha llegado por fin.": "Our most anticipated collection has finally arrived.",
            "Leer más": "Read more",
            "Leer menos": "Read less",
            "CARGAR MÁS NOTICIAS": "LOAD MORE NEWS",
            "Blog Spicy": "Spicy Blog",
            "Tendencias, estilos y actualidad": "Trends, styles and current affairs",
            "Tendencias": "Trends",
            "Historia": "History",
            "Sostenibilidad": "Sustainability",
            "Cultura": "Culture",
            "Las 5 tendencias que dominarán el streetwear en 2023": "The 5 trends that will dominate streetwear in 2023",
            "De la calle a las pasarelas: La evolución del streetwear": "From the street to the runway: The evolution of streetwear",
            "Moda sostenible: ¿Es posible en el mundo del streetwear?": "Sustainable fashion: Is it possible in the streetwear world?",
            "El arte urbano y su influencia en la moda actual": "Urban art and its influence on current fashion",
            "Leer artículo completo": "Read full article",
            "Mostrar menos": "Show less",
            "VER MÁS ARTÍCULOS": "VIEW MORE ARTICLES",
            
            // Contact
            "Contacto": "Contact",
            "Dirección": "Address",
            "Teléfono": "Phone",
            "Email": "Email",

            // Game
            "Juego de Pares - Spicy Gallery": "Pairs Game - Spicy Gallery",
            "¡GANASTE!": "YOU WON!",
            "Encontrados: ": "Found: ",
            "Faltantes: ": "Missing: ",
            "Tiempo: ": "Time: ",
            "Intentos: ": "Attempts: ",
            "Reiniciar Juego": "Reset Game",
            
            // FAQ
            "Preguntas Frecuentes": "Frequently Asked Questions",
            "¿Cuál es el tiempo de entrega de los pedidos?": "What is the delivery time for orders?",
            "El tiempo de entrega estándar es de 3 a 5 días hábiles en España peninsular. Para envíos internacionales, el tiempo puede variar entre 7 y 14 días dependiendo del destino.": "Standard delivery time is 3-5 business days within mainland Spain. For international shipments, time may vary between 7-14 days depending on the destination.",
            "¿Qué métodos de pago aceptáis?": "What payment methods do you accept?",
            "Aceptamos tarjetas de crédito/débito (Visa, Mastercard, American Express), PayPal, transferencia bancaria y pago contra reembolso (con cargo adicional).": "We accept credit/debit cards (Visa, Mastercard, American Express), PayPal, bank transfer, and cash on delivery (with additional charge).",
            "¿Puedo devolver o cambiar un producto?": "Can I return or exchange a product?",
            "Sí, tienes 14 días desde la recepción del pedido para solicitar una devolución o cambio. Los productos deben estar en perfecto estado, con todas las etiquetas y en su embalaje original.": "Yes, you have 14 days from receiving your order to request a return or exchange. Products must be in perfect condition, with all tags and in their original packaging.",
            "¿Realizáis envíos internacionales?": "Do you ship internationally?",
            "Sí, realizamos envíos a nivel internacional. Los gastos de envío y tiempos de entrega varían según el país de destino. Puedes consultar las tarifas específicas durante el proceso de compra.": "Yes, we ship internationally. Shipping costs and delivery times vary depending on the destination country. You can check specific rates during the checkout process.",
            "¿Cómo puedo conocer el estado de mi pedido?": "How can I track my order?",
            "Una vez realizado tu pedido, recibirás un correo de confirmación con un número de seguimiento. Podrás consultar el estado de tu envío a través de nuestra web en la sección \"Mi cuenta\" o directamente en la web de la empresa de transporte.": "Once you place your order, you'll receive a confirmation email with a tracking number. You can check your shipment status through our website in the \"My Account\" section or directly on the shipping company's website.",
            
            // Footer
            "Newsletter": "Newsletter",
            "Suscríbete a nuestra newsletter": "Subscribe to our newsletter",
            "Tu email": "Your email",
            "Suscribirme": "Subscribe",
            "Síguenos": "Follow us",
            "Política de Privacidad": "Privacy Policy",
            "Términos y Condiciones": "Terms & Conditions",
            "Política de Cookies": "Cookie Policy",
            "Todos los derechos reservados.": "All rights reserved.",
            "© 2025 Spicy Gallery. Todos los derechos reservados.": "© 2025 Spicy Gallery. All rights reserved."
        }
    };

    // Cargar idioma guardado o establecer español por defecto
    const savedLanguage = localStorage.getItem('language') || 'es';
    setActiveLanguage(savedLanguage);
    
    // Aplicar traducciones al cargar la página
    applyTranslations(savedLanguage);
    
    // Añadir evento de clic a las banderas
    languageFlags.forEach(flag => {
        flag.addEventListener('click', () => {
            const lang = flag.getAttribute('data-lang');
            setActiveLanguage(lang);
            applyTranslations(lang);
            localStorage.setItem('language', lang);
        });
    });
    
    // Función para marcar idioma activo
    function setActiveLanguage(lang) {
        languageFlags.forEach(flag => {
            if (flag.getAttribute('data-lang') === lang) {
                flag.classList.add('active');
            } else {
                flag.classList.remove('active');
            }
        });
    }
    
    // Función para aplicar traducciones
    function applyTranslations(lang) {
        const elements = document.querySelectorAll('[data-i18n]');
        
        // Si los elementos no tienen el atributo data-i18n, añadirlo primero
        if (!elements.length) {
            // Navegar por todos los textos traducibles y añadir el atributo
            addI18nAttributes();
        }
        
        // Aplicar traducciones a elementos con data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang] && translations[lang][key]) {
                el.textContent = translations[lang][key];
            }
        });

        // Aplicar traducciones a placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (translations[lang] && translations[lang][key]) {
                el.setAttribute('placeholder', translations[lang][key]);
            }
        });

        // Aplicamos traducción específica para etiquetas de cantidad
        const quantityLabels = document.querySelectorAll('.quantity-label');
        quantityLabels.forEach(label => {
            if (lang === 'en') {
                label.textContent = 'Quantity:';
            } else {
                label.textContent = 'Cantidad:';
            }
        });
    }
    
    // Añadir atributos data-i18n a elementos traducibles
    function addI18nAttributes() {
        // Navegación
        document.querySelectorAll('.header__nav-link').forEach(link => {
            const text = link.textContent.trim();
            link.setAttribute('data-i18n', text);
        });
        
        // Títulos y subtítulos principales
        document.querySelectorAll('h1, h2, h3, h4').forEach(el => {
            if (el.children.length === 0) { // Solo si no tiene hijos
                const text = el.textContent.trim();
                if (translations.es[text] || translations.en[text]) {
                    el.setAttribute('data-i18n', text);
                }
            }
        });
        
        // Párrafos
        document.querySelectorAll('p').forEach(el => {
            if (el.children.length === 0) { // Solo si no tiene hijos
                const text = el.textContent.trim();
                if (translations.es[text] || translations.en[text]) {
                    el.setAttribute('data-i18n', text);
                }
            }
        });
        
        // Botones
        document.querySelectorAll('button').forEach(button => {
            if (button.children.length === 0) { // Solo si no tiene hijos
                const text = button.textContent.trim();
                if (translations.es[text] || translations.en[text]) {
                    button.setAttribute('data-i18n', text);
                }
            }
        });
        
        // Enlaces
        document.querySelectorAll('a').forEach(link => {
            if (link.children.length === 0) { // Solo si no tiene hijos
                const text = link.textContent.trim();
                if (translations.es[text] || translations.en[text]) {
                    link.setAttribute('data-i18n', text);
                }
            }
        });
        
        // Etiquetas
        document.querySelectorAll('label').forEach(label => {
            if (label.children.length === 0) { // Solo si no tiene hijos
                const text = label.textContent.trim();
                if (translations.es[text] || translations.en[text]) {
                    label.setAttribute('data-i18n', text);
                }
            }
        });
        
        // Opciones de selección
        document.querySelectorAll('option').forEach(option => {
            const text = option.textContent.trim();
            if (translations.es[text] || translations.en[text]) {
                option.setAttribute('data-i18n', text);
            }
        });

        // Spans
        document.querySelectorAll('span').forEach(span => {
            if (span.children.length === 0) { // Solo si no tiene hijos
                const text = span.textContent.trim();
                if (translations.es[text] || translations.en[text]) {
                    span.setAttribute('data-i18n', text);
                }
            }
        });
        
        // Inputs con placeholder
        document.querySelectorAll('input[placeholder]').forEach(input => {
            const text = input.getAttribute('placeholder');
            if (translations.es[text] || translations.en[text]) {
                input.setAttribute('data-i18n-placeholder', text);
            }
        });

        // Tarjetas de productos, noticias, blog, etc.
        // Shop
        document.querySelectorAll('.Shop__Name, .Shop__Description, .viewShop__card-title, .viewShop__card-description').forEach(el => {
            const text = el.textContent.trim();
            if (text && (translations.es[text] || translations.en[text])) {
                el.setAttribute('data-i18n', text);
            }
        });

        // News
        document.querySelectorAll('.news__article-title, .news__excerpt, .news__card-title, .news__card-excerpt').forEach(el => {
            const text = el.textContent.trim();
            if (text && (translations.es[text] || translations.en[text])) {
                el.setAttribute('data-i18n', text);
            }
        });

        // Blog
        document.querySelectorAll('.blog__article-title, .blog__article-excerpt, .blog__tag').forEach(el => {
            const text = el.textContent.trim();
            if (text && (translations.es[text] || translations.en[text])) {
                el.setAttribute('data-i18n', text);
            }
        });

        // FAQ
        document.querySelectorAll('.faq__question h3, .faq__answer p').forEach(el => {
            const text = el.textContent.trim();
            if (text && (translations.es[text] || translations.en[text])) {
                el.setAttribute('data-i18n', text);
            }
        });

        // Copyright y textos del footer
        document.querySelectorAll('.footer__copyright').forEach(el => {
            const text = el.textContent.trim();
            if (text && (translations.es[text] || translations.en[text])) {
                el.setAttribute('data-i18n', text);
            }
        });
    }
}

// Juego de pares (Memory Game)
function initMemoryGame() {
    // Verificar si estamos en la página del juego
    if (!document.getElementById('pantalla')) return;
    
    // Variables para el juego
    var cartasArray = [
        'camiseta1', 'camiseta2', 'sudadera1', 'sudadera2', 'chaqueta1', 'chaqueta2',
        'camiseta1', 'camiseta2', 'sudadera1', 'sudadera2', 'chaqueta1', 'chaqueta2'
    ];
    var contadorVolteadas = 0;
    var carta1 = '';
    var carta2 = '';
    var encontradas = 0;
    var faltantes = 6;
    var tiempo = 0;
    var temporizadorInterval;
    var intentos = 0;
    var clic = false;
    var juegoTerminado = false;

    // Mapeo de nombres de cartas a imágenes reales de productos
    const imagenesPrendas = {
        'camiseta1': 'Imagenes/camisetaCompra1.png',
        'camiseta2': 'Imagenes/camisetaCompra4.png',
        'sudadera1': 'Imagenes/sudaderaCompra1.png',
        'sudadera2': 'Imagenes/sudaderaCompra2.png',
        'chaqueta1': 'Imagenes/chaquetaCompra1.png',
        'chaqueta2': 'Imagenes/chaquetaCompra2.png'
    };

    // Constructor de cartas
    function Carta(x, y, w, h, tipo) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.tipo = tipo;
        this.template = `
            <div class="flip-card ctrlCartas" data-carta="${tipo}" 
                style="left: ${x}px; top: ${y}px; width: ${w}px; height: ${h}px;">
                <div class="flip-card-inner">
                    <div class="flip-card-front">
                        <img src="Imagenes/Logonegro.png" alt="Spicy Gallery Logo">
                    </div>
                    <div class="flip-card-back">
                        <img src="${imagenesPrendas[tipo]}" alt="${tipo}">
                    </div>
                </div>
            </div>`;
    }

    // Inicializar el juego al cargar la página
    iniciarJuego();

    // Iniciar el juego
    function iniciarJuego() {
        // Resetear variables
        contadorVolteadas = 0;
        carta1 = '';
        carta2 = '';
        encontradas = 0;
        faltantes = 6;
        tiempo = 0;
        intentos = 0;
        juegoTerminado = false;

        // Actualizar interfaz
        document.getElementById('encontrados').textContent = encontradas;
        document.getElementById('faltantes').textContent = faltantes;
        document.getElementById('intentos').textContent = intentos;
        document.getElementById('temporizador').textContent = tiempo;
        
        // Restablecer el mensaje de victoria
        const lang = localStorage.getItem('language') || 'es';
        document.getElementById('ganaste').innerHTML = lang === 'en' ? 'YOU WON!' : '¡GANASTE!';
        document.getElementById('ganaste').style.display = 'none';

        // Limpiar el tablero
        const cartasExistentes = document.querySelectorAll('.ctrlCartas');
        cartasExistentes.forEach(carta => carta.remove());

        // Cargar nuevas cartas
        cargarCartas();

        // Iniciar temporizador
        if (temporizadorInterval) {
            clearInterval(temporizadorInterval);
        }
        iniciarTemporizador();
    }

    // Función para desordenar arrays (Fisher-Yates shuffle)
    function desordenarArrays(array) {
        let arrayCopiado = [...array];
        for (let i = arrayCopiado.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arrayCopiado[i], arrayCopiado[j]] = [arrayCopiado[j], arrayCopiado[i]];
        }
        return arrayCopiado;
    }

    // Iniciar el temporizador
    function iniciarTemporizador() {
        temporizadorInterval = setInterval(() => {
            if (!juegoTerminado) {
                tiempo++;
                document.getElementById('temporizador').textContent = tiempo;
            }
        }, 1000);
    }

    // Cargar las cartas en el tablero
    function cargarCartas() {
        let cartasDesordenadas = desordenarArrays(cartasArray);
        let tablero = document.getElementById("pantalla");
        let modificadorX = 10;
        let y = 10;

        for (let i = 0; i < 12; i++) {
            // Actualizar posición Y según la fila
            if (i === 0) y = 10;
            else if (i === 4) { y = 130; modificadorX = 10; }
            else if (i === 8) { y = 250; modificadorX = 10; }
            
            // Crear carta y añadirla al tablero
            let cartaNueva = new Carta(modificadorX, y, 100, 100, cartasDesordenadas[i]);
            tablero.insertAdjacentHTML("beforeend", cartaNueva.template);
            
            // Incrementar posición X para la siguiente carta
            modificadorX += 120;
        }

        // Añadir eventos a las cartas
        document.querySelectorAll('.ctrlCartas').forEach(carta => {
            carta.addEventListener('click', function() {
                voltear(this);
            });
        });
    }

    // Función para voltear las cartas
    function voltear(carta) {
        if (juegoTerminado || carta.classList.contains('volteada') || contadorVolteadas >= 2) {
            return;
        }

        carta.classList.add('volteada');
        contadorVolteadas++;
        
        let tipoCarta = carta.getAttribute('data-carta');
        if (contadorVolteadas === 1) {
            carta1 = tipoCarta;
        } else if (contadorVolteadas === 2) {
            carta2 = tipoCarta;
            intentos++;
            document.getElementById('intentos').textContent = intentos;
            
            // Verificar si las cartas son iguales
            setTimeout(() => {
                verificarPareja();
            }, 1000);
        }
        
        // Voltear la carta visualmente
        carta.querySelector('.flip-card-inner').style.transform = 'rotateY(180deg)';
    }

    // Verificar si las cartas forman pareja
    function verificarPareja() {
        const cartasVolteadas = document.querySelectorAll('.volteada');
        
        if (carta1 === carta2) {
            // Pareja encontrada
            encontradas++;
            faltantes--;
            document.getElementById('encontrados').textContent = encontradas;
            document.getElementById('faltantes').textContent = faltantes;
            
            // Ocultar las cartas encontradas
            cartasVolteadas.forEach(carta => {
                setTimeout(() => {
                    carta.style.visibility = 'hidden';
                }, 300);
            });
            
            // Verificar si se ganó el juego
            if (encontradas === 6) {
                juegoTerminado = true;
                clearInterval(temporizadorInterval);
                
                // Generar código de descuento
                const codigoDescuento = generarCodigoDescuento();
                
                // Guardar el código en localStorage para poder usarlo después
                localStorage.setItem('spicyDescuento', codigoDescuento);
                
                // Mostrar mensaje de victoria con código de descuento
                const mensajeVictoria = document.getElementById('ganaste');
                // Obtener el idioma actual
                const lang = localStorage.getItem('language') || 'es';
                
                // Mensajes según el idioma
                const textoGanaste = lang === 'en' ? 'YOU WON!' : '¡GANASTE!';
                const textoDescuento = lang === 'en' ? 'You just won a 50% discount code' : 'Acabas de ganar un código de descuento del 50%';
                const textoUso = lang === 'en' ? 'Use this code in your next purchase' : 'Usa este código en tu próxima compra';
                
                mensajeVictoria.innerHTML = `
                    <h2>${textoGanaste}</h2>
                    <p>${textoDescuento}</p>
                    <div class="codigo-descuento">
                        <span id="codigo">${codigoDescuento}</span>
                    </div>
                    <p class="codigo-info">${textoUso}</p>
                `;
                mensajeVictoria.style.display = 'block';
                
                // Eliminado el código para el botón de copiar
            }
        } else {
            // No son pareja, voltear de vuelta
            cartasVolteadas.forEach(carta => {
                setTimeout(() => {
                    carta.querySelector('.flip-card-inner').style.transform = '';
                    carta.classList.remove('volteada');
                }, 300);
            });
        }
        
        // Resetear para la próxima jugada
        contadorVolteadas = 0;
    }
    
    // Función para generar un código de descuento aleatorio
    function generarCodigoDescuento() {
        const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Eliminados caracteres confusos (I, O, 0, 1)
        let codigo = 'SPICY';
        
        for (let i = 0; i < 8; i++) {
            codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
        }
        
        return codigo;
    }

    // Añadir evento al botón de reinicio
    document.getElementById('restart-btn').addEventListener('click', iniciarJuego);
}