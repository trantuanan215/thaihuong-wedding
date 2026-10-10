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
