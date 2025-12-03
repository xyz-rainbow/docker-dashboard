# Nexus Panel (v2.0)

**Nexus Panel** es un dashboard web moderno y modular para la gestión integral de servidores, contenedores Docker y máquinas virtuales.

> ⚠️ **Rama de Desarrollo**: Estás en la rama `v2-dashboard`. Esta rama contiene exclusivamente el código fuente del panel web (Next.js). Para el servidor SFTP standalone, cambia a la rama `v1-sftp-standalone`.

## 🚀 Características (En Desarrollo)

*   **Arquitectura Modular**: Basado en Next.js 14+ (App Router).
*   **Multilenguaje**: Soporte nativo para Inglés, Español, Chino, Hindi y Francés.
*   **Gestión de Recursos**: Monitorización y control de CPU/RAM en tiempo real.
*   **Docker & VMs**: Interfaz unificada para contenedores y virtualización.

## 🛠️ Instalación y Desarrollo

1.  **Instalar dependencias**:
    ```bash
    npm install
    ```

2.  **Iniciar servidor de desarrollo**:
    ```bash
    npm run dev
    ```

3.  **Construir para producción**:
    ```bash
    npm run build
    npm start
    ```

## 🌐 Estructura del Proyecto

*   `/app`: Rutas y páginas (App Router).
*   `/components`: Componentes de UI reutilizables.
*   `/messages`: Archivos de traducción (i18n).
*   `/lib`: Lógica de negocio y utilidades.
