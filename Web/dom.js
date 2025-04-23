// Función para inicializar los desplegables de las preguntas frecuentes
function initFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq__question');
    
    faqItems.forEach(item => {
        item.addEventListener('click', () => {
            const parent = item.parentElement;
            
            parent.classList.toggle('active');
            const siblings = Array.from(parent.parentNode.children).filter(child => child !== parent);
            siblings.forEach(sibling => {
                sibling.classList.remove('active');
            });
        });
    });
}

// Función para manejar el menú hamburguesa
function initHamburgerMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Cerrar el menú al hacer click en un enlace
        const navLinks = document.querySelectorAll('.header__nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
        
        // Cerrar el menú al hacer click fuera de él
        document.addEventListener('click', (event) => {
            if (!navMenu.contains(event.target) && !menuToggle.contains(event.target)) {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
}

// Inicializar carrito de compras
function initShoppingCart() {
    const cartButtons = document.querySelectorAll('.Shop__Button');
    const cartCount = document.getElementById('cartCount');
    const cartContainer = document.querySelector('.header__hidden');
    const cartIcon = document.querySelector('.header__carrito');
    const closeButtons = document.querySelectorAll('.header__close');
    const emptyCartMessage = document.getElementById('carritoVacio');
    
    if (!cartButtons.length || !cartCount) return;
    
    let count = 0;
    let cartItems = {}; // Objeto para almacenar los productos y sus cantidades
    let total = 0; // Para calcular el total de la compra
    
    // Crear o actualizar el elemento de total
    function updateTotal() {
        let totalElement = document.getElementById('cartTotal');
        
        if (!totalElement) {
            // Si no existe, crear el elemento de total
            totalElement = document.createElement('div');
            totalElement.id = 'cartTotal';
            totalElement.className = 'header__total';
            
            // Crear el botón de confirmar compra
            const checkoutBtn = document.createElement('button');
            checkoutBtn.className = 'header__checkout-btn';
            checkoutBtn.textContent = 'Confirmar Compra';
            checkoutBtn.addEventListener('click', function() {
                window.location.href = 'confirmar-compra.html';
            });
            
            // Crear contenedor para el total y el botón
            const totalContainer = document.createElement('div');
            totalContainer.className = 'header__total-container';
            totalContainer.appendChild(totalElement);
            totalContainer.appendChild(checkoutBtn);
            
            // Añadir al carrito
            cartContainer.appendChild(totalContainer);
        }
        
        // Actualizar el texto del total
        totalElement.textContent = `Total: ${total.toFixed(2)}€`;
        
        // Mostrar/ocultar el total y el botón según haya productos
        const totalContainer = document.querySelector('.header__total-container');
        if (count > 0 && totalContainer) {
            totalContainer.style.display = 'flex';
        } else if (totalContainer) {
            totalContainer.style.display = 'none';
        }
    }
    
    // Función para verificar y actualizar el estado del carrito
    function updateCartStatus() {
        const products = cartContainer.querySelectorAll('.header__product');
        if (products.length === 0 && emptyCartMessage) {
            emptyCartMessage.style.display = 'block';
            total = 0;
        } else if (emptyCartMessage) {
            emptyCartMessage.style.display = 'none';
        }
        updateTotal();
    }
    
    // Función para actualizar la visualización de un producto en el carrito
    function updateProductDisplay(productName, quantity, price) {
        // Buscar si el producto ya existe en el carrito
        let productElement = null;
        const products = cartContainer.querySelectorAll('.header__product');
        
        products.forEach(product => {
            const nameElement = product.querySelector('.header__Name');
            if (nameElement && nameElement.textContent === productName) {
                productElement = product;
            }
        });
        
        if (productElement) {
            // Si existe, actualizar cantidad
            const quantityElement = productElement.querySelector('.header__quantity');
            quantityElement.textContent = quantity;
            
            // Actualizar precio total del producto
            const priceNum = parseFloat(price.replace('€', '').trim());
            const totalProductPrice = priceNum * quantity;
            const priceElement = productElement.querySelector('.header__Price');
            priceElement.textContent = `${totalProductPrice.toFixed(2)}€`;
        } else {
            // Si no existe, crear nuevo elemento
            const priceNum = parseFloat(price.replace('€', '').trim());
            productElement = document.createElement('div');
            productElement.className = 'header__product';
            productElement.innerHTML = `
                <div class="header__info">
                    <div class="header__product-row">
                        <span class="header__quantity">${quantity}</span>
                        <p class="header__Name">${productName}</p>
                    </div>
                    <p class="header__Price">${(priceNum * quantity).toFixed(2)}€</p>
                </div>
                <img src="Imagenes/X.png" alt="X" class="header__close">
            `;
            
            // Añadir funcionalidad al botón de cerrar
            const closeButton = productElement.querySelector('.header__close');
            closeButton.addEventListener('click', function(e) {
                e.stopPropagation();
                
                // Eliminar el producto del carrito
                delete cartItems[productName];
                count -= quantity;
                cartCount.textContent = count;
                productElement.remove();
                
                // Recalcular el total
                total -= priceNum * quantity;
                updateCartStatus();
            });
            
            // Añadir al carrito
            cartContainer.appendChild(productElement);
        }
    }
    
    // Inicializar el estado del carrito al cargar
    updateCartStatus();
    
    // Añadir productos al carrito
    cartButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Mostrar mensaje de confirmación
            const product = button.closest('.Shop__product');
            const productName = product.querySelector('.Shop__Name').textContent;
            const productPrice = product.querySelector('.Shop__Price').textContent;
            
            // Extraer el precio como número
            const priceNum = parseFloat(productPrice.replace('€', '').trim());
            
            // Actualizar cantidad en el objeto de productos
            if (cartItems[productName]) {
                cartItems[productName].quantity++;
            } else {
                cartItems[productName] = {
                    price: productPrice,
                    quantity: 1
                };
            }
            
            // Actualizar total
            total += priceNum;
            
            // Actualizar contador global
            count++;
            cartCount.textContent = count;
            
            // Actualizar visualización del producto
            updateProductDisplay(productName, cartItems[productName].quantity, productPrice);
            
            // Mostrar el carrito
            cartContainer.classList.add('active');
            updateCartStatus();
            
            // Opcional: crear una notificación temporal
            const notification = document.createElement('div');
            notification.className = 'notification';
            notification.textContent = `${productName} añadido al carrito`;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.classList.add('show');
                setTimeout(() => {
                    notification.classList.remove('show');
                    setTimeout(() => {
                        document.body.removeChild(notification);
                    }, 300);
                }, 2000);
            }, 10);
        });
    });
    
    // Mostrar/ocultar carrito al hacer clic en el icono
    if (cartIcon && cartContainer) {
        cartIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            cartContainer.classList.toggle('active');
        });
        
        // Cerrar el carrito al hacer clic fuera
        document.addEventListener('click', function(e) {
            if (!cartContainer.contains(e.target) && e.target !== cartIcon) {
                cartContainer.classList.remove('active');
            }
        });
    }
    
    // Eliminar productos del carrito (para los elementos que ya existen en el HTML)
    closeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const product = e.target.closest('.header__product');
            if (product && count > 0) {
                const productName = product.querySelector('.header__Name').textContent;
                const quantity = cartItems[productName] ? cartItems[productName].quantity : 1;
                const priceText = product.querySelector('.header__Price').textContent;
                const priceNum = parseFloat(priceText.replace('€', '').trim()) / quantity; // Precio por unidad
                
                // Actualizar contador y total
                count -= quantity;
                total -= priceNum * quantity;
                cartCount.textContent = count;
                
                // Eliminar el producto del objeto
                if (cartItems[productName]) {
                    delete cartItems[productName];
                }
                
                product.remove();
                updateCartStatus();
            }
        });
    });
}

// Función para inicializar los botones de cargar más en la página de noticias
function initLoadMoreButtons() {
    const loadMoreNewsBtn = document.getElementById('loadMoreNews');
    const loadMorePostsBtn = document.getElementById('loadMorePosts');
    
    // Manejar carga de más noticias
    if (loadMoreNewsBtn) {
        loadMoreNewsBtn.addEventListener('click', function() {
            // Simular carga con un pequeño retraso
            this.textContent = 'CARGANDO...';
            
            setTimeout(() => {
                // Contenedor para nuevas noticias
                const newsGrid = document.querySelector('.news__grid');
                
                // Crear nuevas noticias
                const newNews = [
                    {
                        image: 'Imagenes/calleposter.jpg',
                        date: '28 de Abril, 2023',
                        title: 'Colaboración especial con diseñadores emergentes',
                        excerpt: 'Spicy Gallery anuncia colaboración con cinco diseñadores emergentes para una colección cápsula que será lanzada en otoño.',
                        fullText: `Nos complace anunciar nuestra próxima colaboración con cinco diseñadores emergentes seleccionados cuidadosamente de diversas escuelas de moda en España. Esta colección cápsula, que se lanzará en otoño, representa una oportunidad única para estos jóvenes talentos de mostrar su visión al mundo.

                        Cada diseñador aportará su perspectiva única, creando una pieza exclusiva que reflejará tanto su estilo personal como la estética de Spicy Gallery. Los diseñadores seleccionados son: María Gómez (Barcelona), especializada en técnicas de upcycling; Juan Martínez (Madrid), que destaca por sus experimentaciones con tintes naturales; Sofía Rodríguez (Valencia), reconocida por sus innovadores patrones deconstruidos; Luis Herrera (Sevilla), que incorpora elementos artesanales tradicionales a diseños urbanos; y Ana Torres (Bilbao), que trabaja con tejidos tecnológicos sostenibles.

                        La colección estará disponible en edición limitada, con solo 50 unidades de cada diseño, y se presentará en un evento especial en Madrid donde los diseñadores compartirán su proceso creativo con la comunidad Spicy.`
                    },
                    {
                        image: 'Imagenes/backgroundpostheader.png',
                        date: '15 de Abril, 2023',
                        title: 'Workshop de personalización de prendas',
                        excerpt: 'Organizamos un workshop exclusivo donde aprenderás a personalizar tus prendas Spicy Gallery con técnicas únicas.',
                        fullText: `¿Quieres darle un toque personal a tus prendas Spicy Gallery? Te invitamos a nuestro primer workshop de personalización que se celebrará los días 6 y 7 de mayo en nuestro showroom de Madrid.

                        Durante estas jornadas de 4 horas cada una, nuestro equipo creativo te enseñará diversas técnicas que puedes aplicar a tus prendas: bordado contemporáneo, aplicación de parches artesanales, técnicas de teñido tie-dye, pintura textil personalizada, y personalización mediante termoadhesivos.

                        El workshop tiene un aforo limitado a 15 personas por sesión para garantizar una atención personalizada. El precio (75€) incluye todos los materiales necesarios y una camiseta Spicy Gallery básica para personalizar. Si lo prefieres, también puedes traer tus propias prendas Spicy Gallery para transformarlas.

                        Además, al finalizar el workshop, los participantes podrán compartir sus creaciones en nuestras redes sociales, y la más votada se convertirá en una edición limitada oficial de Spicy Gallery, con reconocimiento y royalties para su creador.`
                    },
                    {
                        image: 'Imagenes/cajitas.png',
                        date: '5 de Abril, 2023',
                        title: 'Nueva apertura de punto de venta en Barcelona',
                        excerpt: 'Spicy Gallery llega a Barcelona con un nuevo punto de venta en el centro de la ciudad.',
                        fullText: `¡Barcelona, estamos llegando! Nos complace anunciar la apertura de nuestro primer punto de venta permanente en la Ciudad Condal, ubicado en el emblemático Paseo de Gracia.

                        Ubicado en un edificio histórico renovado, nuestro nuevo espacio de 150m² ha sido diseñado por el reconocido estudio de arquitectura Urban Lab, creando un ambiente que fusiona elementos industriales con toques modernos que reflejan perfectamente la estética Spicy Gallery.

                        La inauguración oficial será el próximo 20 de mayo a las 19:00h, con un evento especial que contará con la actuación en directo del DJ Marcos López, cocktails de autor, y una exposición fotográfica sobre la cultura urbana barcelonesa a cargo del colectivo BCN Streets.

                        Además, durante la primera semana de apertura, los visitantes podrán disfrutar de un 15% de descuento en toda la colección, y los primeros 50 clientes recibirán una tote bag exclusiva diseñada en colaboración con el artista local Marc Vidal.`
                    },
                    {
                        image: 'Imagenes/Logonegro.png',
                        date: '1 de Abril, 2023',
                        title: 'Entrevista exclusiva con nuestro fundador',
                        excerpt: 'Conoce la historia detrás de Spicy Gallery en esta entrevista exclusiva con nuestro fundador.',
                        fullText: `Con motivo del quinto aniversario de Spicy Gallery, hemos realizado una entrevista en profundidad a nuestro fundador, Alejandro Méndez, donde nos revela los orígenes de la marca y su visión para el futuro.

                        *¿Cómo nació Spicy Gallery?*
                        "Todo comenzó como un proyecto personal durante mis estudios de diseño. Sentía que había un vacío en el mercado para quienes, como yo, amábamos el streetwear pero buscábamos algo con más personalidad y mejor calidad. Empecé diseñando camisetas para mis amigos, y poco a poco fue creciendo hasta convertirse en lo que es hoy."

                        *¿Cuál ha sido el mayor desafío en estos cinco años?*
                        "Sin duda, mantener nuestra autenticidad mientras crecíamos. Es fácil perder el rumbo cuando empiezas a tener éxito. Siempre hemos querido ser fieles a nuestros valores: diseño atrevido, calidad sin compromisos y respeto por quienes hacen posible cada prenda."

                        *¿Hacia dónde se dirige Spicy Gallery en los próximos años?*
                        "Estamos explorando nuevas categorías más allá de la ropa, como accesorios y objetos de diseño para el hogar. También queremos profundizar en nuestro compromiso con la sostenibilidad, no como una estrategia de marketing, sino como una verdadera transformación de nuestros procesos. Y por supuesto, seguir creando comunidad, que es el corazón de Spicy Gallery."`
                    }
                ];
                
                // Añadir nuevas noticias al grid
                newNews.forEach(news => {
                    const articleHTML = `
                        <article class="news__card">
                            <div class="news__card-image">
                                <img src="${news.image}" alt="${news.title}" class="news__image">
                            </div>
                            <div class="news__card-content">
                                <span class="news__date">${news.date}</span>
                                <h3 class="news__card-title">${news.title}</h3>
                                <p class="news__card-excerpt">${news.excerpt}</p>
                                <a href="#" class="news__card-link">Leer más</a>
                                <div class="news__card-full-text hidden">
                                    <p>${news.fullText}</p>
                                </div>
                            </div>
                        </article>
                    `;
                    
                    newsGrid.insertAdjacentHTML('beforeend', articleHTML);
                });
                
                // Inicializar los botones de leer más para las nuevas tarjetas
                initReadMoreButtons();
                
                // Cambiar texto del botón de nuevo
                this.textContent = 'CARGAR MÁS NOTICIAS';
                
                // Ocultar el botón después de cargar más noticias (simulando que no hay más)
                this.style.display = 'none';
            }, 1000);
        });
    }
    
    // Manejar carga de más artículos de blog
    if (loadMorePostsBtn) {
        loadMorePostsBtn.addEventListener('click', function() {
            // Simular carga con un pequeño retraso
            this.textContent = 'CARGANDO...';
            
            setTimeout(() => {
                // Contenedor para nuevos artículos
                const blogContent = document.querySelector('.blog__content');
                
                // Crear nuevos artículos
                const newArticles = [
                    {
                        image: 'Imagenes/calleposter.jpg',
                        tag: 'Estilo',
                        title: 'Cómo combinar prendas streetwear con piezas formales',
                        excerpt: 'Aprende a mezclar lo mejor de ambos mundos con estos consejos para crear looks únicos que combinen la comodidad del streetwear con la elegancia formal.',
                        date: '1 de Abril, 2023',
                        author: 'Por: Nerea García',
                        fullText: `<strong>Rompiendo las reglas: El nuevo paradigma en la moda</strong><br>
                        La distinción entre ropa formal y streetwear se está difuminando cada vez más. Esta tendencia, que comenzó en las calles y ha llegado hasta las pasarelas más exclusivas, nos permite jugar con las reglas establecidas y crear looks verdaderamente personales.
                        
                        <strong>Claves para un mix exitoso</strong><br>
                        1. <u>El equilibrio es fundamental:</u> Combina una pieza formal con una o dos de streetwear, manteniendo el balance. Por ejemplo, un pantalón sastre con una sudadera gráfica y zapatillas.
                        <br><br>
                        2. <u>Juega con las proporciones:</u> Contrasta piezas oversize con otras más ajustadas. Una camisa formal ajustada puede funcionar perfectamente con unos pantalones anchos estilo skater.
                        <br><br>
                        3. <u>El calzado como elemento clave:</u> Unas zapatillas limpias y minimalistas pueden elevar un conjunto formal, mientras que unos zapatos Oxford pueden dar un giro interesante a un look streetwear.
                        <br><br>
                        4. <u>Atención a los accesorios:</u> Un reloj clásico o un cinturón de cuero de calidad pueden elevar inmediatamente un conjunto casual. Igualmente, una gorra o un beanie bien elegidos pueden dar un toque desenfadado a un conjunto más formal.
                        
                        <strong>Inspiración: Referentes del estilo híbrido</strong><br>
                        Figuras como A$AP Rocky, Virgil Abloh o Zendaya han sido pioneras en este tipo de looks híbridos, mostrando cómo las barreras entre lo formal y lo casual son cada vez más difusas.
                        
                        <strong>Marcas que debes conocer</strong><br>
                        Firmas como Maison Margiela, Jacquemus o Casablanca están creando colecciones que ya contemplan esta fusión de estilos, con piezas que se mueven fluidamente entre ambos mundos.
                        
                        En Spicy Gallery creemos que la verdadera elegancia está en la autenticidad y la confianza para crear tu propio camino. No hay reglas absolutas, solo posibilidades infinitas para expresar quién eres a través de lo que vistes.`
                    },
                    {
                        image: 'Imagenes/backgroundpostheader.png',
                        tag: 'Cultura',
                        title: 'El streetwear y su influencia en la música urbana',
                        excerpt: 'Analizamos la relación simbiótica entre la moda streetwear y los géneros musicales urbanos, y cómo se influencian mutuamente en la cultura contemporánea.',
                        date: '25 de Marzo, 2023',
                        author: 'Por: Esmeralda Sánchez',
                        fullText: `<strong>Ritmo y estilo: Una historia compartida</strong><br>
                        La música urbana y el streetwear han evolucionado en paralelo, nutriéndose e inspirándose mutuamente desde sus orígenes. Desde el hip-hop de los 80 hasta el trap y el reggaetón actual, la expresión musical y la moda han sido dos caras de la misma moneda cultural.
                        
                        <strong>Las raíces: Hip-hop y los inicios del streetwear</strong><br>
                        En los años 80, cuando el hip-hop emergía en Nueva York, los B-boys y raperos no solo creaban un nuevo género musical sino también un código de vestimenta distintivo: zapatillas deportivas, chándales, gorras y joyería ostentosa que se convirtieron en símbolos de identidad y status.
                        
                        <strong>De los márgenes al mainstream</strong><br>
                        Lo que comenzó en las calles del Bronx y Harlem ha conquistado el mundo. Artistas como Run-DMC, con su tema "My Adidas", no solo popularizaron un estilo sino que establecieron el precedente para las colaboraciones entre músicos y marcas de moda que hoy son habituales.
                        
                        <strong>La era digital: Nuevas formas de influencia</strong><br>
                        Con la llegada de las redes sociales, la influencia entre música y moda es más inmediata y global. Un artista puede lanzar un video y crear tendencia en cuestión de horas, mientras que las marcas de streetwear incorporan referencias musicales constantemente.
                        
                        <strong>Casos de estudio: Colaboraciones icónicas</strong><br>
                        - Travis Scott x Nike: Redefiniendo las colaboraciones artista-marca
                        - Bad Bunny x Adidas: Llevando la estética latina al streetwear global
                        - Rosalía x Nike: Fusionando tradición flamenca y urbanidad
                        
                        <strong>El futuro de la relación</strong><br>
                        La línea entre artista musical y creador de moda es cada vez más difusa. Con figuras como Kanye West, Rihanna o Tyler, The Creator estableciendo sus propias marcas, estamos presenciando el nacimiento de un nuevo tipo de creador multidisciplinar que moldea tanto lo que escuchamos como lo que vestimos.
                        
                        En Spicy Gallery, entendemos esta conexión profunda y buscamos siempre incorporar el pulso de la cultura musical en nuestras colecciones, reconociendo que la música no es solo un complemento de la moda, sino parte integral de su ADN.`
                    }
                ];
                
                // Añadir nuevos artículos
                newArticles.forEach(article => {
                    const articleHTML = `
                        <article class="blog__article">
                            <div class="blog__article-image">
                                <img src="${article.image}" alt="${article.title}" class="blog__img">
                            </div>
                            <div class="blog__article-content">
                                <span class="blog__tag">${article.tag}</span>
                                <h3 class="blog__article-title">${article.title}</h3>
                                <p class="blog__article-excerpt">${article.excerpt}</p>
                                <div class="blog__meta">
                                    <span class="blog__date">${article.date}</span>
                                    <span class="blog__author">${article.author}</span>
                                </div>
                                <a href="#" class="blog__read-link">Leer artículo completo</a>
                                <div class="blog__article-full-text hidden">
                                    <p>${article.fullText}</p>
                                </div>
                            </div>
                        </article>
                    `;
                    
                    blogContent.insertAdjacentHTML('beforeend', articleHTML);
                });
                
                // Inicializar los botones de leer más para los nuevos artículos
                initReadMoreButtons();
                
                // Cambiar texto del botón de nuevo
                this.textContent = 'VER MÁS ARTÍCULOS';
                
                // Ocultar el botón después de cargar más artículos (simulando que no hay más)
                this.style.display = 'none';
            }, 1000);
        });
    }
}

// Función para inicializar los botones de leer más
function initReadMoreButtons() {
    // Para las tarjetas de noticias
    const newsCardLinks = document.querySelectorAll('.news__card-link');
    newsCardLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const card = this.closest('.news__card-content');
            const fullText = card.querySelector('.news__card-full-text');
            
            if (fullText) {
                fullText.classList.toggle('hidden');
                
                if (fullText.classList.contains('hidden')) {
                    this.textContent = 'Leer más';
                } else {
                    this.textContent = 'Leer menos';
                }
            }
        });
    });
    
    // Para la noticia destacada
    const featuredReadMore = document.querySelector('.news__readmore');
    if (featuredReadMore) {
        featuredReadMore.addEventListener('click', function(e) {
            e.preventDefault();
            const content = this.closest('.news__featured-content');
            const excerpt = content.querySelector('.news__excerpt');
            
            if (!content.querySelector('.news__full-text')) {
                // Si no existe el texto completo, lo creamos
                const fullText = document.createElement('div');
                fullText.className = 'news__full-text';
                fullText.innerHTML = `<p>${generarTextoCompleto()}</p>`;
                excerpt.after(fullText);
                this.textContent = 'Leer menos';
            } else {
                // Si ya existe, lo alternamos
                const fullText = content.querySelector('.news__full-text');
                fullText.classList.toggle('hidden');
                
                if (fullText.classList.contains('hidden')) {
                    this.textContent = 'Leer más';
                } else {
                    this.textContent = 'Leer menos';
                }
            }
        });
    }
    
    // Para los artículos del blog
    const blogReadLinks = document.querySelectorAll('.blog__read-link');
    blogReadLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const article = this.closest('.blog__article-content');
            const fullText = article.querySelector('.blog__article-full-text');
            
            if (fullText) {
                fullText.classList.toggle('hidden');
                
                if (fullText.classList.contains('hidden')) {
                    this.textContent = 'Leer artículo completo';
                } else {
                    this.textContent = 'Mostrar menos';
                }
            }
        });
    });
}

// Función para generar texto aleatorio completo para noticias
function generarTextoCompleto() {
    return `
        En Spicy Gallery, estamos comprometidos con la innovación y la creatividad en cada diseño que creamos. Esta nueva iniciativa representa un paso adelante en nuestra visión de combinar la moda urbana con un toque distintivo que refleja la personalidad única de cada individuo.
        
        Hemos trabajado arduamente para garantizar que cada detalle cumpla con nuestros estándares de calidad y sostenibilidad. Nuestro equipo de diseñadores ha invertido meses de investigación y desarrollo para traer esta propuesta al mercado.
        
        Lo que hace especial a esta colección es la forma en que integra elementos de la cultura urbana contemporánea con técnicas artesanales tradicionales, creando piezas que son tanto modernas como atemporales. Cada prenda cuenta una historia y está diseñada para aquellos que no temen expresar su individualidad.
        
        Esperamos que esta colección inspire a nuestra comunidad a seguir rompiendo barreras y expresándose libremente a través de la moda. Como siempre decimos en Spicy Gallery: atrévete a ser diferente, atrévete a ser Spicy.
    `;
}

// Función para generar texto aleatorio completo para artículos del blog
function generarTextoCompletoBlog() {
    return `
        <strong>Introducción</strong><br>
        La industria de la moda está en constante evolución, y el streetwear ha demostrado ser mucho más que una tendencia pasajera. A lo largo de los años, hemos visto cómo este estilo nacido en las calles ha influenciado no solo la forma en que nos vestimos, sino también cómo nos expresamos culturalmente.
        
        <strong>Orígenes y Evolución</strong><br>
        El streetwear tiene sus raíces en la cultura skate de California y el hip-hop de Nueva York de finales de los 70 y principios de los 80. Lo que comenzó como ropa cómoda y práctica para skaters y bailarines de break dance se ha convertido en un fenómeno global que ahora vemos en pasarelas de alta costura.
        
        <strong>Impacto Cultural</strong><br>
        Más allá de la ropa, el streetwear representa una actitud y una forma de vida. Es una expresión de autenticidad, rebeldía y originalidad. Las marcas de streetwear más influyentes han construido comunidades fieles que comparten valores y una visión particular del mundo.
        
        <strong>El Futuro del Streetwear</strong><br>
        A medida que la industria de la moda avanza hacia prácticas más sostenibles y conscientes, el streetwear también está evolucionando. Vemos un enfoque creciente en materiales reciclados, procesos de producción ética y diseños que desafían las normas tradicionales de género.
        
        <strong>Conclusión</strong><br>
        En Spicy Gallery, creemos que el futuro del streetwear está en manos de quienes se atreven a experimentar, a romper reglas y a expresar su verdadero yo a través de la moda. Seguiremos innovando y desafiando lo establecido, porque eso es lo que significa ser verdaderamente "spicy".
    `;
}

// Añadir inicialización de todas las funciones al cargar el documento
document.addEventListener('DOMContentLoaded', function() {
    initHamburgerMenu();
    initShoppingCart();
    
    // Inicializar otras funciones si están disponibles en la página actual
    if (document.querySelector('.faq__question')) {
        initFAQAccordion();
    }
    
    if (document.querySelector('.news__card-link') || document.querySelector('.blog__read-link')) {
        initReadMoreButtons();
    }
    
    if (document.getElementById('loadMoreNews') || document.getElementById('loadMorePosts')) {
        initLoadMoreButtons();
    }
    
    // Inicializar el botón "Ver más" si existe
    const moreBtn = document.querySelector('.Shop__Button--more');
    if (moreBtn) {
        moreBtn.addEventListener('click', showMore);
    }
});

function showMore() {
    var moreProducts = document.querySelectorAll(".Shop__product--hidden");
    var btnText = document.querySelector(".Shop__Button--more");
  
    if (moreProducts.length > 0) {
        moreProducts.forEach(product => {
            product.classList.remove("Shop__product--hidden");
            product.classList.add("Shop__product");
        });
        
        if (btnText) {
            btnText.textContent = "Ver menos";
        }
    } else {
        var productsToHide = document.querySelectorAll(".Shop__product[id='hidden']");
        productsToHide.forEach(product => {
            product.classList.remove("Shop__product");
            product.classList.add("Shop__product--hidden");
        });
        
        if (btnText) {
            btnText.textContent = "Ver más";
        }
    }
}




