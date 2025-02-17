# Form Registry Endpoint

Ứng dụng Web cho phép tạo phiếu đăng ký nhanh chóng, chia sẻ liên kết duy nhất và bắn kết quả về telegram.

## Giới thiệu

Form Registry Endpoint là một ứng dụng web được thiết kế để đơn giản hóa quá trình tiếp nhận thông tin thông qua các form trực tuyến. Ứng dụng này cung cấp hai giao diện form chính:

**Form GenLink**: Dành cho người quản trị, cho phép tạo ra các đường liên kết ngẫu nhiên. Mỗi liên kết này có giới hạn thời gian (10 phút theo mặc định) và chỉ áp dụng cho 1 lần duy nhất. Chức năng chính của trang form GenLink là tạo và sao chép các liên kết này để chia sẻ cho người dùng, đặc biệc là khách hàng muốn tạo phiếu đăng ký.

**Form Registry**: Người dùng, khách hàng nhập thông tin đăng ký, nhận kết quả phiếu đăng ký cùng với thông báo từ hệ thống. Đồng thời, thông báo kết quả cũng sẽ được gửi đến người quản trị qua Telegram.

## Tính năng

- Liên kết duy nhất: Mỗi liên kết được tạo ra chỉ có thể truy cập và sử dụng duy nhất một lần, tăng cường tính bảo mật và kiểm soát việc thu thập dữ liệu.
- Thời hạn liên kết: Liên kết chỉ có hiệu lực trong một khoảng thời gian giới hạn (10 phút), tránh việc lạm dụng liên kết.
- Dễ dàng triển khai với Container: Ứng dụng được đóng gói hoàn toàn bằng Docker và Docker Compose, giúp việc cài đặt và triển khai trở nên nhanh chóng và dễ dàng trên mọi nền tảng hỗ trợ Docker.
- Tunneling với Ngrok: Sử dụng Ngrok để tạo tunnel, cho phép ứng dụng có thể truy cập công khai trên internet một cách nhanh chóng mà không cần cấu hình phức tạp về mạng.
- Thông báo Telegram: Người quản trị có thể nhận được thông báo qua Telegram mỗi khi có người dùng hoàn thành và gửi form, giúp theo dõi dữ liệu thu thập một cách hiệu quả.
- Giao diện đơn giản và dễ sử dụng: Cả form GenLink và form Registry đều có giao diện trực quan, dễ dàng thao tác cho cả người quản trị và người dùng cuối.

## Cấu trúc thư mục

```bash
├── Dockerfile # Tập tin đóng gói Docker.
├── docker-compose.yml #  Tập tin triển khai Docker Compose.
├── generator.py # Tập tin chứa logic chính của ứng dụng web.
├── requirements.txt # Tập tin chứa thư viện cần thiết.
├── .env # Tập tin chứa các thông tin nhạy cảm
└── templates # Thư mục chứa dự án web.
    ├── form_index.html # form Registry.
    ├── form_script.js # script Registry.
    ├── form_styles.css # style Registry.
    ├── index.html # form GenLink.
    └── style.css # stype GenLink.
```

## Bắt đầu nhanh

**Chú ý:** [Docker và docker-compose](https://docs.docker.com/compose/install/) phải được cài đặt.

Cần có 1 tài khoản [Ngork](https://dashboard.ngrok.com/) Login. Sau đó truy cập vào [Your Authtoken](https://dashboard.ngrok.com/get-started/your-authtoken) để lấy token và [domain name](https://dashboard.ngrok.com/domains) đăng ký.

![your-authtoken-ngork](https://ik.imagekit.io/kitto2k/tech/tutorial-markdown/your-authtoken-ngork.png?updatedAt=1739715996688) 

Cần có 1 tài khoản [Telegram Login](https://desktop.telegram.org/?setln=en). Chứa các thông tin về telegram như token, chat_id và thread_id.

![How to get sentitive telegram](https://ik.imagekit.io/kitto2k/tech/tutorial-markdown/how-to-get-telegram-bot-chat-id.png?updatedAt=1739716463191) 

### Bổ xung sensitive .env

```env
TOKEN_NGORK='2abcdefghijk_1234567890AbCdEfGhIj'
HOST_NGORK='form-registry.example.link'
SECRET_FLASK='aVeryLongAndRandomSecretKey_AvoidSimpleWords'
BASIC_AUTH_USERNAME='admin'
BASIC_AUTH_PASSWORD='StrongPassword123!@#$'
TELEGRAM_TOKEN='1234567890:AbCdEfGhIjKlMnOpQrStUvWxYz1234567890'
TELEGRAM_CHAT_ID='-1001234567890'
TELEGRAM_MESSAGE_THREAD_ID='123'
```

### Vụt docker-compose

```bash
docker-compose up -d
--->
[+] Running 3/3
 ✔ Network form-register-vm_default   Created   0.0s
 ✔ Container web                      Started   0.5s
 ✔ Container ngrok                    Started   0.7s
```

## Cách sử dụng

![form genlink](https://ik.imagekit.io/kitto2k/tech/tutorial-markdown/form-genlink.png?updatedAt=1739717711548) 

1. **Truy cập trang chủ:** Mở trình duyệt và truy cập với host site đã đăng ký.
2. **Nhấn nút "Tạo Link":**  Click vào nút **Tạo Link** (Tạo Liên Kết) trên trang chủ.
3. **Nhận liên kết:** Một liên kết duy nhất sẽ được tạo ra ngay lập tức.
4. **Chia sẻ liên kết:**  Sao chép và chia sẻ đường link này cho người cần phiếu đăng ký dịch vụ.

![form registry](https://ik.imagekit.io/kitto2k/tech/tutorial-markdown/form-registry.png?updatedAt=1739718601819) 

5. **Điền biểu mẫu:** Người nhận liên kết truy cập và điền đầy đủ thông tin vào biểu mẫu đăng ký.
6. **Nhận kết quả:** Sau khi nhập đủ thông tin, nhấn **Export**. Phiếu đăng ký sẽ hiển thị thông tin.

![form results](https://ik.imagekit.io/kitto2k/tech/tutorial-markdown/form-results.png?updatedAt=1739719452424) 

7. **Thông báo Telegram:**  Kết quả sẽ được gửi về tele với mẫu thông tin từ người dùng, khách hàng.

![form notify telegram](https://ik.imagekit.io/kitto2k/tech/tutorial-markdown/form-notiofy-telegram.png?updatedAt=1739718839871) 

## Thanks for reading!!!
