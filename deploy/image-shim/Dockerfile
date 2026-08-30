# 生图翻译层 —— 零依赖,不需要 npm install
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -g 1001 -S nodejs && adduser -S shim -u 1001
COPY --chown=shim:nodejs *.js ./
USER shim
EXPOSE 8080
CMD ["node", "server.js"]
