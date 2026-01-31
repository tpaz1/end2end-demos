# Build with: docker build --build-arg ARTIFACTORY_USER=<user> --build-arg ARTIFACTORY_TOKEN=<token> ...
# Base image from JFrog docker-virtual (run: docker login tompazus.jfrog.io first)
FROM tompazus.jfrog.io/docker-virtual/library/python:3.12-slim

# JFrog Artifactory credentials for resolving Python deps from python-virtual
ARG ARTIFACTORY_USER
ARG ARTIFACTORY_TOKEN

COPY requirements.txt .
COPY app.py .

# Resolve all Python dependencies through JFrog python-virtual
RUN pip install --no-cache-dir \
    --index-url "https://${ARTIFACTORY_USER}:${ARTIFACTORY_TOKEN}@tompazus.jfrog.io/artifactory/api/pypi/python-virtual/simple" \
    -r requirements.txt

# Expose port
EXPOSE 5000

# Start the server
CMD ["python", "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "5000"]
