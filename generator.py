from flask import Flask, session, redirect, url_for, render_template, abort
import uuid
import time

app = Flask(__name__, static_folder='templates')
app.secret_key = "SAz08zhtYPjBdpleHwJpT"

link_status = {}
link_expiry_time = {}

@app.route('/generate_link')
def generate_link():
    unique_id = str(uuid.uuid4())
    link_status[unique_id] = "active"
    link_expiry_time[unique_id] = time.time() + 10 * 60

    link_url = url_for('access_form', unique_id=unique_id, _external=True)
    return link_url

@app.route('/form/<unique_id>')
def access_form(unique_id):
    if unique_id not in link_status:
        abort(404)

    if link_status[unique_id] != "active":
        abort(404)

    if 'form_accessed' in session and session['form_accessed'] == unique_id:
        abort(404)

    if time.time() > link_expiry_time[unique_id]:
        link_status[unique_id] = "expired"
        abort(404)

    link_status[unique_id] = "used"
    session['form_accessed'] = unique_id
    return render_template('form_index.html')

@app.route('/')
def home():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=20030)
