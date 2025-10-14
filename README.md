# Đại hội Đoàn Trung tâm 386 (2025-2030)

Trang web giới thiệu văn kiện Đại hội, kèm hệ thống thu nhận ý kiến chạy trên Node.js và lưu trữ nội bộ vào tệp văn bản `ykien.txt`.

## Cấu trúc dự án

- `index.html`: Trang chủ với khu vực giới thiệu, danh sách văn kiện và biểu mẫu góp ý.
- `styles.css`: Toàn bộ định dạng giao diện với tông màu xanh Đoàn.
- `script.js`: Điều khiển tương tác mở tài liệu PDF và giao tiếp với API góp ý.
- `server.js`: Máy chủ Express phục vụ nội dung tĩnh và cung cấp API đọc/ghi ý kiến.
- `ykien.txt`: Tệp văn bản chứa toàn bộ ý kiến được ghi nhận (mỗi dòng là một bản ghi ở định dạng JSON).
- `assets/`: Lưu logo và các tập tin PDF chính thức.
- `package.json`: Khai báo phụ thuộc và các lệnh tiện ích.

## Thiết lập và chạy cục bộ

1. Cài đặt Node.js (phiên bản 18 trở lên được khuyến nghị).
2. Cài đặt phụ thuộc:
   ```bash
   npm install
   ```
3. Khởi chạy máy chủ ở chế độ production:
   ```bash
   npm start
   ```
   Máy chủ sẽ phục vụ trang tại [http://localhost:3000](http://localhost:3000) và tự tạo tệp `ykien.txt` nếu chưa tồn tại.
4. Trong quá trình phát triển, bạn có thể dùng chế độ tự tải lại:
   ```bash
   npm run dev
   ```

## Luồng lưu trữ ý kiến

- Phía client gửi yêu cầu `POST /api/feedbacks` với trường `name`, `unit`, `message`.
- Máy chủ xác thực dữ liệu, sinh mã định danh và đóng dấu thời gian, sau đó nối thêm bản ghi mới vào cuối tệp `ykien.txt`.
- Tất cả ý kiến được đọc từ `ykien.txt` (dạng JSON-lines) rồi trả về qua `GET /api/feedbacks` để hiển thị trên bảng tổng hợp.

## Truy cập văn kiện

- Khi truy cập từ máy tính bàn hoặc laptop, mỗi văn kiện mở trong modal hiển thị PDF ngay trên trang để tiện theo dõi.
- Khi truy cập từ thiết bị di động, trang web tự động chuyển sang chế độ tải tệp, giúp tránh lỗi tràn khung trên trình duyệt iOS/Android và bảo đảm người dùng có thể xem toàn bộ tài liệu sau khi tải về.

## Triển khai

Máy chủ Express cần một môi trường hỗ trợ Node.js (Render, Railway, Heroku, VPS...). GitHub Pages chỉ cung cấp hosting tĩnh nên không thể trực tiếp lưu ý kiến vào tệp JSON. Nếu vẫn muốn dùng GitHub Pages cho giao diện, bạn có thể:

1. Triển khai máy chủ Node.js lên một dịch vụ hỗ trợ backend.
2. Cập nhật `fetch` trong `script.js` trỏ tới domain của API vừa triển khai (ví dụ `https://api.example.com/api/feedbacks`).
3. Đưa thư mục tĩnh (`index.html`, `styles.css`, `script.js`, `assets/`) lên GitHub Pages.

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
4. (Tuỳ chọn) Bật GitHub Pages tại phần **Settings → Pages**, chọn nhánh `work` (hoặc `main` sau khi hợp nhất) và thư mục gốc nếu muốn phục vụ giao diện tĩnh. Khi đó vẫn cần cấu hình API backend như hướng dẫn ở trên.

## Đóng góp

1. Tạo nhánh mới từ `work`.
2. Commit thay đổi và mở Pull Request.
3. Mô tả rõ ràng chức năng/bản vá và đính kèm ảnh chụp màn hình nếu có thay đổi giao diện.
