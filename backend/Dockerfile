FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /workspace
COPY pom.xml .
RUN mvn -B -q dependency:go-offline
COPY src ./src
RUN mvn -B -q -DskipTests package

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
RUN useradd --system --uid 1001 app && chown app:app /app
USER app
COPY --from=build /workspace/target/agenda-1.0.0.jar app.jar
EXPOSE 8080
ENV JAVA_OPTS=""
ENV SPRING_PROFILES_ACTIVE=docker
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar app.jar"]
