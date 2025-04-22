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

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar el acordeón de FAQ si existe en la página
    initFAQAccordion();
    
    // Inicializar el menú hamburguesa
    initHamburgerMenu();
});
