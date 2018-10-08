
# Resultados de las corridas

Los siguientes resultados fueron obtenidos en una máquina con las siguientes specs:

```
Macbook con MacOS 10.13.5
Docker for Mac 18.06.1-ce-mac73
Procesador: 2,7 GHz Intel Core i5
Memoria: 8 GB 1867 MHz DDR3
```

## Ping

### Gunicorn

 - Comando: `./run-scenario basic gunicorn`

#### Screenshots

![Escenarios Lanzados][images/ping/gun_ping_launches.png]
![Requests][images/ping/gun_ping_reqs.png]
![Tiempo de respuesta][images/ping/gun_ping_response_time.png]

### Node

 - Comando: `./run-scenario basic gunicorn`

#### Screenshots

![Escenarios Lanzados][images/ping/node_ping_launches.png]
![Requests][images/ping/node_ping_reqs.png]
![Tiempo de respuesta][images/ping/node_ping_response_time.png]

### Node replicado

 - Comando: `./run-scenario basic node_replicated`

#### Screenshots

![Escenarios Lanzados][images/ping/noderep_ping_launches.png]
![Requests][images/ping/noderep_ping_reqs.png]
![Tiempo de respuesta][images/ping/noderep_ping_response_time.png]

### Gunicorn multiworker

 - Comando: `./run-scenario basic gunicorn_multiworker`

#### Screenshots

![Escenarios Lanzados][images/ping/gunmw_ping_launches.png]
![Requests][images/ping/gunmw_ping_reqs.png]
![Tiempo de respuesta][images/ping/gunmw_ping_response_time.png]


## Escenario basico

### Gunicorn

 - Comando: `./run-scenario basic gunicorn`

#### Sumario

```
All virtual users finished
Summary report @ 18:06:29(-0300) 2018-10-08
  Scenarios launched:  1001
  Scenarios completed: 916
  Requests completed:  916
  RPS sent: 5.44
  Request latency:
    min: 4.4
    max: 92397.4
    median: 59938.8
    p95: 71725.4
    p99: 86841.6
  Scenario counts:
    Simple get: 802 (80.12%)
    Heavy load: 85 (8.492%)
    Extarnal request: 114 (11.389%)
  Codes:
    200: 464
    502: 21
    504: 431
  Errors:
    ECONNRESET: 85
```

#### Screenshots

![Escenarios Lanzados][images/basic/gun_basic_launches.png]
![Requests][images/basic/gun_basic_reqs.png]
![Tiempo de respuesta][images/basic/gun_basic_response_time.png]


### Node

 - Comando: `./run-scenario basic node`

#### Sumario

```
All virtual users finished
Summary report @ 17:59:21(-0300) 2018-10-08
  Scenarios launched:  1012
  Scenarios completed: 1012
  Requests completed:  1012
  RPS sent: 7.2
  Request latency:
    min: 3
    max: 52402.2
    median: 4945.6
    p95: 25231.7
    p99: 45342.6
  Scenario counts:
    Simple get: 800 (79.051%)
    Heavy load: 113 (11.166%)
    Extarnal request: 99 (9.783%)
  Codes:
    200: 1012
```

#### Screenshots

![Escenarios Lanzados][images/basic/node_basic_launches.png]
![Requests][images/basic/node_basic_reqs.png]
![Tiempo de respuesta][images/basic/node_basic_response_time.png]


## Node replicado

 - Comando: `./run-scenario basic node_replicated`

#### Sumario

```
All virtual users finished
Summary report @ 17:35:33(-0300) 2018-10-08
  Scenarios launched:  1000
  Scenarios completed: 1000
  Requests completed:  1000
  RPS sent: 8.55
  Request latency:
    min: 3.1
    max: 3930.3
    median: 17.4
    p95: 2237.6
    p99: 2922.9
  Scenario counts:
    Simple get: 803 (80.3%)
    Heavy load: 81 (8.1%)
    Extarnal request: 116 (11.6%)
  Codes:
    200: 1000
```

#### Screenshots

![Escenarios Lanzados][images/basic/noderep_basic_launches.png]
![Requests][images/basic/noderep_basic_reqs.png]
![Tiempo de respuesta][images/basic/noderep_basic_response_time.png]


## Gunicorn multiworker

 - Comando: `./run-scenario basic node`

#### Sumario

```
All virtual users finished
Summary report @ 17:41:03(-0300) 2018-10-08
  Scenarios launched:  997
  Scenarios completed: 997
  Requests completed:  997
  RPS sent: 8.34
  Request latency:
    min: 3.3
    max: 5065
    median: 80.7
    p95: 2971.7
    p99: 4253.1
  Scenario counts:
    Simple get: 795 (79.739%)
    Extarnal request: 99 (9.93%)
    Heavy load: 103 (10.331%)
  Codes:
    200: 997
```

#### Screenshots

![Escenarios Lanzados][images/basic/gunmw_basic_launches.png]
![Requests][images/basic/gunmw_basic_reqs.png]
![Tiempo de respuesta][images/basic/gunmw_basic_response_time.png]
