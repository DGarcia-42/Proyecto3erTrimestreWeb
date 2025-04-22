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

document.addEventListener('DOMContentLoaded', () => {

    initFAQAccordion();
    
    
});
