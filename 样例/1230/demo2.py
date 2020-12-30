from flask import Flask

# app是flask实例化的对象
app = Flask(__name__)

#flask路由，用装饰器，dg写对应关系
# 表示路由里的index与函数创建对应关系
@app.route('/index')
def inedx():
    return "Hello World!"


if __name__ == "__main__":
    # 实例化对象
    app.run() 