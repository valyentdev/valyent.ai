FROM node:22-bullseye

# Install code-server
RUN curl -fsSL https://code-server.dev/install.sh | sh

# Create and set the coder user
RUN useradd -m -s /bin/bash coder
USER coder

# Set working directory
WORKDIR /home/coder/project

# Copy the AdonisJS project files
COPY --chown=coder:coder . .

# Install project dependencies
RUN npm install

# Run migrations
RUN node ace migration:run

# Expose code-server port
EXPOSE 8080

# Expose AdonisJS port
EXPOSE 3333

# Start code-server
CMD ["code-server", "--bind-addr", "0.0.0.0:8080", "--auth", "none", "."]