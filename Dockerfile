FROM postgres:16.3

COPY ./data/ /docker-entrypoint-initdb.d/
