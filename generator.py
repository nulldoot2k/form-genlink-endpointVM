import os
import uuid
import time
from flask import Flask, session, redirect, url_for, render_template, abort, request, jsonify
from flask_basicauth import BasicAuth
from dotenv import load_dotenv

load_dotenv()

# Base set config
app = Flask(__name__, static_folder='templates')
app.secret_key = os.environ.get('SECRET_FLASK')
app.config['SERVER_NAME'] = os.environ.get('HOST_NGORK')
app.config['BASIC_AUTH_USERNAME'] = os.environ.get('BASIC_AUTH_USERNAME')
app.config['BASIC_AUTH_PASSWORD'] = os.environ.get('BASIC_AUTH_PASSWORD')

basic_auth = BasicAuth(app)

link_status = {} # Lưu trạng thái của link (active, used, expired)
link_expiry_time = {} # Lưu thời gian hết hạn của link

# Tạo Link để truy cập vào form
@app.route('/api/telegram_config')
def telegram_config():
    return jsonify({
        'telegramToken': os.environ.get('TELEGRAM_TOKEN'),
        'telegramChatId': os.environ.get('TELEGRAM_CHAT_ID'),
        'telegramMessageThreadId': os.environ.get('TELEGRAM_MESSAGE_THREAD_ID')
    })

# Xử lý truy cập form
@app.route('/generate_link')
def generate_link():
    unique_id = str(uuid.uuid4())
    link_status[unique_id] = "active"
    link_expiry_time[unique_id] = time.time() + 10 * 60
    link_url = url_for('access_form', unique_id=unique_id, _external=True)
    print(f"Generated link URL: {link_url}")
    return link_url

@app.route('/form/<unique_id>')
def access_form(unique_id):
    print(f"Truy cập route /form/{unique_id}, unique_id = {unique_id}")
    if unique_id not in link_status:
        print(f"InError: unique_id '{unique_id}' không tồn tại trong link_status")
        abort(404)
    if link_status[unique_id] != "active":
        print(f"InError: link_status của '{unique_id}' không phải 'active', trạng thái hiện tại: {link_status.get(unique_id)}")
        abort(404)
    if 'form_accessed' in session and session['form_accessed'] == unique_id:
        print(f"InError: form đã được truy cập trong session với unique_id '{unique_id}'")
        abort(404)
    if time.time() > link_expiry_time[unique_id]:
        print(f"InError: link '{unique_id}' đã hết hạn, thời gian hết hạn: {link_expiry_time[unique_id]}, thời gian hiện tại: {time.time()}")
        link_status[unique_id] = "expired"
        abort(404)
    session['form_accessed'] = unique_id
    print(f"Success: Chuẩn bị render form_index.html cho unique_id '{unique_id}'")
    return render_template('form_index.html', unique_id=unique_id, show_result=False)

# Xử lý request khi user SUBMIT FORM
@app.route('/submit_form/<unique_id>', methods=['POST'])
def submit_form(unique_id):
    print(f"Submit form route /submit_form/{unique_id}, unique_id = {unique_id}")
    if unique_id not in link_status:
        print(f"InError submit: unique_id '{unique_id}' không tồn tại trong link_status")
        abort(404)
    if link_status[unique_id] != "active":
        print(f"InError submit: link_status của '{unique_id}' không phải 'active', trạng thái hiện tại: {link_status.get(unique_id)}")
        abort(404)
    if time.time() > link_expiry_time[unique_id]:
        print(f"InError submit: link '{unique_id}' đã hết hạn, thời gian hết hạn: {link_expiry_time[unique_id]}, thời gian hiện tại: {time.time()}")
        link_status[unique_id] = "expired"
        abort(404)
    link_status[unique_id] = "used"
    session.pop('form_accessed', None)
    form_data = request.form
    print(f"Dữ liệu form đã submit: {form_data}")
    print(f"Thành công submit: Chuẩn bị render resultForm")
    return render_template('form_index.html', unique_id=unique_id, form_data=form_data, show_result=True)

@app.route('/')
@basic_auth.required
def home():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=80)
