# Build context is the repo root — see backend/Dockerfile for why.
FROM eclipse-temurin:21-jdk AS build
WORKDIR /workspace
COPY . .
RUN ./gradlew :demo-services:demo-service-a:bootJar --no-daemon

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /workspace/demo-services/demo-service-a/build/libs/app.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
