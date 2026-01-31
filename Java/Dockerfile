# Build with: docker build --build-arg ARTIFACTORY_USER=<user> --build-arg ARTIFACTORY_TOKEN=<token> ...
# Base images from JFrog docker-virtual (run: docker login tompazus.jfrog.io first)
FROM tompazus.jfrog.io/docker-virtual/library/maven:3.9-eclipse-temurin-21-alpine AS builder

ARG ARTIFACTORY_USER
ARG ARTIFACTORY_TOKEN

# Maven reads credentials from env via settings.xml (jfrog mvn-virtual)
ENV ARTIFACTORY_USER=${ARTIFACTORY_USER}
ENV ARTIFACTORY_TOKEN=${ARTIFACTORY_TOKEN}

WORKDIR /app

COPY pom.xml .
COPY settings.xml .

# Resolve all Maven dependencies through JFrog mvn-virtual
RUN mvn -s settings.xml dependency:go-offline -B

COPY src ./src

RUN mvn -s settings.xml package -DskipTests -B

FROM tompazus.jfrog.io/docker-virtual/library/eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY --from=builder /app/target/plusone-app-1.0.0.jar app.jar

EXPOSE 5000

CMD ["java", "-jar", "app.jar", "--server.port=5000"]
