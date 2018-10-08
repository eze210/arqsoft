import time
import logging
from flask import Flask, request
import urllib.request

app = Flask(__name__)
app.logger.setLevel(logging.INFO)

DEFAULT_PROCESS_TIME = 5


@app.route('/')
def root():
    app.logger.info('Requested /, saying "Hola, mundo"')

    return 'Hola, mundo!'


@app.route('/timeout')
def timeout():
    process_time = request.args.get('processTime') or DEFAULT_PROCESS_TIME
    app.logger.info('Requested /timeout, sleeping %s seconds', process_time)

    time.sleep(int(process_time))
    app.logger.info('Finished sleeping, returning!')
    return 'Timeout reached at: {}'.format(time.time())


@app.route('/cpu')
def cpu_usage():
    process_time = request.args.get('processTime') or DEFAULT_PROCESS_TIME
    app.logger.info('Requested /cpu, using cpu for % seconds', process_time)

    start = time.time()

    while time.time() - start < int(process_time):
        987239478234879 * 98723947823947

    app.logger.info('Finished using cpu, returning!')
    return 'Finished using cpu!'


@app.route('/external')
def external_request():
    process_time = request.args.get('processTime') or DEFAULT_PROCESS_TIME
    process_time_in_seconds = int(process_time) * 1000
    url = 'https://httpstat.us/200?sleep=' + str(process_time_in_seconds)

    app.logger.info('Requested /external, making a request to ' + url)
    response = urllib.request.urlopen(url)

    app.logger.info('External endpoint responded, returning!')
    return 'External service request finished with status: ' + str(response.status)


if __name__ == '__main__':
    app.run()
