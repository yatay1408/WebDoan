# Đại hội Đoàn Trung tâm 386 (2025-2030)

Trang web giới thiệu văn kiện Đại hội, kèm hệ thống thu nhận ý kiến sử dụng Firebase Firestore để lưu trữ tập trung và có thể triển khai trên GitHub Pages tĩnh.

## Cấu trúc dự án

- `index.html`: Trang chủ với khu vực giới thiệu, danh sách văn kiện và biểu mẫu góp ý có trường họ tên, đơn vị.
- `styles.css`: Toàn bộ định dạng giao diện với tông màu xanh Đoàn.
- `script.js`: Điều khiển tương tác mở tài liệu PDF, carousel và kết nối Firebase để tải/gửi ý kiến.
- `feedback-config.js`: Khai báo thông số Firebase (bạn cần cập nhật bằng cấu hình dự án thật).
- `assets/`: Lưu logo và các tập tin PDF mẫu.

## Thiết lập Firebase Firestore

1. Tạo một dự án Firebase mới tại [console.firebase.google.com](https://console.firebase.google.com/).
2. Bật Firestore Database ở chế độ Production và tạo **bộ sưu tập** (collection) ví dụ `feedbacks`.
3. Tạo một ứng dụng Web trong dự án, sao chép cấu hình Firebase.
4. Cập nhật tệp `feedback-config.js` với các giá trị thật:
   ```js
   export const firebaseConfig = {
     apiKey: '...',
     authDomain: '...',
     projectId: '...',
     storageBucket: '...',
     messagingSenderId: '...',
     appId: '...'
   };
   export const feedbackCollection = 'feedbacks';
   ```
5. Thiết lập quy tắc bảo mật Firestore phù hợp, ví dụ cho phép ghi/đọc đối với người dùng đã xác thực hoặc viết quy tắc tuỳ chỉnh.

> **Lưu ý:** Thông tin cấu hình Firebase không phải bí mật tuyệt đối, tuy nhiên bạn nên giới hạn quyền ghi bằng quy tắc Firestore để tránh spam.

## Chạy dự án cục bộ

Không cần backend: mở file `index.html` trực tiếp bằng trình duyệt (hoặc dùng bất kỳ máy chủ tĩnh nào như `python -m http.server`).

## Đưa dự án lên GitHub Pages

- Sau khi cập nhật `feedback-config.js`, commit toàn bộ mã nguồn và đẩy lên GitHub.
- Truy cập **Settings → Pages** trong repository, chọn nhánh triển khai và thư mục `/` (root).
- GitHub Pages sẽ phục vụ site tĩnh, còn Firestore xử lý đọc/ghi ý kiến ở phía client.

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
   > Website và phần góp ý sẽ hoạt động hoàn toàn trên GitHub Pages nhờ Firebase.

## Đóng góp

1. Tạo nhánh mới từ `work`.
2. Commit thay đổi và mở Pull Request.
3. Mô tả rõ ràng chức năng/bản vá và đính kèm ảnh chụp màn hình nếu có thay đổi giao diện.

