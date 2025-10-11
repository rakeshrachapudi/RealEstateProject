#
# STAGE 1: Build the application using Maven
#
# Use a Maven image that includes the JDK to build the application
FROM maven:3.8.5-openjdk-17 AS build

# Copy source code
COPY src ./src

# Build the JAR (skip tests for faster builds)
RUN mvn clean package -DskipTests

# Stage 2: Create the runtime image
FROM eclipse-temurin:17-jdk
WORKDIR /app

# Copy the pom.xml file to download dependencies first, leveraging Docker's layer caching
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy the rest of your application's source code
COPY src ./src

# Build the application, creating the .jar file.
# The -DskipTests flag is optional but can speed up the build.
RUN mvn package -DskipTests

#
# STAGE 2: Create the final, lightweight production image
#
# Use a slim JRE (Java Runtime Environment) image, which is smaller than a full JDK
FROM openjdk:17-slim

# Set the working directory
WORKDIR /app

# Copy the .jar file from the 'build' stage into this new image
COPY --from=build /app/target/*.jar app.jar

# Expose the port your application runs on (e.g., 8080 for Spring Boot)
EXPOSE 8080

# The command to run your application when the container starts
ENTRYPOINT ["java", "-jar", "app.jar"]
