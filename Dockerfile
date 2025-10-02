### Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY .npmrc* ./  
RUN npm ci --silent
COPY . .
RUN npm run build

### Production stage
FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["/usr/sbin/nginx", "-g", "daemon off;"]
