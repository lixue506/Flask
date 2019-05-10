import os
import sys
import sqlite3

SQL_PATH = os.path.join(sys.path[0], 'status.db')

con = sqlite3.connect(SQL_PATH)

cu = con.cursor()

cu.execute("create table status (id integer primary key autoincrement, username varchar(36), nickname varchar(36), problem varchar(36), time varchar(36), result varchar(36), read integer)")