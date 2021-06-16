from datetime import datetime, timedelta
from MySQLdb import Connection
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
import cgi

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

    try:
        permission = session["permissions"]
    except:
        permission = ""
        print("The permission does not exist")

    if not token and request.endpoint not in ["login", "static", "ajax_login"]:
        return redirect(url_for("login"))
    
    try:
        data = jwt.decode(token, "secret", algorithms=["HS256"])

        print("Valid token")
        if request.endpoint in ["login"] :
            return redirect(url_for("home"))

        elif permission != None and permission != "": 
            if request.endpoint in permission :
                flash("No tienes permisos", "error")
                return redirect(url_for("home"))

        elif request.endpoint not in ["home","static","logout"]:
            flash("No tienes permisos", "error")
            return redirect(url_for("home"))
        
    except:
        print("Invalid token")
        if request.endpoint not in ["login", "static", "ajax_login"] :
            if request.endpoint in ["ajax_edit_user", "ajax_add_user", "ajax_obtener_user"] :
                session.pop("token")
                session.pop("permissions")
                return {"status": "Token", "mensaje": "Invalid token"}
            else :
                session.pop("token")
                session.pop("permissions")
                return redirect(url_for("login"))


""" Start login endpoints """
@app.route("/")
def root():
    return redirect(url_for("login"))


@app.route("/login")
def login():
    return render_template("login.html")


@app.route("/ajax-login", methods = ["POST"])
def ajax_login():
    response = ""
    try:
        username = request.form["username"]
        password = request.form["password"]
        cur = mysql.connection.cursor()
        user = cur.execute("SELECT u.*, per.endpoints FROM users AS u LEFT JOIN permissions AS per ON u.iduser = per.iduser WHERE user = %s LIMIT 1", [username])
        data = cur.fetchall()
        if user > 0 and check_password_hash(data[0][4], password) :
            token = jwt.encode({
                "username": username,
                "exp": (datetime.utcnow() + timedelta(minutes=30))
            }, "secret")
            session["token"] = token 
            permissions = data[0][5].split(",")
            session["permissions"] = permissions

            response = {"status": True, "mensaje": "Successfully authenticated"}
        else :
            response = {"status": False, "mensaje": "Incorrect username or password"}
    except:
        print(str(sys.exc_info()[0]))
        response = {"status": 400, "mensaje": "Error: an exemption occurred"}
    return response
""" End login endpoints """

@app.route("/logout")
def logout():
    if "token" in session:
        session.pop("token")
        session.pop("permissions")
    return redirect(url_for("login"))


""" Start users endpoints """
@app.route("/users")
def consult_users():
    cur = mysql.connection.cursor()
    cur.execute("SELECT *  FROM users ")
    data = cur.fetchall()
    return render_template("index.html", users = data, permisssion = session["permissions"])


@app.route("/ajax-get-user-permission/<id>")
def ajax_obtener_user(id):
    try:
        cur = mysql.connection.cursor()
        user = cur.execute("SELECT per.* FROM users AS u LEFT JOIN permissions AS per ON u.iduser = per.iduser WHERE u.iduser = %s LIMIT 1", [id])
        data = cur.fetchall()
        if user > 0 :
            return ({"status": True, "permissions": data})
        else :
            print("Error when retrieving the user")
            return ({"status": False, "mensaje": "Error when retrieving the user"})
    except:
        print("An exception occurred when recovering the user")
        return ({"status": False, "mensaje": "An exception occurred when recovering the user"})


@app.route("/addUser")
def add_user():
    return render_template("addUser.html")


@app.route("/ajax-add-user/<permission>/<selected>/<unselected>", methods = ["POST"])
def ajax_add_user(permission, selected, unselected):
    if request.method == "POST":
        response = ""
        try: 
            names = request.form["names"]
            lastname = request.form["lastname"]
            user = request.form["user"]
            password = request.form["password"]
            curselect = mysql.connection.cursor()
            registers = curselect.execute("SELECT * FROM users WHERE user = %s LIMIT 1", [user])
            if registers > 0 :
                response = {"status":  False, "mensaje": "Username not available"}
            else :
                cur = mysql.connection.cursor()
                cur.execute("INSERT INTO users (names, lastname, user, password) VALUES (%s, %s, %s, %s, %s)",
                (names, lastname, user, generate_password_hash(password)))
                idUser = cur.lastrowid
                cur.connection.commit()

                cur = mysql.connection.cursor()
                cur.execute("INSERT INTO permissions (iduser, endpoints," + permission + ") VALUES (%s, %s," + selected + ")",
                (str(idUser), unselected))
                cur.connection.commit()
                
                flash("User Added Successfully", "success")
                response = {"status": True, "mensaje": "User Added Successfully"}
        except:
            print(str(sys.exc_info()[0]))
            flash("Error creating user", "error")
            response = {"status": 400, "mensaje": "Error: an exemption occurred"}
        return response


@app.route("/editUser/<id>")
def edit_user(id):
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM users WHERE iduser = %s", [id])
    data = cur.fetchall()
    return render_template("editUser.html", user = data[0])


@app.route("/ajax-edit-user/<iduser>/<permission>/<selected>/<unselected>", methods = ["POST"])
def ajax_edit_user(iduser, permission, selected, unselected):
    if request.method == "POST":
        response = ""
        try:
            names = request.form["names"]
            lastname = request.form["lastname"]
            password = request.form["password"]
            cur = mysql.connection.cursor()
            if password == "" :
                cur.execute("""
                    UPDATE users
                        SET names = %s,
                            lastname = %s
                    WHERE iduser = %s
                """, (names, lastname, iduser))
            else :
                cur.execute("""
                    UPDATE users
                        SET names = %s,
                            lastname = %s,
                            password = %s
                    WHERE iduser = %s
                """, (names, lastname, password, iduser))
            cur.connection.commit()

            permissions = permission.split(",")
            selected = selected.split(",")
            cont = 0
            for per in permissions :
                cur = mysql.connection.cursor()
                cur.execute("UPDATE permissions SET endpoints = %s, {0}".format(per) + " = %s WHERE iduser = %s", (unselected, selected[cont], iduser))
                cur.connection.commit()
                cont += 1

            flash("User Updated Succesfully" , "success")
            response = {"status": True, "mensaje": "User Updated Succesfully"}
        except:
            print(str(sys.exc_info()[0]))
            flash("Error when editing user", "error")
            response = {"status": 400, "mensaje": "Error: an exemption occurred"}
        return response


@app.route("/delete/<string:id>")
def delete_user(id):
    cur = mysql.connection.cursor()
    cur.execute("DELETE FROM users WHERE iduser = %s", [id])
    mysql.connection.commit()
    flash("User Removed Successfully" , "success")
    return redirect(url_for("consult_users"))
""" End users endpoints """


@app.route("/home")
def home():
    return render_template("home.html", permisssion = session["permissions"])


if __name__ == '__main__':
    csrf.init_app(app)

    app.run(port = 3000)