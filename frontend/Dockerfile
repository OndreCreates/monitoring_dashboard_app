# Build stage
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage — static build served by nginx, not the Vite dev server.
# VITE_API_BASE_URL is baked in at build time; if unset here, client.ts falls
# back to http://localhost:8080, which is correct anyway since the browser
# (not the container) is what calls the backend, via the host-mapped port.
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 5173
