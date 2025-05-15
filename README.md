# Spicy Gallery - Instrucciones de Instalación

## Requisitos Previos
- Ubuntu Server en VMware
- Apache2
- mod_headers habilitado
- Git

## Pasos de Instalación

1. Instalar Apache2:
```bash
sudo apt update
sudo apt install apache2
```

2. Instalar Git:
```bash
sudo apt install git
```

3. Habilitar módulos necesarios:
```bash
sudo a2enmod headers
sudo a2enmod rewrite
```

4. Clonar el repositorio del proyecto:
```bash
cd /var/www
sudo git clone https://github.com/DGarcia-42/Proyecto3erTrimestreWeb.git spicygallery
```

5. Configurar permisos:
```bash
sudo chown -R www-data:www-data /var/www/spicygallery
sudo chmod -R 755 /var/www/spicygallery
```

6. Copiar archivo de configuración:
```bash
sudo cp spicygallery.conf /etc/apache2/sites-available/
```

7. Habilitar el sitio:
```bash
sudo a2ensite spicygallery.conf
sudo a2dissite 000-default.conf
```

8. Configurar hosts locales (en la máquina host):
```
127.0.0.1 spicygallery.local
127.0.0.1 www.spicygallery.local
```

9. Reiniciar Apache:
```bash
sudo systemctl restart apache2
```

## Verificación
- Accede a http://spicygallery.local desde tu navegador
- Revisa los logs en caso de errores:
  ```bash
  sudo tail -f /var/log/apache2/spicygallery_error.log
  ```

## Actualización del Proyecto
Para actualizar el proyecto con nuevos cambios:
```bash
cd /var/www/spicygallery
sudo git pull origin main
```

## Estructura del Proyecto
```
/var/www/spicygallery/
├── css/
│   └── style.css
├── js/
│   └── dom.js
└── html/
    ├── index.html
    ├── aboutus.html
    ├── shop.html
    ├── news.html
    ├── joinus.html
    ├── juego-pares.html
    └── confirmar-compra.html
``` 