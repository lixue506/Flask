#coding=utf-8
from flask import Flask, render_template, g, request
from flask_socketio import SocketIO, send, emit, join_room, leave_room

import time
import sys
import os
import random
import string

from ScrollRank_5100.ScrollRank_5100.web_model import Rank

app = Flask(__name__)
app.secret_key = 'QAQ!!!'
rank_room = {}

p_cnt = 11
t_s = 1542520800
t_e = 1542528000
# 1511060400
rank = Rank('status.db', p_cnt, t_s, t_e)
rank_id = 0

socketio = SocketIO(app)


@socketio.on('init')
def rank_init(message):
    join_room("QAQ")
    emit('init', rank.ranklist)


@app.route('/')
def guide():
    return render_template('guide.html')


@app.route('/rank')
def index():
    return render_template('index.html')


@app.route('/flush')
def flush():
    global rank
    rank = Rank("status.db", p_cnt, t_s, t_e)
    return render_template('index.html')


@app.route('/room/<rid>')
def rank_index(rid):
    return render_template('index.html', rid=rid)


@app.route('/new', methods = ['GET', 'POST'])
def new_rank():
    if request.method == 'POST':
        db_file = request.files['db']
        start_time = request.form.get('start')
        end_time = request.form.get('end')
        name = request.form.get('name')
        num = request.form.get('num')
        global p_cnt, t_s, t_e
        p_cnt = int(num)
        t_s = int(start_time)
        t_e = int(end_time)
        db_file.save(os.path.join(sys.path[0], 'status.db'))
        rank = Rank('status.db', int(num), int(start_time), int(end_time))
        token = salt = ''.join(random.sample(string.ascii_letters + string.digits, 8))
        global rank_id
        rank_room[str(rank_id)] = {
            "id": str(rank_id),
            "name": name,
            "token": token,
            "rank": rank,
        }
        rank_id += 1
        return 'URL: http://<script>document.write(document.domain + ":" + location.port)</script>/push?token=' + token + '&rid=' + str(rank_id - 1)
    return render_template('new.html')


@app.route('/push', methods = ['GET', 'POST'])
def push_status():
    '''触发下一次滚榜'''
    next_ype = rank.get_next()
    if next_ype == 'done':
        return '滚榜已结束，这里本应该为终榜，但是还没有前端，我也不会写前端'
    if next_ype == 'show':
        emit('update', rank.event, room="QAQ", namespace="/")
    else:
        emit('update', rank.event, room="QAQ", namespace="/")
    return 'Emit Success'


if __name__ == '__main__':
    socketio.run(app, host="127.0.0.1", port=8800)
