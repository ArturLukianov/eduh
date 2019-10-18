from flask import Flask, render_template, redirect
from flask import url_for, request, make_response
from flask import jsonify, send_from_directory
from random import randint as rnd

app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

users = []
games = []

static_folder = 'static/'

class Game:
    def __init__(self, word, tasks, command_colors, users):
        self.users = users
        self.word = word
        self.opened_letters = []
        for i in range(len(word)):
            self.opened_letters.append("?")

        self.command_scores = [0 for i in range(len(command_colors))]

        self.question = None
        self.answer = None

        self.command_colors = command_colors

        self.values = [i for i in range(15)]

        self.last_command = 0
        self.score_to_add = 0
        self.current_baraban_cell = 0
        self.turns_count = -1
        self.current_command = 0

    def client(self):
        command_color = self.command_colors[0]
        return render_template("client.html", color=command_color)

    def get_state(self):
        data = jsonify({"word":self.opened_letters,
                        "scores":self.command_scores,
                        "baraban":self.turns_count,
                        "selected":self.selected_command,
                        "task_status":self.task_status,
                        "task_answer":self.task_answer,
                        "task_text":self.question})
        self.score_to_add = 0
        self.last_command = self.current_command
        return data

    def get_command(self, request):
        return -1

    def get_task(self, letter,):
        if self.turns_count != -1:
            return redirect('/client')
        if self.get_command(request) == -1:
            return redirect("/login")

    #def login(self, request):
    #    cookie = request.cookies.get('token')
        
        
        

"""
+----------------+
|ADDITIONAL PAGES|
+----------------+
"""
def send_static_folder(path, folder):
    return send_from_directory(static_folder + folder, path)

@app.route('/css/<path:path>')
def send_css(path):
    return send_static_folder(path, "css")

@app.route('/js/<path:path>')
def send_js(path):
    return send_static_folder(path, "js")

"""
+----------+
|USER PAGES|
+----------+
"""

@app.route('/login', methods=['POST'])
def login():
    cookie = request.cookies.get('token')
    if cookie != None:
        exists = False
        for i in users:
            if i["token"] == cookie:
                exists = True
        if exists:
            return redirect("/profile")
    return "UNDER CONSTRUCTION"

@app.route('/signup', methods=['POST'])
def signup():
    password = request.form['password']
    login = request.form['login']
    role = request.form['role']
    error = None
    if len(password) < 8:
        error = "Password length must be at least 8 symblos long"
    for i in users:
        if users["login"] == login:
            error = "User with this login already exists"    if error != None:
        return render_template("signup.html", error=error)
    responce = redirect("/profile")
    responce.set_cookie('token', str(rnd(100, 1000000)))
    users.append({"login":login,
                  "password":password,
                  "token":token,
                  "role":role,
                  "game":0})
    return responce

@app.route('/profile')
def profile():
    return render_template("profile.html")

"""
+-------------+
|TEACHER PAGES|
+-------------+
"""

@app.route('/client')
def client():
    return game.client(request)

@app.route('/create_game', methods=['POST'])
def create_game():
    return game.create_game(request)

"""
+-------------+
|STUDENT PAGES|
+-------------+
"""
@app.route('/task/<letter>', methods=['POST'])
def get_task(letter):
    return game.get_task(letter, request)

@app.route('/join_game', methods=['POST'])
def join_game():
    return game.join_game(request)

"""
+---------+
|API PAGES|
+---------+
"""

@app.route('/api/get_state')
def get_state():
    return game.get_state()

games.append([12345,Game("word",
            [["1", "1"],
             ["2", "2"]],
            ["#FF0000",
             "#00FF00",
             "#0000FF"])])

if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True)
