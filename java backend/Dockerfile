# Stage 1: Build stage
FROM maven:3.9.6-eclipse-temurin-25 AS build
WORKDIR /app

# Copy the entire backend directory (since we are in the 'java backend' root directory)
COPY . .

# Build production jar without running tests to save build time
RUN mvn clean package -DskipTests

# Stage 2: Runtime stage
FROM eclipse-temurin:25-jre-jammy
RUN groupadd -r appgroup && useradd -r -g appgroup appuser
WORKDIR /app
COPY --from=build /app/ncl-itsm-config/target/ncl-itsm-config-*.jar app.jar
RUN chown -R appuser:appgroup /app
USER appuser
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1
ENTRYPOINT ["java", "-jar", "app.jar"]
