from flask import Flask
import time

app = Flask(__name__)


@app.route("/")
def root():
    return "Hola, mundo!"


@app.route("/timeout")
def timeout():
    time.sleep(5)
    return "Timeout reached at: {}".format(time.time())


if __name__ == '__main__':
    app.run()
