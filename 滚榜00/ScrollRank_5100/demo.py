#coding=utf-8
from flask import Flask, render_template, g, request
from flask_socketio import SocketIO, send, emit, join_room, leave_room

import time

from ScrollRank_5100.model import TOKEN, Rank

app = Flask(__name__)
app.secret_key = 'QAQ!!!'
rank = Rank()

socketio = SocketIO(app)

@socketio.on('init')
def rank_init(message):
    join_room('ranklist')
    emit('init', rank.ranklist)

@app.route('/')
def index():
    return render_template('web/index.html')

@app.route('/push', methods = ['GET', 'POST'])
def push_status():
    '''向数据库中添加一条提交状态'''
    key = request.args.get('key')
    if key != TOKEN:
        return 'Token Error'
    if rank.get_next() == 'show':
        emit('update', rank.event, room="ranklist", namespace="/")
    else:
        emit('update', rank.event, room="ranklist", namespace="/")
    return 'Emit Success'

if __name__ == '__main__':
    socketio.run(app, debug=True, host="0.0.0.0")