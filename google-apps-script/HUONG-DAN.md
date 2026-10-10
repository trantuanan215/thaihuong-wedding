# Cài đặt lưu lời chúc + xác nhận tham dự (Google Sheets)

Lời chúc và xác nhận tham dự được lưu vào một Google Sheet của bạn qua Google Apps Script — miễn phí, không cần server.

## 1. Tạo Google Sheet + script
1. Vào https://sheets.new tạo bảng tính mới, đặt tên ví dụ `Đám cưới Thái Hương`.
2. Menu **Tiện ích mở rộng → Apps Script**.
3. Xoá code mẫu, dán toàn bộ nội dung file `guestbook-backend.gs`, bấm **Lưu**.

## 2. Triển khai (Deploy)
1. Bấm **Triển khai → Tùy chọn triển khai mới**.
2. Chọn loại **Ứng dụng web**.
   - *Thực thi dưới dạng*: **Tôi**
   - *Người có quyền truy cập*: **Bất kỳ ai**
3. Bấm **Triển khai**, cấp quyền cho tài khoản Google của bạn.
4. Copy **URL ứng dụng web** (dạng `https://script.google.com/macros/s/…/exec`).

## 3. Gắn vào trang
Mở `guestbook-config.js`, dán URL vào:
```js
window.GUESTBOOK_API_URL = 'https://script.google.com/macros/s/XXXX/exec';
```

## 4. Quản lý
- Tab **LoiChuc**: mọi lời chúc. Muốn ẩn lời chúc nào thì gõ `x` vào cột **Ẩn** (hoặc xoá dòng).
- Tab **XacNhan**: danh sách khách xác nhận có / không tham dự.
- Hai tab tự tạo ở lần gửi đầu tiên.
- Nếu sửa code script: **Triển khai → Quản lý triển khai → ✏️ → Phiên bản: Mới** để giữ nguyên URL.

# Đăng lên GitHub Pages
1. Tạo repo **public** trên GitHub (GitHub Pages miễn phí cho repo public).
2. Đẩy code lên (thư mục `images/` đã được bỏ qua bằng `.gitignore`).
3. Repo → **Settings → Pages** → Source: *Deploy from a branch*, chọn `main` / `(root)` → Save.
4. Sau 1–2 phút trang có ở `https://<tên-tài-khoản>.github.io/<tên-repo>/`.

## Tên miền riêng: thaihuong-wedding.io.vn
File `CNAME` trong repo đã khai báo sẵn tên miền. Ở trang quản lý DNS của nhà cung cấp tên miền, thêm:

| Loại | Tên | Giá trị |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | `<tên-tài-khoản>.github.io` |

Sau đó vào repo → **Settings → Pages**: ô *Custom domain* hiện `thaihuong-wedding.io.vn`, đợi DNS cập nhật rồi tick **Enforce HTTPS**.

# Trang quản lý ảnh (admin)
Trang: `https://thaihuong-wedding.io.vn/quan-ly-anh.html` (không có nút nào trỏ tới từ thiệp, Google không index).
Cho phép chọn ảnh từ thư viện có sẵn cho từng khung ảnh của Theme 1 / Theme 2 và đổi thứ tự album. Không upload ảnh.

## Cài đặt (1 lần)
1. Mở Apps Script → dán lại toàn bộ code mới từ `guestbook-backend.gs` → **Lưu**.
2. **Cài đặt dự án (⚙️ Project Settings) → Script properties → Thêm thuộc tính**:
   - Thuộc tính: `ADMIN_KEY`
   - Giá trị: mật khẩu admin bạn tự đặt (đừng chia sẻ)
3. **Triển khai → Quản lý triển khai → ✏️ → Phiên bản: Phiên bản mới → Triển khai** (giữ nguyên URL).

## Sử dụng
- Đăng nhập bằng mật khẩu `ADMIN_KEY`, chọn tab Theme 2 / Theme 1 / Album.
- **Đổi ảnh**: chọn ảnh khác cho khung; **thanh trượt**: chỉnh phần ảnh hiển thị (trên ↔ dưới); **Mặc định**: trả về ảnh gốc.
- **Album**: kéo thả (máy tính) hoặc ◀ ▶ (điện thoại).
- Bấm **Lưu thay đổi** — khách mở thiệp thấy ngay, không cần sửa code.
- Cấu hình được lưu trong Script properties với tên `PHOTO_CONFIG`; xoá thuộc tính này = về toàn bộ mặc định.
