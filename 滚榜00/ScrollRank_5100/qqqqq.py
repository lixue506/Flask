# coding = utf-8
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
                if (
                        class1 == "计科" or class1 == "软件" or class2 == "计科" or class2 == "软件" or class3 == "计科" or class3 == "软件") and \
                        name[0] != '*':
                    data1.append(name)
            except:
                break
        if count == 22:
            page1 += 1
        else:
            break

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
                name = tds[3][4:-5]
                # print(name)
                if "计科" in tds[9] or "软件" in tds[9]:
                    # print(name)
                    name = name + '|' + "热身赛"
                    # print(name)
                    data1.append(name)
                else:
                    continue
                # name = tds[3][4:5] + tds[3][6:-5] + '|' + tds[2][4:-5]
                # # class1 = tds[10][21:23]
                # class2 = tds[16][21:23]
                # class3 = tds[22][21:23]
                # print(name)
                # if class1 == "计科" or class1 == "软件" or class2 == "计科" or class2 == "软件" or class3 == "计科" or class3 == "软件":
                #     data1.append(name)
            except:
                break
        if count == 22:
            page1 += 1
        else:
            break
    # print(data1)


if __name__ == '__main__':
    username = "root"
    password = "A4C0M9_sdut&oj"
    cid = "2684"
    get_all_code(username, password, cid)