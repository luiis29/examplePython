from flask import Flask, render_template, request, redirect, url_for, flash
from flask_mysqldb import MySQL

app = Flask(__name__)

#MySQL connection
app.config["MYSQL_HOST"] = "localhost"
app.config["MYSQL_USER"] = "root"
app.config["MYSQL_PASSWORD"] = "123"
app.config["MYSQL_DB"] = "python"
app.config["MYSQL_PORT"] = 3307
mysql = MySQL(app)

#settings
app.secret_key = 'mysecretkey'

@app.route("/")
def Index():
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM users")
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
        user = request.form["user"]
        password = request.form["password"]
        cur = mysql.connection.cursor()
        cur.execute("INSERT INTO users (names, lastname, user, password) VALUES (%s, %s, %s, %s)",
        (names, lastname, user, password))
        mysql.connection.commit()
        flash("User Added Successfully", "success")
        return redirect(url_for("Index"))


@app.route("/edit/<id>")
def get_user(id):
    print(id)
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM users WHERE id = %s", [id])
    data = cur.fetchall()
    return render_template("home.html", user = data[0])


@app.route("/update/<id>", methods = ["POST"])
def update_user(id):
    if request.method == "POST":
        names = request.form["names"]
        lastname = request.form["lastname"]
        user = request.form["user"]
        password = request.form["password"]
        cur = mysql.connection.cursor()
        cur.execute("""
            UPDATE users
                SET names = %s,
                    lastname = %s,
                    user = %s,
                    password = %s
            WHERE id = %s
        """, (names, lastname, user, password, id))
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



if __name__ == '__main__':
    app.run(port = 3000, debug = True)