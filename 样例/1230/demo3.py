#实现用户登录，并在后台显示
# render_template渲染模板
from flask import Flask,render_template,request,redirect
from gevent import pywsgi
# 模板默认文件是templates,可在参数中修改
#app = Flask(__name__,template_folder='路径')

app = Flask(__name__)


# 默认值指出get请求
@app.route('/login',methods=['GET','POST'])
def login():
    # dg通过传递参数，flask将参数放在指定位置，即用即取
    # 默认无参数
    if request.method == 'GET':
        return render_template('login.html')
    # 获取post传来的数据，取表单里获取数据
    user = request.form.get('user')# html里name = user
    pwd = request.form.get('pwd')
    if user == 'ales' and pwd == '123':
        # 登陆成功，做重定向,  路由
        return redirect('/index')
    else:
        # 如果失败还在登录页面
        #                                  dg里面不需要加星
        return render_template('login.html',**{'msg':'用户名或者密码错误'})
        # 以下方式也可传递参数
        # return render_template('login.html','msg' = '用户名或者密码错误')
    '''
    #获取GET传来的数据
    request.args
    '''

@app.route('/index',methods=['GET','POST'])
def lindex():
    return "登陆成功"


   
if __name__ == '__main__':
    server = pywsgi.WSGIServer(('0.0.0.0', 5000), app)
    server.serve_forever()
    app.run() 