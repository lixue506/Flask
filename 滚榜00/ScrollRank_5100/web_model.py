#coding=utf-8
import os
import sys
import time
import sqlite3

class Rank():
    '''处理榜单'''
    def __init__(self, db_name, problem_num, START_TIME, END_TIME):
        #题目数
        self.PROBLEM_COUNT = problem_num
        #题目题号
        self.PROBLEMS = []
        for i in range(problem_num):
            self.PROBLEMS.append(chr(ord('A') + i))
        #榜单每页显示条数
        self.SIZE = 10
        self.SQL_PATH = os.path.join(sys.path[0], db_name)
        self.con = sqlite3.connect(self.SQL_PATH, check_same_thread=False)
        self.cu = self.con.cursor()
        '''初始化ranklist'''
        self.event_id = 0
        self.cursor = {}
        self.userlist = {}
        self.ranklist = []
        self.problemFB = {}
        self.event = {}
        self.START_TIME = START_TIME
        self.END_TIME = END_TIME
        self.userlist = {}
        self.ranklist = []
        self.problemFB = {}
        self.cu.execute("select * from status")
        data = self.cu.fetchall()
        self.userlist_init(data)
        self.ranklist_sort()
        num = len(self.ranklist)
        self.cursor = {
            "base": num - 1,
            "top": num - self.SIZE - 1,
            "username": self.ranklist[-2]['username'],
        }
        self.ranklist[-1] = self.cursor

    def userlist_init(self, data):
        '''初始化userlist'''
        for statu in data[::-1]:
            username = statu[1]
            nickname = statu[2]
            problem = statu[3]
            result = statu[4]
            sub_time = int(statu[5])
            #若userlist没有此人，则添加之
            if not username in self.userlist.keys():
                self.userlist[username] = {
                    "username": username,
                    "nickname": nickname,
                    "solved": 0,
                    "time": 0,
                    "statuses": {}
                }
                for i in self.PROBLEMS:
                    self.userlist[username]['statuses'][i] = {
                        "attempted": 0,
                        "accept_time": -1,
                        "current_result": '-',
                        "final_result": '-',
                    }
            #判断此题之前是否AC过
            if self.userlist[username]['statuses'][problem]['final_result'] == 'AC' or self.userlist[username]['statuses'][problem]['final_result'] == 'FB':
                continue
            if result == 'AC':
                #判断是否为FB
                if not problem in self.problemFB.keys():
                    #标记FB
                    self.problemFB[problem] = username
                    self.userlist[username]['statuses'][problem]['final_result'] = 'FB'
                    self.userlist[username]['statuses'][problem]['current_result'] = ('FB' if sub_time < self.END_TIME else '?')
                else:
                    self.userlist[username]['statuses'][problem]['final_result'] = 'AC'
                    self.userlist[username]['statuses'][problem]['current_result'] = ('AC' if sub_time < self.END_TIME else '?')
                #计算罚时
                fashi = self.userlist[username]['statuses'][problem]['attempted'] * 20 * 60
                self.userlist[username]['statuses'][problem]['accept_time'] = sub_time - self.START_TIME + fashi
                self.userlist[username]['solved'] += 1 if sub_time < self.END_TIME else 0
                self.userlist[username]['time'] += sub_time - self.START_TIME + fashi if sub_time < self.END_TIME else 0
            else:
                self.userlist[username]['statuses'][problem]['current_result'] = ('F' if sub_time < self.END_TIME else '?')
                self.userlist[username]['statuses'][problem]['final_result'] = 'F'
            self.userlist[username]['statuses'][problem]['attempted'] += 1

    def ranklist_sort(self):
        '''根据userlist排序获得ranklist'''
        tmplist = sorted(self.userlist.items(), key=lambda x: (x[1]['solved'], -x[1]['time']), reverse=True)
        num = 0
        self.ranklist = []
        for i in tmplist:
            num += 1
            self.ranklist.append(self.get_user_info(i))
            #修改userlist中的rank
            self.userlist[i[1]['username']]['rank'] = num
        self.ranklist.append(self.cursor)

    def get_user_info(self, i):
        '''返回某个用户的当前信息'''
        statuses = []
        for j in self.PROBLEMS:
            result = i[1]['statuses'][j]['current_result']
            statuses.append(
                {
                    "attempted": i[1]['statuses'][j]['attempted'],
                    "result": i[1]['statuses'][j]['current_result'],
                    "time": i[1]['statuses'][j]['accept_time'] - 20 * 60 * (i[1]['statuses'][j]['attempted'] - 1) if result == 'AC' or result == 'FB' else 0
                }
            )
        return {
            "username": i[0],
            "nickname": i[1]['nickname'],
            "time": i[1]['time'],
            "solved": i[1]['solved'],
            "statuses": statuses,
        }

    def get_next(self):
        '''获取下一个活动，向上滚动or揭开某个"?"'''
        #检查是否已经滚榜完毕
        if self.cursor['top'] >= self.cursor['base']:
            return 'done'
        self.event_id += 1
        self.event = {}
        self.event['extra'] = []
        self.event['event_id'] = self.event_id
        user = self.userlist[self.cursor['username']]
        #检查有没有未揭开的题目
        for i in self.PROBLEMS:
            #若某个题目未揭开
            if user['statuses'][i]['current_result'] == '?':
                #修改该用户此题目状态
                result = user['statuses'][i]['final_result']
                user['statuses'][i]['current_result'] = result
                #若揭开后状态为AC
                if result == 'AC' or result == 'FB':
                    #修改题目罚时，添加AC数量
                    user['time'] += user['statuses'][i]['accept_time']
                    user['solved'] += 1
                    #重新计算排名
                    self.ranklist_sort()
                    #若该用户的排名超出页面
                    if user['rank'] <= self.cursor['top']:
                        #添加top上一位的信息
                        self.event['extra'] = self.ranklist[self.cursor['top']]
                        self.event['extra']['rank'] = self.cursor['top'] + 1
                else:
                    #防止有莫名的?错误
                    self.ranklist_sort()
                #将此题目揭开的数据写入
                self.event['status'] = {
                    "username": self.cursor['username'],
                    "result": user['statuses'][i]['final_result'],
                    "attempted": user['statuses'][i]['attempted'],
                    "time": user['statuses'][i]['accept_time'],
                    "rank": user['rank'],
                }
                #重新计算光标位置
                self.cursor['username'] = self.ranklist[self.cursor['base'] - 1]['username']
                self.event['type'] = 'show'
                #判断是否为第一次滚
                #if self.cursor['top'] == self.cursor['base'] - 10:
                    #self.cursor['base'] -= 1
                    #self.event['extra'] = []
                return 'show'
        #若没有未揭开的题目，则上移
        #判断是否已经到顶部
        if self.cursor['top'] > 0:
            #判断是否为第一次滚
            if self.cursor['top'] == self.cursor['base'] - 10:
                self.event['extra'] = []
            else:
                #将top信息写入
                self.event['extra'] = self.ranklist[self.cursor['top'] - 1]
                self.event['extra']['rank'] = self.cursor['top']
                #上移top
                self.cursor['top'] -= 1
        self.cursor['base'] -= 1
        #更新当前光标username
        self.cursor['username'] = self.ranklist[self.cursor['base'] - 1]['username']
        self.event['type'] = 'scroll'
        return 'scroll'
