# Use the official PostgreSQL image as a base
FROM postgres:latest

# Set environment variables for PostgreSQL
ENV POSTGRES_DB postgres
ENV POSTGRES_USER root
ENV POSTGRES_PASSWORD test1234   


# Copy your SQL schema file into the container
COPY ../backend/schema.sql /docker-entrypoint-initdb.d/

EXPOSE 5432
# (Optional) If you need additional configuration, copy a custom postgresql.conf file
# COPY postgresql.conf /etc/postgresql/postgresql.conf
