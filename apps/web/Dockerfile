FROM node:20-alpine AS builder
WORKDIR /app
COPY apps/web/package*.json ./
RUN npm install
COPY tsconfig.base.json /tsconfig.base.json
COPY apps/web ./
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/next.config.mjs ./
RUN npm install --omit=dev && npm cache clean --force
EXPOSE 3000
CMD ["npm", "start"]
