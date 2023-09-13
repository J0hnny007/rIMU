FROM python:3.11-bookworm
LABEL maintainer="j0hnny007"

COPY . /opt/rIMU
WORKDIR /opt/rIMU

RUN pip install -r requirements.txt

EXPOSE 5000

CMD python app.py