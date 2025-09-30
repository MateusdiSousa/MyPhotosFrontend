FROM node:20-alpine as builder-stage

WORKDIR /app

COPY . .

RUN npm install

RUN npm run build

FROM nginx:alpine

# Remover a configuração padrão se existir
# RUN rm -f /etc/nginx/nginx.conf

COPY --from=builder-stage /app/nginx.conf /etc/nginx/nginx.conf

COPY --from=builder-stage /app/dist/my-photos/browser /usr/share/nginx/html

EXPOSE 80
