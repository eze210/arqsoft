A continuación se detallarán los pasos para correr un escenario básico, y algunas conclusiones a partir de su corrida.


## Requisitos

Los contenedores se levantan con:

```bash
# Opcional, en caso de que la carpeta del proyecto se llame distinto de arqsoft
export COMPOSE_PROJECT_NAME=arqsoft

# Hace falta sólo si hubo algún cambio de código desde la última corrida
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

## Entorno

Se hicieron pruebas con dos microservicios:

 - **Node**: es un microservicio escrito en javascript sobre [Nodejs](https://nodejs.org/en/), usando el framework [Express](https://expressjs.com/). El procesamiento en node es asíncrono y orientado a eventos, lo cual le permite no bloquear el proceso con tareas, que no requieren procesamiento inmediato (por ejemplo: *sleep*, lectura de un archivo, etc.).
 - **Gunicorn**: está escrito en python, usando el framework [Flask](http://flask.pocoo.org/). Se corre usando [gunicorn](https://gunicorn.org/), una herramienta pensada para servir aplicaciones web escritas en python y escalarlas.

Ambos microservicios tienen los mismos endpoints:

 - `/` es un endpoint que retorna un simple string, no hace ningún procesamiento extra.
 - `/timeout` llama a sleep por un tiempo determinado antes de retornar.
 - `/cpu` hace un procesamiento pesado por un tiempo determinado, tratando de usar una máxima cantidad de CPU.
 - `/external` llama a un servicio externo que retorna después de un tiempo determinado. Para este endpoint se utilizó un servicio al que se le puede especificar cuánto tiempo esperar antes de retornar.
 - `/cross` llama al endpoint `/cpu` del otro microservicio: el de node llama al de gunicorn, y viceversa.

Todos los endpoints que hacen procesamiento por un tiempo permiten especificar ese tiempo mediante un parámetro adicional en el request.

Todas las pruebas se hicieron corriendo microservicios en contenedores de docker, con un contenedor con *nginx* que funciona como un proxy reverso. Los entornos para los que se corrieron pruebas son los siguientes:

 - **Node**: Un solo contenedor con el microservicio en Node.
 - **Gunicorn**: Contenedor con el microservicio en python servido con gunicorn con un solo worker.
 - **Node replicado**: 3 contenedores de Node con nginx haciendo de balanceador de carga.
 - **Gunicorn multiworker**: Contenedor de gunicorn con 4 workers.


## Escenarios


### Aclaraciones

Para la definición de los escenarios y su ejecución se utilizó la herramienta [Artillery](https://artillery.io/). A continuación algunos conceptos que utiliza:

 - *Arrival rate*: Configuración `arrivalRate` de artillery. Teóricamente: cantidad de usuarios usando el sitio al mismo tiempo; técnicamente: cantidad de escenarios lanzados por segundo.
 - *Rampa*:  Configuración `rampTo` de artillery. Incremento de arrival rate, uniforme en una `duration` definida.
 - *Fases*: Configuración `phases` de Artillery, permite definir fases consecutivas variando el tiempo de la fase y arrival rate.

 Siguiendo el enlace se pueden ver las especificaciones de la máquina, en la que se corrieron las pruebas: [link](scenario_results.md#resultados-de-las-corridas).

 Para visualizar los resultados utilizamos [Grafana](https://grafana.com/).


### Ping

Este escenario se probó con dos fases:

 - Una rampa de 0 a 10 usuarios durante 40 segundos.
 - Carga constante de 10 usuarios durante 80 segundos.

El único request que hacen los usuarios es al endpoint que devuelve un simple string. Nuestra expectativa es que todos los entornos puedan procesarlos sin problemas.


#### Resultados

[Link a screenshots](scenario_results.md#ping).

Todos los entornos soportaron la prueba sin errores ni degradar notablemente la performance. En todos los entornos el tiempo mediano de respuesta fue de aproximadamente 10ms.

Es interesante que todos los entornos experimentan un pico de tiempo de procesamiento en el arranque, de 100-150 ms. Posiblemente sea el primer request que recibe el servicio y todavia no tiene preparado un cierto cache que reutiliza en requests subsiguientes.

También es notorio cómo el escenario de Gunicorn multiworker tiene varios picos de ese tipo, particularmente 4. Una suposición es que no arranca usando los 4 workers, sino que los va iniciando a medida que los necesita, y los picos corresponden con los inicios de cada worker. Esta suposición explicaría la cantidad de picos observados.


### Básico

Este escenario se desarrolla en las mismas fases que el escenario de ping, la diferencia es que ahora hay un 10% de probabilidad de hacer requests al enpoint externo que retorna después de esperar *1 segundo*, y otro 10% de hacer request al endpoint de cpu, que retorna después de *1 segundo* de procesamiento. El resto de los requests se hace al endpoint que devuelve un string.


#### Resultados

[Link a screenshots y sumarios](scenario_results.md#escenario-basico).

 En todos los entornos se puede ver que la mediana de tiempo de respuesta es creciente conforme pasa el tiempo del escenario. Se puede suponer que en todos los casos esto se debe a que hacia el final del escenario llegan muchas más mediciones de los endpoints que tardan más, y eso hace que la mediana tienda hacia valores más altos. Sin embargo, además de este comentario en general, a continuación se observan particularidades de cada caso.

 - *Gunicorn*: Los requests rápidos se fueron bloqueando por otros que llevan tiempo, se fueron acumulando requests pendientes hasta llegar a un pico de casi 600 requests pendientes. A medida que llegaban más requests, el tiempo de respuesta promedio fue aumentando hasta llegar a un minuto, con picos de 1.5 minutos. En un momento los requests empezaron a fallar (entre los logs aparecian errores de nginx, aparentemente no puede soportar tantos requests encolados sin responder). En el sumario se puede ver que más de la mitad de los requests fallaron por algún motivo: 431 request devolvió 504 (Gateway timeout), 21 devolvió 502 (Bad gateway) y 85 fallaron con ECONNRESET.
 En este entorno se observó la peor performance por una gran diferencia. Esta performance tan pobre se debe a que el procesamiento en este entorno se bloquea tanto con una request al endpoint externo, como con el que tiene mucho procesamiento de cpu.

 - *Node*: la performance de este entorno fue considerablemente mejor, aunque sigue sin ser aceptable comparada con los que analizaremos más adelante. Durante la fase de la rampa se comportó relativamente bien (con un tiempo de respuesta un poco elevado, pero aceptable), pero en la fase de la carga comenzó a acumular requests pendientes aumentando el tiempo de respuesta promedio. Dicho tiempo fue de 9 segundos a lo largo de toda la corrida, pero al final llegó a los 20, con picos de 50 segundos.
 Es importante señalar que, como se puede ver en el sumario, todos los requests devolvieron exitosamente status 200, en vez de fallar como en el caso de gunicorn.
 Gran parte de las mejoras se puede atribuir a que node no necesita bloquearse durante requests a servicios externos, y puede estar procesando otros requests en el transcurso. En este punto vale la aclaración de que esto también se debe a cómo está programado el endpoint: si el endpoint enviara la request al servidor externo y se quedara en una suerte de busy-waiting preguntando si la request terminó, en vez de utilizar eventos, se observarían resultados similares a los de Gunicorn.

 - *Node replicado*: este entorno dio muy buenos resultados en comparación con los demás. El tiempo de respuesta no se degradó a medida que fue aumentando la carga, sino que se mantuvo en promedio en 200ms, con picos constantes de 3 segundos: se ve cómo los requests que llevan una mayor cantidad de tiempo no degradan la performance de los requests que tienen que terminar rápido.
 Se puede suponer que esto es debido al algoritmo del load-balancer, que busca mantener algún valor (en este caso se observan unos 3 segundos) aproximadamente constante para esos picos.
 Es notorio también que, si bien tanto para requests externas como para uso de cpu se pide que terminen en 1 segundo, el *p95* del sumario es un poco mayor a 2 segundos: eso se debe a que docker tiene asignadas sólo 2 cores para utilizar. Esto sumado a que el escenario hace aproximadamente 2 de cada 10 requests que tardan 1 segundo (cpu y llamada a un servicio externo), con una frecuencia 10 requests por segundo, provoca los 3 segundos que se observan como picos.
 Todos los requests terminaron exitosamente.

 - *Gunicorn multiworker*: dio resultados parecidos al de *node replicado* a lo largo de la prueba, aunque degradados bruscamente hacia el final. La mediana del tiempo de procesamiento se mantuvo muy baja a lo largo de la ejecución, pero al final se disparó hasta 3 segundos. Los picos se mantuvieron entre 2 y 3 segundos, disparandose hasta casi 5 al final. Esto responde al comportamiento que se describió en general antes de hablar de cada caso.
 Es probable que el valor de casi 5 segundos se deba a que justo la última ventana de samples fue de requests cpu/externos que quedaron procesándose después de terminar todos los requests rápidos. Si ese fue el caso, podemos declarar la performance de este entorno en el escenario dado como aceptable. Incluso en algún caso real podría ser mejor/deseable que se dé prioridad a las requests que deberían tardar menos, dejando las que se espera que tarden más para el final, y en dicho caso los resultados de este entorno podrían considerarse mejores que los de *node replicado*.


### CPU Intensive

La idea de este escenario es probar cómo afectan los requests del tipo cpu a la performance de los servicios.
Para ello el escenario se ejecuta durante 2 minutos, con un rampTo de 600 con una probabilidad de que ocurra un request cpu (alto procesamiento) de solo 0.01%; los demás requests serán del tipo ping (bajo procesamiento)


## Resultados

[Link a screenshots y sumarios](scenario_results.md#escenario-con-muchos-requests-del-tipo-pings-y-algunos-requests-del-tipo-cpu).

 - *Gunicorn*: En el caso del servidor Gunicorn con 1 solo worker, se puede apreciar en los gráficos que al ocurrir algún request del tipo cpu, el servidor comienza a encolar los requests restantes en el único worker, generando así un tiempo de respuesta mayor al esperado para un request del tipo ping (casi instantáneo) y hasta errores de conexión (timeout). Mirando el gráfico en los lugares donde ocurren los requests del tipo cpu, claramente se ve como por un lado aumentan los errores de conexion, como aumentan la cantidad de requests pendientes (encolados en el servicio) y como aumenta los tiempos de respuesta para cada request (los picos marcan los momentos donde se produjeron esos requests del tipo cpu)

 - *Node*: En el caso de Node, la situación es muy parecida a la que se observó con el servidor Gunicorn ya que como se puede ver en el gráfico, en un principio donde no había ocurrido ningún request del tipo cpu, el tiempo de respuesta para todos los request pings so sufría desviaciones y los requests en sí se lograban procesar. Luego, claramente cuando se observa que un request del tipo cpu se comenzó a procesar, esto causó que el thread principal de Node se ocupe de procesar el mismo, consumiendo toda la cpu en él y bloqueando a los demás request que venían detrás de él. Por ello se puede observar como a partir de la ejecución de ese requests, los errores de timeout y la cantidad de requests pendientes aumentan; así como el tiempo de respuesta para máximo.

 - *Gunicorn multiworker*: En el caso del servidor Gunicorn con varios workers, la situación fue diferente, ya que mirando el gráfico, ocurrieron requests del tipo cpu, al ser pocos (menos que la cantidad de workers), los workers que debían procesar esos requests lo hacían y los demás se ocupaban de procesar los demás requests del tipo ping sin ningún problema. Por lo tanto no se observa ningún error de timeout, sólo unos pocos requests pendientes que tardaron un poco más en procesarse y algunos picos en los tiempos de respuesta que coinciden con los momentos donde ocurrieron los requests del tipo cpu (que claramente van a tardarse más en resolverse). Sólo resta aclarar que el hecho de que no haya habido errores y los requests se hayan podido procesar correctamente ocurrió a causa de que la distribución de carga por parte de nginx se realizó correctamente sobre los workers; sino, si hubieran caido todos los requests sobre el mismo worker, hubieramos estado en un caso muy similar al de Gunicorn

 - *Node replicado*: Al tener varias réplicas de Node, se puede observar un caso similar al de Gunicorn multiworkers en el sentido de que los requests del tipo cpu,al ser pocos (menos que la cantidad de réplicas de Node), pueden ser procesados cada uno por una réplica y dejar que los demás requests (ping en este caso) se procesen por las réplicas libres, ya que las réplicas procesando los requests del tipo cpu estarán bloqueando el thread principal del servicio y consumiendo todo su procesamiento en ese request. Tal como se observa en el gráfico, al ocurrir los requests cpu, no se registran picos de errores (solo un aumento de la respuesta máxima ya que estos requests tardarán más en procesarse). Por otro lado, algo que se observa a diferencia del caso Gunicorn multiworker es que sí hubieron algunos pocos errores de timeout y en el mismo momento que ocurrieron ese tipo de requests se incrementó un poco la cantidad de requests pendientes, que si bien no es significativa, es probable que se deba a que varios requests cayeron en la misma réplica mientras se estaba procesando ese tipo de requests.



### Requests Cruzados

En este escenario se plantea un esquema en el que los servicios se llaman entre ellos: los endpoints de node llaman a los de gunicorn, y viceversa.
El escenario tiene las mismas etapas que el de ping, pero usando el endpoint */cross* en vez de usar */*.
Como se dijo anteriormente, el endpoint */cross* llama al endpoint */cpu* de otro entrono.
*Nota:* diremos que el entorno al que se le llama a */cross* está "atendiendo", mientras que al que se le llama a */cpu* está "procesando".


#### Resultados

[Link a screenshots y sumarios](scenario_results.md#escenario-de-requests-cruzados).

Para este escenario se ven resultados muy similares para los cuatro entornos:
Se observa cómo se van acumulando requests que cada vez tardan más tiempo en ser respondidas debido a que también tardan más en ser atendidas.
A continuación se explica por qué si bien los cuatro entornos no se comportan de la misma manera, muestran los mismos resultados:

 - *Gunicorn*: este entorno tiene un solo worker atendiendo a todos los clientes, y delegando en uno de los endpoints del entorno *Node*. Esto causa que se pueda estar atendiendo sólo un request del cliente al mismo tiempo. Aquí el "cuello de botella" es el único worker de gunicorn, aunque solamente escalarlo (ver *Gunicorn multiworker*) tampoco hubiese mejorado la situación.

 - *Node*: en este caso, se *atienden* varios requests de clientes al mismo tiempo, pero se delegan todos en un único worker de gunicorn. Entonces si bien se están *atendiendo* varias requests simultáneas, se está *procesando* sólo una request al mismo tiempo, siendo nuevamente el único worker de *Gunicorn* el responsable.

 - *Node replicado*: para seguir ilustrando el caso, el endpoint de este entorno delega en el único worker del entorno *Gunicorn*. Se puede entender que este entorno es un caso en el que se evolucionó desde la arquitectura anterior (Node), escalando en el lugar equivocado, ya que el cuello de botella estaba en el servicio externo.

 - *Gunicorn multiworker*: por último, el caso en que el servidor que se escala es el de *Gunicorn*, cuando este está más cerca del cliente (y llama al endpoint de *Node*), el cuello de botella pasa a estar en el endpoint */cpu* de *Node*, ya que está usando su cpu para procesar de a una request a la vez. En este caso el asincronismo de Node no ayuda porque se está usando el hilo para hacer cálculos en vez de establecer un evento y su handler (como pasaba en el endpoint de */timeout*, o bien cuando *Node* estaba atendiendo en vez de procesar en este mismo escenario).

 En conclusión, si el análisis anterior es acertado, una arquitectura en la que se llame al entorno *Node* para atender, y a alguno de los replicados para procesar, hubiese aumentado la performance. Sin embargo, a menos que se tengan 10 cores procesando (ya sea en una o en varias máquinas) no se podrían resolver todas las requests en 1 segundo cada una. 
