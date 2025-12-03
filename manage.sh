#!/bin/bash

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

ENV_FILE=".env"
EXAMPLE_FILE=".env.example"

# Función para cargar variables
load_env() {
    if [ -f "$ENV_FILE" ]; then
        export $(grep -v '^#' "$ENV_FILE" | xargs)
    fi
}

# Función para crear .env si no existe
check_env() {
    if [ ! -f "$ENV_FILE" ]; then
        echo -e "${BLUE}Creando archivo .env desde ejemplo...${NC}"
        cp "$EXAMPLE_FILE" "$ENV_FILE"
    fi
    load_env
}

# Función para actualizar una variable en .env
update_env() {
    local key=$1
    local value=$2
    # Escapar caracteres especiales para sed
    local escaped_value=$(printf '%s\n' "$value" | sed -e 's/[\/&]/\\&/g')
    
    if grep -q "^$key=" "$ENV_FILE"; then
        sed -i "s/^$key=.*/$key=$escaped_value/" "$ENV_FILE"
    else
        echo "$key=$value" >> "$ENV_FILE"
    fi
}

# Menú de Configuración
configure() {
    echo -e "${BLUE}--- Configuración ---${NC}"
    
    read -p "Puerto SFTP [${SFTP_PORT:-2222}]: " port
    port=${port:-${SFTP_PORT:-2222}}
    update_env "SFTP_PORT" "$port"
    
    read -p "Usuario SFTP [${SFTP_USER:-sftpuser}]: " user
    user=${user:-${SFTP_USER:-sftpuser}}
    update_env "SFTP_USER" "$user"
    
    read -p "Contraseña SFTP [${SFTP_PASSWORD:-password123}]: " pass
    pass=${pass:-${SFTP_PASSWORD:-password123}}
    update_env "SFTP_PASSWORD" "$pass"

    echo -e "${BLUE}Ruta de la carpeta local a compartir:${NC}"
    echo "  Ejemplo Linux: /home/usuario/Documents/SFTP"
    echo "  Ejemplo Windows: /c/Users/Usuario/Documents/SFTP"
    read -p "Ruta [${HOST_UPLOAD_DIR:-./data}]: " dir
    dir=${dir:-${HOST_UPLOAD_DIR:-./data}}
    update_env "HOST_UPLOAD_DIR" "$dir"

    read -p "Token Cloudflare Tunnel (Opcional, Enter para saltar): " token
    if [ ! -z "$token" ]; then
        update_env "CLOUDFLARE_TOKEN" "$token"
    fi
    
    echo -e "${GREEN}Configuración guardada en .env${NC}"
    load_env
}

# Iniciar servicios
start() {
    echo -e "${BLUE}Iniciando servicios...${NC}"
    if [ ! -z "$CLOUDFLARE_TOKEN" ]; then
        docker-compose --profile tunnel up -d --build
    else
        docker-compose up -d --build
    fi
    echo -e "${GREEN}Servicios iniciados.${NC}"
    show_info
}

# Detener servicios
stop() {
    echo -e "${BLUE}Deteniendo servicios...${NC}"
    docker-compose --profile tunnel down
    echo -e "${GREEN}Servicios detenidos.${NC}"
}

# Mostrar información de conexión
show_info() {
    load_env
    echo -e "\n${BLUE}--- Información de Conexión ---${NC}"
    echo -e "Usuario: ${GREEN}$SFTP_USER${NC}"
    echo -e "Contraseña: ${GREEN}$SFTP_PASSWORD${NC}"
    echo -e "Puerto Local: ${GREEN}$SFTP_PORT${NC}"
    
    # Obtener IP local (intento básico)
    local_ip=$(hostname -I | awk '{print $1}')
    echo -e "IP Local: ${GREEN}$local_ip${NC}"
    
    echo -e "\n${BLUE}Comando para conectar por SSH:${NC}"
    echo -e "ssh -p $SFTP_PORT $SFTP_USER@localhost"
    echo -e "ssh -p $SFTP_PORT $SFTP_USER@$local_ip"

    if [ ! -z "$CLOUDFLARE_TOKEN" ]; then
        echo -e "\n${BLUE}Cloudflare Tunnel:${NC}"
        echo "Revisa el dashboard de Cloudflare Zero Trust para ver tu dominio público."
    fi
}

# Abrir sesión SSH
open_ssh() {
    echo -e "${BLUE}Conectando al contenedor...${NC}"
    docker exec -it sftp_server bash
}

# Menú Principal
main_menu() {
    check_env
    while true; do
        echo -e "\n${BLUE}=== Gestor SFTP Docker ===${NC}"
        echo "1. Iniciar / Reiniciar"
        echo "2. Detener"
        echo "3. Configurar (Puerto, Usuario, Ruta)"
        echo "4. Ver Información de Conexión"
        echo "5. Abrir Terminal SSH (en contenedor)"
        echo "6. Salir"
        read -p "Selecciona una opción: " opt
        
        case $opt in
            1) start ;;
            2) stop ;;
            3) configure ;;
            4) show_info ;;
            5) open_ssh ;;
            6) exit 0 ;;
            *) echo -e "${RED}Opción inválida${NC}" ;;
        esac
    done
}

# Ejecutar menú
main_menu
