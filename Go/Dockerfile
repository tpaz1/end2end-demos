# Build with: docker build --build-arg ARTIFACTORY_USER=<user> --build-arg ARTIFACTORY_TOKEN=<token> ...
# Base images from JFrog docker-virtual (run: docker login tompazus.jfrog.io first)
FROM tompazus.jfrog.io/docker-virtual/library/golang:1.21-alpine AS builder

ARG ARTIFACTORY_USER
ARG ARTIFACTORY_TOKEN

WORKDIR /app

COPY go.mod go.sum* ./
COPY app.go .

# Resolve all Go dependencies through JFrog go-virtual (go mod tidy populates go.sum)
ENV GOPROXY="https://${ARTIFACTORY_USER}:${ARTIFACTORY_TOKEN}@tompazus.jfrog.io/artifactory/api/go/go-virtual"
RUN go mod tidy && go build -o plusone .

FROM tompazus.jfrog.io/docker-virtual/library/alpine:3.19

WORKDIR /app

COPY --from=builder /app/plusone .

EXPOSE 5000

CMD ["./plusone"]
