document.addEventListener('DOMContentLoaded', function() {
    // Configuración de la ruleta
    const sections = [
        { text: "10% DESCUENTO", color: "#FF5252", class: "discount-10" },
        { text: "15% DESCUENTO", color: "#FF9800", class: "discount-15" },
        { text: "5% DESCUENTO", color: "#4CAF50", class: "discount-5" },
        { text: "ENVÍO GRATIS", color: "#2196F3", class: "free-shipping" },
        { text: "20% DESCUENTO", color: "#9C27B0", class: "discount-20" },
        { text: "REGALO SORPRESA", color: "#FFEB3B", class: "surprise-gift" },
        { text: "30% DESCUENTO", color: "#F44336", class: "discount-30" },
        { text: "CUPÓN 2x1", color: "#3F51B5", class: "coupon-2x1" }
    ];
    
    // Verificar si ya se ha girado la ruleta anteriormente
    const hasSpun = localStorage.getItem('wheelSpun') === 'true';
    
    const wheel = document.getElementById('wheel');
    const spinButton = document.getElementById('spinButton');
    const result = document.getElementById('result');
    const discountResult = document.getElementById('discountResult');
    const discountCode = document.getElementById('discountCode');
    
    // Si ya se ha girado la ruleta, deshabilitar el botón y mostrar el resultado guardado
    if (hasSpun) {
        spinButton.disabled = true;
        const savedDiscount = localStorage.getItem('wheelDiscount');
        const savedCode = localStorage.getItem('wheelCode');
        const savedClass = localStorage.getItem('wheelClass');
        
        if (savedDiscount && savedCode) {
            discountResult.textContent = savedDiscount;
            discountCode.textContent = savedCode;
            if (savedClass) discountResult.className = `wheel-result__discount ${savedClass}`;
            result.classList.add('wheel-result--visible');
        }
    }
    
    // Crear secciones de la ruleta
    sections.forEach((section, index) => {
        const sectionElement = document.createElement('div');
        sectionElement.className = 'wheel__section';
        sectionElement.style.backgroundColor = section.color;
        sectionElement.style.transform = `rotate(${index * (360 / sections.length)}deg)`;
        
        const textElement = document.createElement('span');
        textElement.className = `wheel__section-text ${section.class}`;
        textElement.textContent = section.text;
        
        // Centrar el texto en cada sección
        textElement.style.textAlign = 'center';
        textElement.style.width = '100%';
        textElement.style.display = 'inline-block';
        
        sectionElement.appendChild(textElement);
        wheel.appendChild(sectionElement);
    });
    
    // Función para generar un código de descuento aleatorio
    function generateDiscountCode() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        
        // Generar un código de 8 caracteres
        for (let i = 0; i < 8; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            code += characters.charAt(randomIndex);
        }
        
        return code;
    }
    
    // Crear el indicador de premio actual
    const currentPrizeIndicator = document.createElement('div');
    currentPrizeIndicator.className = 'current-prize-indicator';
    currentPrizeIndicator.textContent = 'Premio actual: --';
    document.querySelector('.wheel-controls').insertBefore(currentPrizeIndicator, spinButton);
    
    // Función para actualizar el indicador de premio actual
    function updateCurrentPrize(currentDegrees) {
        const sectionDegrees = 360 / sections.length;
        const normalizedDegrees = currentDegrees % 360;
        const currentSectionIndex = Math.floor(normalizedDegrees / sectionDegrees);
        const currentSection = sections[sections.length - 1 - currentSectionIndex];
        
        currentPrizeIndicator.textContent = `Premio actual: ${currentSection.text}`;
        currentPrizeIndicator.style.backgroundColor = currentSection.color;
        currentPrizeIndicator.style.color = 'white';
        
        // Añadir la clase específica para este premio
        currentPrizeIndicator.className = `current-prize-indicator ${currentSection.class}`;
    }
    
    // Función para girar la ruleta
    spinButton.addEventListener('click', function() {
        // Deshabilitar el botón permanentemente
        spinButton.disabled = true;
        
        // Ocultar el resultado anterior
        result.classList.remove('wheel-result--visible');
        
        // Calcular grados aleatorios (entre 2 y 5 vueltas completas)
        const rotations = 2 + Math.random() * 3;
        const degrees = rotations * 360;
        
        // Calcular la sección ganadora
        const sectionDegrees = 360 / sections.length;
        const landingDegrees = degrees % 360;
        const sectionIndex = Math.floor(landingDegrees / sectionDegrees);
        const winningSection = sections[sections.length - 1 - sectionIndex];
        
        // Generar código de descuento
        const code = generateDiscountCode();
        
        // Configurar animación para mostrar los premios por los que pasa
        let currentRotation = 0;
        const animationDuration = 5000; // 5 segundos
        const updateInterval = 100; // Actualizar cada 100ms
        const startTime = Date.now();
        
        // Iniciar la animación de giro
        wheel.style.transition = 'transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
        wheel.style.transform = `rotate(${degrees}deg)`;
        
        // Actualizar el indicador de premio durante la animación
        const updateAnimation = () => {
            const elapsedTime = Date.now() - startTime;
            if (elapsedTime < animationDuration) {
                // Calcular la rotación actual basada en el tiempo transcurrido
                const progress = elapsedTime / animationDuration;
                currentRotation = progress * degrees;
                updateCurrentPrize(currentRotation);
                requestAnimationFrame(updateAnimation);
            } else {
                // Animación completa, mostrar el premio final
                updateCurrentPrize(degrees);
                currentPrizeIndicator.classList.add('winning-prize');
                currentPrizeIndicator.textContent = `¡GANASTE: ${winningSection.text}!`;
                
                // Mostrar el resultado
                discountResult.textContent = winningSection.text;
                discountResult.className = `wheel-result__discount ${winningSection.class}`;
                discountCode.textContent = code;
                result.classList.add('wheel-result--visible');
                
                // Guardar en localStorage que ya se ha girado la ruleta
                localStorage.setItem('wheelSpun', 'true');
                localStorage.setItem('wheelDiscount', winningSection.text);
                localStorage.setItem('wheelCode', code);
                localStorage.setItem('wheelClass', winningSection.class);
            }
        };
        
        // Iniciar la actualización de la animación
        updateAnimation();
    });
});