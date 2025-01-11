# Use an official Maven image as the base image
FROM openjdk:17
# Set the working directory in the container
WORKDIR /app
# Copy the pom.xml and the project files to the container

COPY . .

RUN chmod +x mvnw

# Build the application using Maven
RUN ./mvnw clean package -DskipTests


# Set the working directory in the container
WORKDIR /app/target

# Copy the built JAR file from the previous stage to the container
#COPY from=build /app/target/backend.jar .
# Set the command to run the application
CMD ["java", "-jar", "backend.jar"]