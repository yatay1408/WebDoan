# Đại hội Đoàn Trung tâm 386 (2025-2030)

Trang web tĩnh dùng để trình bày các văn kiện Đại hội và thu thập ý kiến đóng góp ẩn danh.

## Cấu trúc dự án

- `index.html`: Trang chủ với khu vực giới thiệu, danh sách văn kiện và biểu mẫu góp ý.
- `styles.css`: Toàn bộ định dạng giao diện với tông màu xanh Đoàn.
- `script.js`: Điều khiển tương tác mở tài liệu PDF và lưu ý kiến vào bộ nhớ trình duyệt.
- `assets/`: Lưu logo và các tập tin PDF mẫu.

## Chạy dự án cục bộ

Vì đây là trang web tĩnh, bạn có thể mở trực tiếp `index.html` bằng trình duyệt. Để thuận tiện hơn, hãy chạy một máy chủ HTTP đơn giản:

```bash
python -m http.server 8000
```

Sau đó truy cập `http://localhost:8000` và mở thư mục dự án để xem trang web.

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

## Đóng góp

1. Tạo nhánh mới từ `work`.
2. Commit thay đổi và mở Pull Request.
3. Mô tả rõ ràng chức năng/bản vá và đính kèm ảnh chụp màn hình nếu có thay đổi giao diện.

