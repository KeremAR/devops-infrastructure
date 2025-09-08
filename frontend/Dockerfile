FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --production --legacy-peer-deps

FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

# Build arguments for Next.js environment variables
ARG NEXT_PUBLIC_USER_SERVICE_URL
ARG NEXT_PUBLIC_TODO_SERVICE_URL

# Set environment variables for build
ENV NEXT_PUBLIC_USER_SERVICE_URL=$NEXT_PUBLIC_USER_SERVICE_URL
ENV NEXT_PUBLIC_TODO_SERVICE_URL=$NEXT_PUBLIC_TODO_SERVICE_URL

COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
