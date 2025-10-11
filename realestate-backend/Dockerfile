# Stage 1: Build the JAR using Maven
FROM maven:3.9.3-eclipse-temurin-17 AS build
WORKDIR /app

# Copy the Maven configuration first to leverage caching
COPY pom.xml .

# Copy source code
COPY src ./src

# Build the JAR (skip tests for faster builds)
RUN mvn clean package -DskipTests

# Stage 2: Create the runtime image
FROM eclipse-temurin:17-jdk
WORKDIR /app

# Copy the JAR from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose Spring Boot port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
