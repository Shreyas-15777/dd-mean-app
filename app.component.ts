# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Build Angular application
RUN npm run build

# Runtime stage - use lightweight nginx
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder stage
COPY --from=builder /app/dist/angular-15-crud /usr/share/nginx/html

# Create non-root user for security
RUN addgroup -g 101 -S nginx-user && \
    adduser -S nginx-user -u 101 && \
    chown -R nginx-user:nginx-user /usr/share/nginx/html

USER nginx-user

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
