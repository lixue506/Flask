#coding=utf-8
import time
import urllib

def scroll_time(url):
    t = float(raw_input('请输入更新间隔(单位：S， 不能小于1.5): '))
    t = t if t > 1.5 else 1.5
    print '按Ctrl+C停止'
    while True:
        time.sleep(t)
        urllib.urlopen(url)

def scroll_click(url):
    print '按Ctrl+C停止'
    while True:
        raw_input()
        urllib.urlopen(url)

if __name__ == '__main__':
    url = raw_input('请输入触发URL: ')
    type = raw_input('请选择方式：\n1: 定时触发\n2: 点击触发\n')
    if type == '1':
        scroll_time(url)
    else:
        scroll_click(url)