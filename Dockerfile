FROM python:3.11-bookworm
LABEL maintainer="j0hnny007"

COPY . /opt/rIMU
WORKDIR /opt/rIMU

RUN pip install -r requirements.txt

EXPOSE 8085

CMD gunicorn --bind 0.0.0.0:8085 wsgi:app