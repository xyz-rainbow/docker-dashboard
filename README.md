# Servidor SFTP/SSH en Docker

Este proyecto te permite levantar un servidor SFTP/SSH seguro dentro de un contenedor Docker, mapeando una carpeta local de tu sistema para acceder a ella remotamente.

## 🚀 Inicio Rápido (Nuevo Script de Gestión)

Hemos incluido un script interactivo para facilitar la configuración y el uso.

### 1. Ejecutar el Asistente
En tu terminal (Git Bash, WSL o Linux), ejecuta:

```bash
./manage.sh
```

Este script te permitirá:
*   **Iniciar/Detener** el servidor.
*   **Configurar** puertos, usuario, contraseña y carpeta compartida.
*   **Ver información** de conexión (IP, comandos SSH).
*   **Abrir una terminal SSH** directamente en el contenedor.
*   **Activar Cloudflare Tunnel** para acceso público seguro.

### 2. Configuración Manual (Opcional)
Si prefieres no usar el script, puedes configurar todo mediante variables de entorno en un archivo `.env`.

1.  Copia el ejemplo: `cp .env.example .env`
2.  Edita `.env` con tus preferencias:

```bash
# Ejemplo de .env
SFTP_USER=miusuario
SFTP_PASSWORD=micontrasena
SFTP_PORT=2222
# Ruta absoluta a tu carpeta local
HOST_UPLOAD_DIR=/c/Users/TuUsuario/Documents/MiCarpeta
# Opcional: Token de Cloudflare
CLOUDFLARE_TOKEN=
```

3.  Ejecuta: `docker-compose up -d`

## 📂 Mapeo de Carpetas (Volúmenes)

El servidor necesita saber qué carpeta de tu computadora quieres compartir.

*   **Windows (Docker Desktop)**:
    *   Formato: `/c/Users/TuUsuario/Documents/...`
    *   Ejemplo: `/c/Users/Juan/Documents/Proyectos`

*   **Linux**:
    *   Formato: `/home/tuusuario/Documents/...`
    *   Ejemplo: `/home/juan/Documents/Proyectos`

Puedes configurar esto fácilmente usando la opción "Configurar" del script `manage.sh`.

## ☁️ Acceso Remoto con Cloudflare Tunnel

Si deseas acceder a tu servidor SFTP desde cualquier lugar sin abrir puertos en tu router:

1.  Obtén un token de Cloudflare Tunnel (Zero Trust Dashboard).
2.  Ejecuta `./manage.sh` y selecciona "Configurar".
3.  Introduce tu token cuando se te pida.
4.  Reinicia el servidor con la opción 1.

El túnel se iniciará automáticamente junto con el servidor SFTP.

## 🔧 Comandos Útiles

*   **Conectar por SSH (Local)**:
    ```bash
    ssh -p 2222 miusuario@localhost
    ```
*   **Ver logs**:
    ```bash
    docker-compose logs -f
    ```
