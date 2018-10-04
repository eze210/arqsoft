FROM python:3.6.5

ENV GUNICORN_WORKERS 1

RUN mkdir /usr/app

# Donde quiero estar parado adentro de la imagen
WORKDIR /usr/app

# Copia del filesystem a la imagen
COPY ./app.py ./app.py

RUN pip install flask gunicorn

# Lo que hay que ejecutar una vez que ya esta todo instalado es desde aca
#ENTRYPOINT [ "gunicorn", "-w", "1", "app:app", "-b", "0.0.0.0:8000" ]

ENTRYPOINT gunicorn -w $GUNICORN_WORKERS app:app -b 0.0.0.0:8000
