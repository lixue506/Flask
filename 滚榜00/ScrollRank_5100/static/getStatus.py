#coding = utf-8
import os
import sys
import time
import urllib
import urllib2
import sqlite3
import cookielib
import HTMLParser
from bs4 import BeautifulSoup


def get_all_code(user, password, cid):
    path = sys.path[0]
    login_page = "http://acm.sdut.edu.cn/onlinejudge2/index.php/Home/Login/login/"
    cj = cookielib.CookieJar()
    opener = urllib2.build_opener(urllib2.HTTPCookieProcessor(cj))
    opener.addheaders = [
        ('User-agent', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:45.0) Gecko/20100101 Firefox/45.0')]
    data = urllib.urlencode({"user_name": user, "password": password})
    opener.open(login_page, data)

    url = 'http://acm.sdut.edu.cn/onlinejudge2/index.php/Contest/conteststatus/cid/' + cid + '/p/'
    page = 1
    
    SQL_PATH = os.path.join(sys.path[0], 'status.db')
    con = sqlite3.connect(SQL_PATH, check_same_thread=False)
    cu = con.cursor()
    cu.execute("create table status (id integer primary key autoincrement, username varchar(36), nickname varchar(36), problem varchar(36), time varchar(36), result varchar(36), read integer)")
    while True:
        op = opener.open(url + str(page))
        data = op.read()
        soup = BeautifulSoup(data)
        count = 0
        for i in soup.tbody.children:
            try:
                count += 1
                if count == 1 or count == 22:
                    continue
                tds = str(i).split('\n')
                run_id = tds[1][4:-5]
                nick_name = tds[2][4:-5]
                problem = tds[3][89:-9]
                result = 'Accepted' in tds[4]
                dt = tds[-2][4:-5]
                arr = time.strptime(dt, '%Y-%m-%d %H:%M:%S')
                sub_time = str(int(time.mktime(arr)))
                print nick_name, result
                cu.execute(
                    "insert into status values(NULL, '%s', '%s', '%s', '%s', '%s', %d)" %\
                    (nick_name, nick_name, problem, 'AC' if result else 'F', sub_time, 0)
                )
            except:
                con.commit()
                return
        con.commit()
        if count == 22:
            page += 1
        else:
            return

if __name__ == '__main__':
    username = raw_input('username: ')
    password = raw_input('password: ')
    cid = raw_input('cid: ')
    get_all_code(username, password, cid)