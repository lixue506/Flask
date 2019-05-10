#coding=utf-8
import os
import sys
import pymysql as mdb
import time
import sqlite3
import urllib


def getsolution(users, pros, contest_id=0):
    con = None
    con = mdb.connect('localhost', 'root', 'passwd', 'oj_test', charset='utf8')
    cur = con.cursor()
    sql = 'select * from solution where contest_id=%d' % contest_id
    cur.execute(sql)
    rows = cur.fetchall()
    SQL_PATH = os.path.join(sys.path[0], 'status.db')
    con = sqlite3.connect(SQL_PATH, check_same_thread=False)
    cu = con.cursor()
    cu.execute("create table status (id integer primary key autoincrement, username varchar(36), nickname varchar(36), problem varchar(36), time varchar(36), result varchar(36), read integer)")
    #for row in rows:
    for row in rows[::-1]:
        try:
            problem = str(row[1])
            problem = chr(pros[problem] + 65)
            print(problem)
            user = row[10]
            te = str(row[8])
            arr = time.strptime(te, '%Y-%m-%d %H:%M:%S')
            sub_time = str(int(time.mktime(arr)))
            result = True if row[9] == 1 else False
            nick_name = str(users[user].encode('utf-8'))
            print(nick_name)
            ispro = ('软件' in nick_name or '计科' in nick_name)
            if not ispro:
                continue
            print(ispro)
            cu.execute(
                    "insert into status values(NULL, '%s', '%s', '%s', '%s', '%s', %d)" %\
                    (nick_name, nick_name, problem, 'AC' if result else 'F', sub_time, 0 if ispro else 1)
                )
        except:
            pass
    con.commit()


def get_user(contest_id=0):
    con = mdb.connect("localhost", "root", "passwd", "oj_test", charset="utf8")
    cur = con.cursor()
    sql = "select * from contest_user where cid=%d" % contest_id
    cur.execute(sql)
    rows = cur.fetchall()
    users = {}
    for row in rows:
        users[str(row[1])] = row[32]
    return users


def get_pro(contest_id=0):
    con = mdb.connect("localhost", "root", "passwd", "oj_test", charset="utf8")
    cur = con.cursor()
    sql = "select * from contest_pro where contest_id=%d" % contest_id
    cur.execute(sql)
    rows = cur.fetchall()
    pros = {}
    for row in rows:
        pros[str(row[2])] = int(row[4])
    return pros
    

def update():
    os.remove(os.path.join(sys.path[0], 'status.db'))
    contestid = 1690
    users = get_user(contestid)
    pros = get_pro(contestid)
    getsolution(users, pros, contestid)


update()
