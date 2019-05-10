import time

dt = '2018-11-17 16:00:00'
ts = int(time.mktime(time.strptime(dt, "%Y-%m-%d %H:%M:%S")))
print (ts)