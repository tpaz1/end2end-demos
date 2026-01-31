# Build with: docker build --build-arg ARTIFACTORY_USER=<user> --build-arg ARTIFACTORY_TOKEN=<token> ...
# Base image from JFrog docker-virtual (run: docker login tompazus.jfrog.io first)
FROM tompazus.jfrog.io/docker-virtual/library/node:20-alpine

ARG ARTIFACTORY_USER
ARG ARTIFACTORY_TOKEN

WORKDIR /app

COPY package.json .

# Resolve all npm dependencies through JFrog npm-virtual.
# Use _authToken (Bearer) so identity tokens (JWT) work; Basic auth from /auth often fails with JWT.
RUN echo "registry=https://tompazus.jfrog.io/artifactory/api/npm/npm-virtual/" > .npmrc && \
    echo "//tompazus.jfrog.io/artifactory/api/npm/npm-virtual/:_authToken=${ARTIFACTORY_TOKEN}" >> .npmrc && \
    echo "//tompazus.jfrog.io/artifactory/api/npm/npm-virtual/:always-auth=true" >> .npmrc && \
    npm install && \
    rm -f .npmrc

COPY app.js .

EXPOSE 5000

CMD ["node", "app.js"]
