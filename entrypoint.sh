#!/bin/bash

# Default values if not provided
USER_NAME=${SFTP_USER:-sftpuser}
USER_PASS=${SFTP_PASSWORD:-password123}
USER_UID=${SFTP_UID:-1000}

# Create user if it doesn't exist
if ! id -u "$USER_NAME" > /dev/null 2>&1; then
    echo "Creating user $USER_NAME with UID $USER_UID..."
    # Create user with home directory
    useradd -m -u "$USER_UID" -s /bin/bash "$USER_NAME"
    # Set password
    echo "$USER_NAME:$USER_PASS" | chpasswd
fi

# Create upload directory if it doesn't exist and set permissions
# We need a directory that the user can write to.
# SSH Chroot requires the root of the home directory to be owned by root and not writable by others if we were doing strict chroot.
# For this simple setup, we are just giving them a home directory.

# Ensure the home directory exists and has correct ownership
chown "$USER_NAME:$USER_NAME" "/home/$USER_NAME"

# If we have a mounted volume at /home/$USER_NAME/upload, ensure permissions
if [ -d "/home/$USER_NAME/upload" ]; then
    echo "Setting permissions for upload directory..."
    chown "$USER_NAME:$USER_NAME" "/home/$USER_NAME/upload"
fi

echo "Starting SSH Server..."
exec /usr/sbin/sshd -D -e
