import pino from 'pino'

export const logger = pino({
  level: process.env.NODE_ENV === 'test' ? 'silent' : 'info',
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'req.body.currentPassword',
      'req.body.token',
      'req.body.accessToken',
      'res.headers["set-cookie"]',
    ],
    remove: true,
  },
})
