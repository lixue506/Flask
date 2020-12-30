from werkzeug.wrappers import Request,Response
from werkzeug.serving import run_simple



@Request.application
def hello():
    return Response('Hello World!')


if __name__ == "__main__":
    # 监听ip为localhost的4000端口
    #请求一旦到来，执行第三个参数,执行函数hello，  参数（）
    # 类和对象，函数加括号
    run_simple('localhost', 4000, hello)
