@app.route('/get/<uuid:name>')
def get(name):
    return "获取参数"

@app.route('getuuid/')
def get_uuid():
    return uuid.uuid4()

if __name__=='__main__':
    app.run()