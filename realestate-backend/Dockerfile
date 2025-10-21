# =========================================
# STAGE 1: Build the application using Maven
# =========================================
FROM maven:3.8.5-openjdk-17 AS build

# Set working directory
WORKDIR /app

# Copy pom.xml first (to leverage Docker cache for dependencies)
COPY pom.xml .

# Copy the source code
COPY src ./src

# Build the JAR (skip tests to speed up build)
RUN mvn clean package -DskipTests

# =========================================
# STAGE 2: Create a lightweight runtime image
# =========================================
FROM openjdk:17-slim

# Set working directory
WORKDIR /app

# Copy the JAR from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose the port your Spring Boot app runs on
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
