FROM python:3.9-slim-buster

WORKDIR /app

COPY . .

RUN pip3 install Flask

EXPOSE 20030

CMD ["python3", "generator.py"]
