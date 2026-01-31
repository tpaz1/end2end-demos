# end2end-demos

Simple **plusone** API applications in Python, Go, Java, and JavaScript. Each app exposes `GET /plusone/<number>` and returns the number plus one (plain text). All dependencies are resolved through **JFrog Artifactory** at `tompazus.jfrog.io`.

## JFrog Artifactory setup

All apps are configured to pull:

- **Package dependencies** from your Artifactory virtual repos (pip, Go modules, Maven, npm).
- **Docker base images** from `docker-virtual` (e.g. `tompazus.jfrog.io/docker-virtual/...`).

### 1. Create an identity token (or API key)

In [JFrog Cloud](https://tompazus.jfrog.io):

1. Open **Identity and Access** → **Users** → your user → **Edit**.
2. Create an **Identity Token** or use your **API Key** (under **Generate API Key**).

Use this as `ARTIFACTORY_TOKEN` in the steps below. Your Artifactory username is `ARTIFACTORY_USER`.

### 2. Log in to the Docker registry

Base images are pulled from JFrog. Log in once per machine:

```bash
docker login tompazus.jfrog.io
# Username: <your Artifactory username>
# Password: <your Artifactory token or API key>
```

### 3. Build with credentials

Each Dockerfile expects build args for resolving packages from Artifactory. Use your Artifactory username and token/API key:

```bash
export ARTIFACTORY_USER=<your-username>
export ARTIFACTORY_TOKEN=<your-token-or-api-key>
```

Then build, for example:

```bash
# Python (python-virtual, docker-virtual)
docker build --build-arg ARTIFACTORY_USER --build-arg ARTIFACTORY_TOKEN -t plusone-python ./Python
docker run -p 5000:5000 plusone-python

# Go (go-virtual, docker-virtual)
docker build --build-arg ARTIFACTORY_USER --build-arg ARTIFACTORY_TOKEN -t plusone-go ./Go
docker run -p 5000:5000 plusone-go

# Java (mvn-virtual, docker-virtual)
docker build --build-arg ARTIFACTORY_USER --build-arg ARTIFACTORY_TOKEN -t plusone-java ./Java
docker run -p 5000:5000 plusone-java

# JavaScript (npm-virtual, docker-virtual)
docker build --build-arg ARTIFACTORY_USER --build-arg ARTIFACTORY_TOKEN -t plusone-js ./Javascript
docker run -p 5000:5000 plusone-js
```

Test: `curl http://localhost:5000/plusone/41` → `42`.

### 4. Docker Compose (build and run all apps)

From the repo root, with credentials set (e.g. in `.env`):

```bash
# Optional: copy and fill in credentials so Compose can use them
cp .env.example .env
# Edit .env and set ARTIFACTORY_USER and ARTIFACTORY_TOKEN

# Rebuild all images and start all four apps in the background
docker-compose up -d --build
```

Each run of `docker-compose up -d --build` rebuilds all four images and starts the containers. Apps are exposed on:

| Service   | URL                      |
|----------|---------------------------|
| Python   | http://localhost:5000     |
| Go       | http://localhost:5001     |
| Java     | http://localhost:5002     |
| JavaScript | http://localhost:5003   |

Example: `curl http://localhost:5000/plusone/41` (Python), `curl http://localhost:5001/plusone/41` (Go), etc.

Stop everything: `docker-compose down`.

### Why builds can be slow

- **First run** – Four images are built and all dependencies are downloaded from Artifactory (and base images from docker-virtual). That’s a lot of network I/O.
- **Java** – Spring Boot pulls a large dependency tree (dozens of BOMs and hundreds of artifacts). Maven `dependency:go-offline` plus `package` often takes several minutes.
- **Cache** – Docker reuses layers when the Dockerfile and inputs (e.g. `pom.xml`, `package.json`, `go.mod`, `requirements.txt`) are unchanged. **If you change `ARTIFACTORY_USER` or `ARTIFACTORY_TOKEN` in `.env`, every image’s dependency layer is invalidated** and pip/go/mvn/npm run again.
- **Tips** – Keep `.env` stable between builds so dependency layers stay cached. After the first successful build, only change code (e.g. `app.js`, `app.go`); then only the final steps rebuild and it’s much faster. To rebuild a single app: `docker-compose build python` (or `go`, `java`, `javascript`).

## GitHub Actions (OIDC + build info)

Each app has a workflow under `.github/workflows/` that:

1. **Authenticates with OIDC (preferred) or token**
   - **OIDC:** Set `vars.JF_URL` and `vars.JF_OIDC_PROVIDER_NAME`, and configure [OpenID Connect in JFrog](https://jfrog.com/help/r/jfrog-platform-administration-documentation/configure-jfrog-platform-oidc-integration-with-github-actions). The `setup-jfrog-cli` step gets a short-lived token from JFrog and exposes **`oidc-user`** and **`oidc-token`** as step outputs. The workflow uses those for Docker login and Dockerfile build args (no static JFrog secrets needed when OIDC is configured).
   - **Fallback (no OIDC):** Set `secrets.JF_USER` and `secrets.JF_ACCESS_TOKEN`; the “Set auth for Docker” step uses them when OIDC outputs are not set.
2. **Uses JFrog CLI** for the language client and Docker: `jfrog/setup-jfrog-cli` (with `id: setup-jfrog-cli`) configures the CLI; a “Set auth for Docker” step sets `ARTIFACTORY_USER` and `ARTIFACTORY_TOKEN` from OIDC outputs or secrets for Docker login and build args.
3. **Publishes build info** so each build in Artifactory shows **dependencies**, the **Docker image**, **git**, and **env**:
   - Dependencies are recorded by running the package manager via JFrog CLI (`jf pip install`, `jf go build`, `jf mvn ...`, `jf npm install`) with the same build name/number.
   - The image is added by `jf rt docker-push` with the same build name/number.
   - At the end each workflow runs **`jf rt build-collect-env`**, **`jf rt build-add-git`**, and **`jf rt build-publish`** so the build in Artifactory includes environment variables and git info.

If we only ran `docker build` and `jf docker push`, build info would contain the image but not the pip/go/maven/npm dependencies. Running the language client with JFrog CLI in the pipeline fixes that; dependencies and image are in one build.

**Required GitHub config**

- **Variables:** `JF_URL` (e.g. `https://tompazus.jfrog.io`).
- **OIDC (recommended):** In JFrog, add an OIDC integration and identity mapping for your repo; set `vars.JF_OIDC_PROVIDER_NAME` to the provider name. No JFrog secrets needed for Docker or CLI when OIDC is used.
- **Fallback (no OIDC):** `secrets.JF_USER`, `secrets.JF_ACCESS_TOKEN` (for JFrog CLI, Docker login, and Dockerfile build args).

Each workflow runs **only** when:
- There is a push (or merge) to **`main`**, and
- At least one changed file is under that app’s folder or its workflow file (`Python/**` or `.github/workflows/python.yml`, etc.).

So a change only under `Python/` runs the Python pipeline; a change only under `Go/` runs the Go pipeline, and so on. Workflows can also be run manually via **Run workflow** (`workflow_dispatch`).

## Repository mapping

| Language   | Package repo   | Docker base images |
|-----------|----------------|--------------------|
| Python    | python-virtual | docker-virtual     |
| Go        | go-virtual     | docker-virtual     |
| Java      | mvn-virtual    | docker-virtual     |
| JavaScript| npm-virtual    | docker-virtual     |

## Per-app dependencies (all resolved via Artifactory)

- **Python**: FastAPI, Uvicorn, python-dotenv, structlog
- **Go**: gorilla/mux
- **Java**: Spring Boot Web, Spring Boot Validation
- **JavaScript**: express, morgan
