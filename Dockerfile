FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
RUN apk add --no-cache python3 bind-tools \
    && mkdir -p /app/api /data

COPY --from=build /app/dist /usr/share/nginx/html
COPY api/server.py /app/api/server.py
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh

RUN sed -i 's/\r$//' /docker-entrypoint.sh \
    && chmod +x /docker-entrypoint.sh

ENV DATA_DIR=/data \
    API_PORT=3001 \
    NOTIFY_EMAIL=comercial@superbaglda.com.br \
    FROM_EMAIL=noreply@superbaglondrina.com.br

VOLUME ["/data"]
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD python3 -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1/api/health', timeout=3).read()" || exit 1

CMD ["/docker-entrypoint.sh"]
