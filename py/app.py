import time
import logging
from flask import Flask
import urllib.request

app = Flask(__name__)
app.logger.setLevel(logging.INFO)


@app.route('/')
def root():
    app.logger.info('Requested /, saying "Hola, mundo"')
    return 'Hola, mundo!'


@app.route('/timeout')
def timeout():
    app.logger.info('Requested /timeout, sleeping 5 seconds')
    time.sleep(5)
    return 'Timeout reached at: {}'.format(time.time())


@app.route('/cpu')
def cpu_usage():
    app.logger.info('Requested /cpu, using cpu for 5 seconds')
    start = time.time()

    while time.time() - start < 5:
        987239478234879 * 98723947823947

    return 'Finished using cpu!'


@app.route('/external')
def external_request():
    url = 'https://httpstat.us/200?sleep=5000'
    app.logger.info('Requested /external, making a request to ' + url)
    response = urllib.request.urlopen(url)
    return 'External service request finished with status: ' + str(response.status)


if __name__ == '__main__':
    app.run()
