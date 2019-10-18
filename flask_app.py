from flask import Flask, render_template, redirect, url_for, request, make_response, jsonify, send_from_directory
from random import randint as rnd


app = Flask(__name__, static_url_path='')

word = "соразмерность"
seen = []

for i in word:
    seen.append("?")

pass1 = "geometry"
pass2 = "mathematics"
pass3 = "integrall"

app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
static_folder = 'static/'

task_status = 0

@app.route('/css/<path:path>')
def send_css(path):
    return send_from_directory(static_folder + 'css', path)

@app.route('/js/<path:path>')
def send_js(path):
    return send_from_directory(static_folder + 'js', path)

cAns = 0
cQuest = 0

tasks = [
        ["В двух коробках 74 книги.<br/> В первой коробке 2/19 не по математике, а во второй 5/9 с синей обложкой. "
         "(Все книги целые!) <br/>Сколько книг в первой из коробке?", "38"],
        ["Малыш съедает банку варенья за 6 минут, а Карлсон — в 2 раза быстрее. <br/>"
         "За сколько минут они съедят 3 банки варенья?",
         "6"],
        ["Ученица 5 класса Катя и несколько ее одноклассников встали в круг, взявшись за руки. Оказалось, что каждый держит за руки либо двух мальчиков, либо двух девочек.<br/>"
         "Если в кругу стоит пять мальчиков, то сколько там стоит девочек?",
         "5"],
        ["Незнайка лжёт по понедельникам, вторникам и пятницам, а в остальные дни недели говорит правду.<br/>"
         "В какие дни недели Незнайка может сказать: „Я лгал позавчера и буду лгать послезавтра”?<br/>"
         "В ответ введите номера дней относительно начала недели(понедельник - 1), в порядке возрастания без пробелов и запятых.",
         "12357"],
        ["В комнате дед, два отца, два сына и два внука (это дед, отцы, сыновья и внуки людей, находящихся в комнате). Сколько людей могло быть в комнате?",
         "В ответ введите возможные количества людей в порядке возрастания, без запятых и пробелов."],
        ["Грузчики Коля и Петя носят ящики. Переноска маленького ящика занимает у Пети 1 минуту, а у Коли 3 минуты. "
         "Зато большой ящик Коля переносит за 5 минут, а Петя — за 6. Всего им нужно перенести 10 больших и 10 маленьких ящиков. "
         "За какое наименьшее количество минут они могут это сделать?"
         "(Нести несколько ящиков сразу нельзя, нести ящик вдвоём нельзя, меняться ящиками посередине пути — тоже нельзя.)",
         "33"],
        ["Бетти и Кетти путешествуют на суперпоезде. Бетти едет в сто семнадцатом вагоне с начала поезда, Кетти – в сто тридцать четвертом с конца. Оказалось, что они едут в соседних вагонах. Сколько вагонов могло быть в поезде? Укажите все возможные варианты. Напишите их через пробел в порядке возрастания.", "249 251"],
["Разделите число 80 на две части так, чтобы одна часть составляла 60% от другой части. Напишите их  через пробел в порядке возрастания.", "30 50"],
["Отцу — 41 год, старшему сыну — 13 лет, дочери — 10 лет, а младшему сыну — 6 лет. Через сколько лет возраст отца окажется равным сумме лет его детей?", "6"],
["У 28 человек класса на собрание пришли папы и мамы. Мам было 24, пап — 18. У скольких учеников на собрание пришли одновременно и папа, и мама?", "14"],
["Антоше подарили весы и он стал взвешивать всё подряд. Вес машины оказался равным весу мяча и двух кубиков, вес машины и кубика — весу двух мячей. Сколько кубиков уравновесят машину?", "5"]
    ] 

@app.route('/task/<letter1>')
def get_task(letter1):
    global task_status
    if baraban != 0:
        return render_template("client.html", color=colors[get_command(request)])
    if get_command(request) == -1:
        return render_template("login.html")
    elif get_command(request) != command:
        return render_template("client.html", color=colors[get_command(request)])
    if letter1 in seen:
        return render_template("client.html", color=colors[get_command(request)])
    letter = letter1
    task_status = 1
    global cAns, cQuest
    rand = rnd(0, len(tasks) - 1)
    cAns = tasks[rand][1]
    cQuest = tasks[rand][0]
    del tasks[rand]
    return render_template("task.html", task=cQuest)

colors = ["#990000",
          "#009900",
          "#000099"]

@app.route('/client')
def client():
    return render_template("client.html", color=colors[get_command(request)])
                           
def get_command(request):
    comm = request.cookies.get('password')
    if comm == None:
        return -1
    if comm == "first":
        return 0
    if comm == "second":
        return 1
    return 2

values = [i for i in range(15)]

values = values[9:-1:] + [values[-1]] + values[0:9:]

last = 0

score = 0
cur = 0
turn = 0

@app.route('/api/stop_baraban')
def stop():
    global baraban
    baraban = 0
    return "OK"

@app.route('/task/<letter>', methods = ['POST'])
def get_task2(letter):
    global task_status, task_answer
    global command
    next_command = True
    if get_command(request) == -1:
        return render_template("login.html")
    elif get_command(request) != command:
        return render_template("client.html", color=colors[get_command(request)])
    global turn
    task_status = 1
    task_answer = request.form["answer"]
    error = ''
    if request.form["answer"].lower() == str(cAns).lower():
        task_status = 2
        if letter in word and not (letter in seen):
            global baraban
            baraban = rnd(51, 125)
            global score, values, cur
            n = (cur + baraban) % len(values)
            score = values[n]
            cur = (n + 1) % len(values)
            next_command = False
            error = '<script>alert("Верно!")</script>'
        else:
            error = '<script>alert("Такой буквы в слове нет")</script>'
        for i in range(len(word)):
            if word[i] == letter:
                seen[i] = letter
    else:
        task_status = 3
        error = '<script>alert("Неправильно")</script>'
        tasks.append([cQuest, cAns])
    turn += 1
    if next_command:
        command = (command + 1) % 3
    resp = make_response(render_template("client.html", color=colors[get_command(request)], error=error))
    return resp

@app.route('/login', methods=['GET', 'POST'])
def login():
    password = request.cookies.get('password')
    if password == None:
        error = None
        if request.method == 'POST':
            if request.form['password'] == pass1:
                resp = make_response(render_template("client.html", color=colors[get_command(request)]))
                resp.set_cookie('password', "first")
                return resp
            elif request.form['password'] == pass2:
                resp = make_response(render_template("client.html", color=colors[get_command(request)]))
                resp.set_cookie('password', "second")
                return resp
            elif request.form['password'] == pass3:
                resp = make_response(render_template("client.html", color=colors[get_command(request)]))
                resp.set_cookie('password', "third")
                return resp
            else:
                error = '<div class="alert alert-danger" role="alert">Неправильный пароль!</div>'
        return render_template('login.html', error=error)
    return make_response(render_template("client.html", color=colors[get_command(request)]))

@app.route('/')
def index():
    return render_template('index.html')

score1 = 0
score2 = 0
score3 = 0

baraban = 0
command = 0
task_answer = ""

@app.route('/api/get_state')
def state():
    global last
    global baraban
    global task_status
    b = baraban
    baraban = 0
    global score1
    global score2
    global score3
    global score
    global command
    lob = jsonify({"word":seen,
                    "score1":score1,
                    "score2":score2,
                    "score3":score3,
                    "baraban":b,
                    "selected":command,
                   "task_status":task_status,
                   "task_answer": task_answer,
                   "task_text":cQuest})
    if last == 0:
        score1 += score
    elif last == 1:
        score2 += score
    else:
        score3 += score
    if task_status != 1:
        task_status = 0
    score = 0
    last = command
    return lob

if __name__ == "__main__":
    app.run(host='0.0.0.0')
