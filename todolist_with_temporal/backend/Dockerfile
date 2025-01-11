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



RUN curl -sSL "https://github.com/fullstorydev/grpcurl/releases/download/v1.8.7/grpcurl_1.8.7_linux_x86_64.tar.gz" | tar -xz -C /usr/local/bin



# Copy the built JAR file from the previous stage to the container
#COPY from=build /app/target/backend.jar .
# Set the command to run the application
CMD ["java", "-jar", "backend.jar"]