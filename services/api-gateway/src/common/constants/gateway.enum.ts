export enum GatewayRoutePrefix {
  HEALTH = '/health',
  UPLOAD = '/upload',
  NOTIFICATIONS_GRAPHQL = '/notifications/graphql',
  GRAPHQL = '/graphql',
  SOCKET_IO = '/socket.io',
}

export enum GatewayServiceName {
  API_GATEWAY = 'api-gateway',
  UPLOAD_SERVICE = 'upload-service',
  NOTIFICATION_GRAPHQL = 'notification-graphql',
  BACKEND_GRAPHQL = 'backend-graphql',
  BACKEND_WEBSOCKET = 'backend-websocket',
}

export enum GatewayEnvKey {
  PORT = 'PORT',
  ALLOWED_ORIGINS = 'ALLOWED_ORIGINS',
  BACKEND_SERVICE_URL = 'BACKEND_SERVICE_URL',
  UPLOAD_SERVICE_URL = 'UPLOAD_SERVICE_URL',
  NOTIFICATION_SERVICE_URL = 'NOTIFICATION_SERVICE_URL',
  REDIS_HOST = 'REDIS_HOST',
  REDIS_PORT = 'REDIS_PORT',
  REDIS_PASSWORD = 'REDIS_PASSWORD',
}

export enum GatewayHeader {
  CORRELATION_ID = 'x-correlation-id',
}
