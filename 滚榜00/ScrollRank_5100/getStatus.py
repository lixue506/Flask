#coding = utf-8
import os
import sys
import time
import urllib
import urllib.request
import sqlite3
import http.cookiejar
from urllib import parse

import requests
from bs4 import BeautifulSoup
from pip._vendor.distlib.compat import raw_input


def get_all_code(user, password, cid):
    url1 = 'http://acm.sdut.edu.cn/onlinejudge2/index.php/Home/Contest/contestuser/cid/' + cid + '/p/'
    page1 = 1
    data1 = []
    while True:
        page2 = page1
        url2 = url1 + str(page2)
        data = requests.get(url2, timeout=30)
        soup = BeautifulSoup(data.text)
        count = 0
        for i in soup.tbody.children:
            try:
                count += 1
                if count == 1 or count == 22:
                    continue
                tds = str(i).split('\n')
                # print(tds)
                name = tds[3][4:-5] + '|' + tds[2][4:-5]
                class1 = tds[10][21:23]
                class2 = tds[16][21:23]
                class3 = tds[22][21:23]
                if not (
                        class1 == "计科" or class1 == "软件" or class2 == "计科" or class2 == "软件" or class3 == "计科" or class3 == "软件") and \
                        name[0] != '*':
                    data1.append(name)
            except:
                break
        if count == 22:
            page1 += 1
        else:
            break
    path = sys.path[0]
    login_page = "http://acm.sdut.edu.cn/onlinejudge2/index.php/Home/Login/login/"
    cj = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
    opener.addheaders = [
        ('User-agent', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:45.0) Gecko/20100101 Firefox/45.0')]
    data = parse.urlencode({"user_name": user, "password": password}).encode(encoding='UTF8')
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
                # print(tds)
                run_id = tds[2][4:-5]
                nick_name = tds[4][4:-5]
                # print(nick_name)
                nick_name1 = ""
                # for j in data1:
                #     td = str(j).split('|')
                #     if td[0] == nick_name.strip():
                #         nick_name1 = str(j)
                #         print(nick_name1)
                #         break
                for j in data1:
                    td = str(j).split('|')
                    if td[0] == nick_name.strip():
                        nick_name1 = str(j)
                        print(nick_name1)
                        break
                if nick_name1 == "":
                    continue
                problem = tds[5][89:-9]
                result = 'Accepted' in tds[6]
                dt = tds[-2][4:-5]
                arr = time.strptime(dt, '%Y-%m-%d %H:%M:%S')
                sub_time = str(int(time.mktime(arr)))
                # print(nick_name, result)
                # print(run_id, nick_name, problem, result, sub_time)
                cu.execute(
                    "insert into status values(NULL, '%s', '%s', '%s', '%s', '%s', %d)" %\
                    (nick_name, nick_name1, problem, 'AC' if result else 'F', sub_time, 0)
                )
            except:
                con.commit()
                return
        con.commit()
        if count == 22:
            page += 1
        else:
            return
        # break


if __name__ == '__main__':
    # username = raw_input('username: ')
    # password = raw_input('password: ')
    # cid = raw_input('cid: ')
    username = "root"
    password = "A4C0M9_sdut&oj"
    cid = "2696"
    get_all_code(username, password, cid)