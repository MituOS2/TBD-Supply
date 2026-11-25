# Stage 1: Build Kotlin Multiplatform Compose Wasm frontend
FROM eclipse-temurin:21-jdk AS wasm-builder

WORKDIR /app

# Install git to fetch UI framework composite build
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# Clone Miuix UI framework
RUN git clone https://github.com/compose-miuix-ui/miuix.git vendor/miuix && \
    cd vendor/miuix && git checkout d8efe187

# Copy gradle wrapper and configuration files
COPY gradle/ gradle/
COPY gradlew gradlew.bat build.gradle.kts settings.gradle.kts gradle.properties ./
COPY webApp/ webApp/

# Grant execution rights and compile Wasm frontend
RUN chmod +x gradlew && ./gradlew :webApp:wasmJsBrowserDistribution -Prelease --no-daemon

# Stage 2: Production Server with Node.js 24
FROM node:24-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=10000
ENV SEED_DEMO_CATALOG=true

# Copy server files
COPY server/ server/
COPY package.json ./

# Copy compiled WebAssembly distribution from builder stage
COPY --from=wasm-builder /app/webApp/build/dist/wasmJs/productionExecutable/ server/dist-web/

EXPOSE 10000

CMD ["node", "server/src/index.js"]
