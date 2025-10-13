# Đại hội Đoàn Trung tâm 386 (2025-2030)

Trang web giới thiệu văn kiện Đại hội, kèm hệ thống thu nhận ý kiến có lưu trữ cơ sở dữ liệu để Ban Tổ chức tổng hợp.

## Cấu trúc dự án

- `index.html`: Trang chủ với khu vực giới thiệu, danh sách văn kiện và biểu mẫu góp ý có trường họ tên, đơn vị.
- `styles.css`: Toàn bộ định dạng giao diện với tông màu xanh Đoàn.
- `script.js`: Điều khiển tương tác mở tài liệu PDF và đồng bộ ý kiến với API backend.
- `server.js`: Máy chủ HTTP thuần Node phục vụ nội dung tĩnh và cung cấp API ghi/lấy ý kiến.
- `data/`: Thư mục chứa cơ sở dữ liệu `feedbacks.json` (tự động tạo khi chạy server).
- `assets/`: Lưu logo và các tập tin PDF mẫu.

## Chuẩn bị môi trường

Máy chủ yêu cầu Node.js >= 18 (không cần cài thêm thư viện ngoài).

## Chạy dự án cục bộ

Chạy máy chủ Node phục vụ website và API cơ sở dữ liệu:

```bash
npm start
```

Server sẽ lắng nghe tại `http://localhost:3000`. Truy cập địa chỉ này để xem trang web và gửi ý kiến.

### Kiểm tra nhanh

Lệnh sau giúp kiểm tra cú pháp máy chủ:

```bash
npm test
```

## API góp ý

- `GET /api/feedback`: Trả về danh sách ý kiến (mới nhất lên trước).
- `POST /api/feedback`: Nhận payload JSON `{ "name": "...", "unit": "...", "message": "..." }` và lưu vào tệp cơ sở dữ liệu.

## Đưa dự án lên GitHub

1. Tạo một repository trống trên GitHub (ví dụ `doan-386-web`).
2. Thêm remote tới repository đó:
   ```bash
   git remote add origin https://github.com/<tai-khoan>/<ten-repo>.git
   ```
3. Đảm bảo mọi thay đổi đã được commit rồi đẩy mã nguồn:
   ```bash
   git push -u origin work
   ```
4. (Tuỳ chọn) Bật GitHub Pages tại phần **Settings → Pages**, chọn nhánh `work` (hoặc `main` sau khi hợp nhất) và thư mục gốc.
5. Chờ GitHub xây dựng rồi truy cập URL mà GitHub Pages cung cấp để xem trang web trực tuyến.
   > Lưu ý: API góp ý cần chạy Node server nên không hoạt động trên GitHub Pages tĩnh. Hãy triển khai riêng (ví dụ Render, Railway...).

## Đóng góp

1. Tạo nhánh mới từ `work`.
2. Commit thay đổi và mở Pull Request.
3. Mô tả rõ ràng chức năng/bản vá và đính kèm ảnh chụp màn hình nếu có thay đổi giao diện.

