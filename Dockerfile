# Use Java 17
FROM eclipse-temurin:17-jdk

# Set working directory
WORKDIR /app

# Copy everything from repo
COPY . .

# Give permission to mvnw (important for Linux)
RUN chmod +x mvnw

# Build the project (skip tests for faster build)
RUN ./mvnw clean package -DskipTests

# Expose port (Spring Boot)
EXPOSE 8080

# Run the jar
CMD ["java", "-jar", "target/servicehub-0.0.1-SNAPSHOT.jar"]