from datetime import datetime, timedelta
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, make_response
from flask.sessions import SessionInterface
from flask_mysqldb import MySQL
from flask_wtf import CsrfProtect
from flask import session
from werkzeug.security import generate_password_hash
from werkzeug.security import check_password_hash
from functools import wraps

from config import DevelopmentConfig

import json
import sys
import jwt

app = Flask(__name__)

#MySQL connection
app.config["MYSQL_HOST"] = "localhost"
app.config["MYSQL_USER"] = "root"
app.config["MYSQL_PASSWORD"] = "123"
app.config["MYSQL_DB"] = "python"
app.config["MYSQL_PORT"] = 3307
mysql = MySQL(app)

#settings
app.config.from_object(DevelopmentConfig)
csrf = CsrfProtect()

@app.errorhandler(404)
def page_not_found(e):
    return render_template("404.html"), 404

@app.before_request
def before_request():
    try:
        token = session["token"]
    except:
        token = ""
        print("The token does not exist")

    roles2 = {
        "role1": ["addUser", "insert_user", "delete_user","update_user", "get_user", "home"],
        "role2": ["addUser", "insert_user", "delete_user","update_user"]
    }

    if not token and request.endpoint in ["delete_user", "Index", "addUser", "insert_user", "get_user", "update_user"]:
        return redirect(url_for("login"))
    try:
        data = jwt.decode(token, "secret", algorithms=["HS256"])

        if request.endpoint in ["login"] :
            flash("Ya estas logueado", "error")
            return redirect(url_for("Index"))

        elif session["role"] in list(roles2) and request.endpoint in roles2[session["role"]] :
            flash("No tienes permisos", "error")
            return redirect(url_for("Index"))
        
    except:
        print("Invalid token")
        if request.endpoint in ["delete_user", "Index", "addUser", "insert_user", "get_user", "update_user"] :
            return redirect(url_for("login"))


@app.route("/")
def root():
    return redirect(url_for("login"))


@app.route("/ajax-login", methods = ["POST"])
def ajax_login():
    response = ""
    try:
        username = request.form["username"]
        password = request.form["password"]
        cur = mysql.connection.cursor()
        user = cur.execute("SELECT u.*, r.name FROM users AS u INNER JOIN role AS r ON u.idrole = r.idrole   WHERE user = %s LIMIT 1", [username])
        data = cur.fetchall()
        if user > 0 and check_password_hash(data[0][5], password) :
            token = jwt.encode({
                "username": username,
                "exp": (datetime.utcnow() + timedelta(minutes=30))
            }, "secret")
            session["token"] = token 
            session["role"] = data[0][6]
            response = {"status": True, "mensaje": "Successfully authenticated"}
        else :
            response = {"status": False, "mensaje": "Incorrect username or password"}
    except:
        print(str(sys.exc_info()[0]))
        response = {"status": 400, "mensaje": "Error: an exemption occurred"}
    return response


@app.route("/login")
def login():
    return render_template("login.html")


@app.route("/logout")
def logout():
    if "token" in session:
        session.pop("token")
    return redirect(url_for("login"))


@app.route("/users")
def Index():
    cur = mysql.connection.cursor()
    cur.execute("SELECT u.*, r.name FROM users AS u INNER JOIN role AS r ON u.idrole = r.idrole")
    data = cur.fetchall()
    return render_template("index.html", users = data)


@app.route("/addUser")
def addUser():
    return render_template("addUser.html")


@app.route("/insert", methods=["POST"])
def insert_user():
    if request.method == "POST":
        names = request.form["names"]
        lastname = request.form["lastname"]
        role = request.form["role"]
        user = request.form["user"]
        password = request.form["password"]
        curselect = mysql.connection.cursor()
        registers = curselect.execute("SELECT * FROM users WHERE user = %s LIMIT 1", [user])
        if registers > 0 :
            flash("Username not available ", "error")
            return redirect(url_for("addUser"))
        else :
            cur = mysql.connection.cursor()
            cur.execute("INSERT INTO users (names, lastname, idrole, user, password) VALUES (%s, %s, %s, %s, %s)",
            (names, lastname, role, user, generate_password_hash(password)))
            mysql.connection.commit()
            flash("User Added Successfully", "success")
            return redirect(url_for("Index"))


@app.route("/editUser/<id>")
def get_user(id):
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM users WHERE id = %s", [id])
    data = cur.fetchall()
    return render_template("editUser.html", user = data[0])


@app.route("/update/<id>", methods = ["POST"])
def update_user(id):
    if request.method == "POST":
        names = request.form["names"]
        lastname = request.form["lastname"]
        #user = request.form["user"]
        password = request.form["password"]
        cur = mysql.connection.cursor()
        if password == "" :
            cur.execute("""
                UPDATE users
                    SET names = %s,
                        lastname = %s
                WHERE id = %s
            """, (names, lastname, id))
        else :
            cur.execute("""
                UPDATE users
                    SET names = %s,
                        lastname = %s,
                        password = %s
                WHERE id = %s
            """, (names, lastname, password, id))
        cur.connection.commit()
        flash("User Updated Succesfully" , "success")
        return redirect(url_for("Index"))


@app.route("/delete/<string:id>")
def delete_user(id):
    cur = mysql.connection.cursor()
    #cur.execute("DELETE FROM users WHERE id = {0}".format(id))
    cur.execute("DELETE FROM users WHERE id = %s", [id])
    mysql.connection.commit()
    flash("User Removed Successfully" , "success")
    return redirect(url_for("Index"))


@app.route("/home")
def home():
    return render_template("home.html")


@app.route("/ajax-obtener-user/<id>")
def ajax_obtener_user(id):
    try:
        cur = mysql.connection.cursor()
        user = cur.execute("SELECT * FROM users WHERE id = %s", [id])
        data = cur.fetchall()
        if user > 0 :
            return ({"status": True, "idrole": str(data[0][3])})
        else :
            print("Error when retrieving the user")
            return ({"status": False, "mensaje": "Error when retrieving the user"})
    except:
        print("An exception occurred when recovering the user")
        return ({"status": False, "mensaje": "An exception occurred when recovering the user"})


if __name__ == '__main__':
    csrf.init_app(app)

    app.run(port = 3000)