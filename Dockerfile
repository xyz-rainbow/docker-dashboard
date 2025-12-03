FROM ubuntu:latest

# Install OpenSSH Server
RUN apt-get update && apt-get install -y openssh-server && \
    mkdir /var/run/sshd && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Configure SSH for SFTP
# We will use the internal-sftp subsystem
RUN sed -i 's/Subsystem\s*sftp\s*\/usr\/lib\/openssh\/sftp-server/Subsystem sftp internal-sftp/' /etc/ssh/sshd_config

# Allow password authentication (can be disabled if using keys, but user asked for simple setup)
RUN sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 22

ENTRYPOINT ["/entrypoint.sh"]
