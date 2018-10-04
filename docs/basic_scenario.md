A continuación se detallarán los pasos para correr un escenario básico, y algunas conclusiones a partir de su corrida.

## Requisitos

Los contenedores se levantan con:

```bash
# Opcional, en caso de que la carpeta del proyecto se llame distinto de arqsoft
export COMPOSE_PROJECT_NAME=arqsoft

# Hace falta solo si hubo algún cambio de código desde la última corrida
docker-compose build

docker-compose up -d --scale node=3
```

Para configurar grafana, hay que hacer lo siguiente:

 - Crear un *data source* de Graphite, apuntando a `localhost:8090`
 - Importar el dashboard desde el archivo `perf/dashboard.json`

Para correr los scripts de artillery, una forma es usar el script `run-scenraio.sh`, pasandole el nombre del scenario (nombre del archivo de configuración) y el entorno en el que se va a correr (definido en el archivo de configuración).

```bash
cd perf
# Ejemplo de corrida con escenario basic en entorno node
./run-scenraio.sh basic node
```

## Escenario

### Aclaraciones

 - *Arrival rate*: Configuración `arrivalRate` de artillery. Cantidad de escenarios lanzados por segundo.
 - *Rampa*:  Configuración `rampTo` de artillery. Incremento de arrival rate, uniforme en un `duration` definido.

## Resultados
