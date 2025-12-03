# Servidor SFTP/SSH en Docker

Este proyecto te permite levantar un servidor SFTP/SSH seguro dentro de un contenedor Docker, mapeando una carpeta local de tu sistema (como "Documents") para acceder a ella remotamente.

## 🚀 Inicio Rápido

### 1. Configuración
Si quieres cambiar el usuario o contraseña, edita el archivo `docker-compose.yml`:
```yaml
environment:
  - SFTP_USER=miusuario
  - SFTP_PASSWORD=micontrasena
```

### 2. Mapear tu carpeta
Por defecto, este proyecto crea una carpeta `data` en el directorio actual.
Para mapear una carpeta de tus Documentos, edita la sección `volumes` en `docker-compose.yml`:

**Windows (Docker Desktop):**
```yaml
volumes:
  - /c/Users/TuUsuario/Documents/MiCarpetaSFTP:/home/miusuario/upload
```
*Nota: Asegúrate de que la carpeta local exista.*

### 3. Ejecutar
Abre una terminal en esta carpeta y ejecuta:
```bash
docker-compose up -d --build
```

### 4. Conectar
Puedes conectar usando cualquier cliente SFTP (FileZilla, WinSCP) o terminal:
- **Host**: `localhost`
- **Puerto**: `2222`
- **Usuario**: `miusuario` (o el que hayas configurado)
- **Contraseña**: `micontrasena`

Comando de terminal:
```bash
sftp -P 2222 miusuario@localhost
```

---

## 🧠 ¿Cómo funciona? (Explicación Detallada)

Aquí explico los conceptos clave que hacen que esto funcione, respondiendo a tu pregunta original.

### 1. El Contenedor (`Dockerfile`)
Creamos una "mini computadora" virtual basada en Ubuntu.
- Instalamos `openssh-server`: El programa que maneja las conexiones SSH y SFTP.
- Configuramos SSH: Habilitamos el subsistema SFTP y permitimos acceso con contraseña.

### 2. El Script de Inicio (`entrypoint.sh`)
Docker es efímero (se reinicia "limpio"). Este script se ejecuta cada vez que arranca el contenedor:
- Crea el usuario que definiste en las variables de entorno.
- Asigna los permisos correctos a la carpeta interna.
- Inicia el servidor SSH.

### 3. La Conexión (`docker-compose.yml`)
Aquí es donde ocurre la magia de la integración con tu sistema:

- **Puertos (`2222:22`)**:
  - El contenedor escucha en el puerto `22` (estándar SSH).
  - Tu computadora (host) redirige el tráfico de su puerto `2222` hacia el `22` del contenedor.
  - Usamos `2222` para no chocar con el SSH de tu propio sistema o de Windows.

- **Volúmenes (`./data:/home/...`)**:
  - Esto es el "puente" entre tu disco duro y el contenedor.
  - Cualquier archivo que pongas en tu carpeta local aparecerá instantáneamente dentro del contenedor en `/home/miusuario/upload`.
  - Y viceversa: lo que subas por SFTP aparecerá en tu carpeta de Documentos.

## 📋 Requisitos
- Docker y Docker Compose instalados.
