# Ứng dụng Tạo Liên Kết Đăng Ký Endpoint Metrics Một Lần Dùng

## Giới thiệu

Dự án này cung cấp một dịch vụ web đơn giản để tạo ra các liên kết một lần sử dụng, phục vụ cho việc đăng ký endpoint metrics. Ứng dụng được xây dựng nhằm mục đích đơn giản hóa quá trình thu thập thông tin cần thiết khi tích hợp các dịch vụ và hạ tầng vào hệ thống giám sát metrics, ví dụ như VictoriaMetrics.

Điểm đặc biệt của ứng dụng là các liên kết được tạo ra chỉ có giá trị trong vòng 10 phút và cho phép truy cập duy nhất một lần. Điều này giúp tăng cường tính bảo mật và kiểm soát việc sử dụng liên kết, tránh lạm dụng hoặc truy cập trái phép.

## Tính năng chính

- **Tạo liên kết một lần dùng:**  Dễ dàng tạo ra các liên kết duy nhất cho biểu mẫu đăng ký metrics.
- **Thời hạn liên kết:** Mỗi liên kết chỉ có hiệu lực trong 10 phút, đảm bảo tính kịp thời và kiểm soát.
- **Truy cập duy nhất:** Mỗi liên kết chỉ được phép truy cập một lần, tăng cường bảo mật thông tin đăng ký.
- **Giao diện thân thiện:**  Giao diện web đơn giản, dễ sử dụng để tạo liên kết.
- **Biểu mẫu đăng ký chi tiết:**  Cung cấp biểu mẫu thu thập đầy đủ thông tin cần thiết cho việc đăng ký metrics của dịch vụ và hạ tầng.
- **Triển khai dễ dàng với Docker:**  Đóng gói và triển khai ứng dụng một cách nhanh chóng và nhất quán với Docker.
- **Gửi thông báo Telegram (Tùy chọn):**  Sau khi người dùng hoàn tất đăng ký, thông tin có thể được gửi trực tiếp đến kênh Telegram của admin để xử lý (tính năng này cần được cấu hình ở backend).

## Cách sử dụng

1. **Truy cập trang chủ:** Mở trình duyệt và truy cập vào trang chủ của ứng dụng.
2. **Nhấn nút "Tao Link":**  Click vào nút **Tao Link** (Tạo Liên Kết) trên trang chủ.
3. **Nhận liên kết:** Một liên kết duy nhất và một lần sử dụng sẽ được tạo ra ngay lập tức.
4. **Chia sẻ liên kết:**  Sao chép và chia sẻ liên kết này cho người cần đăng ký endpoint metrics.
5. **Điền biểu mẫu:** Người nhận liên kết truy cập và điền đầy đủ thông tin vào biểu mẫu đăng ký metrics.
6. **Xem thông tin đăng ký:** Sau khi hoàn tất biểu mẫu, thông tin đăng ký sẽ được hiển thị trên trang kết quả.
7. **Thông báo Telegram (nếu được cấu hình):**  Nếu tính năng Telegram được kích hoạt ở backend, admin sẽ nhận được thông báo về đăng ký mới qua kênh Telegram.

**Lưu ý về Telegram:**

> Tính năng gửi thông báo Telegram là **tùy chọn** và có thể cần được cấu hình thêm ở phía backend của ứng dụng (ví dụ: thêm thư viện `python-telegram-bot`, bot token, và logic gửi tin nhắn). Trong mã nguồn mẫu này, tính năng Telegram chưa được triển khai trực tiếp.

## Triển khai với Docker

Để triển khai ứng dụng này bằng Docker, bạn cần thực hiện các bước sau:

1. **Build Docker image:**  Sử dụng Dockerfile đã cung cấp để build image.

```bash
docker build -t endpoint-metrics-generator .
```

2. **Chạy Docker container**: Khởi chạy container và map port 20030 của container ra ngoài host.

```bash
docker run -d --name generator-link -p 80:8080 generator-link
```
