from flask import Flask

app = Flask(__name__)

#endpoint: lugares donde se pueden conectar
#gunicorn es compatible con CGI

@app.route("/")
def root():
	return "Hola, mundo!"


@app.route("/hola")
def root_hola():
	return "Hola"


if __name__ == '__main__':
	app.run()

