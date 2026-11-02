# 📚 BookShelf - MMA301 Practical Exam Skeleton

Dự án mẫu và khung sườn ứng dụng **BookShelf** được xây dựng bằng **React Native (Expo)** + **TypeScript (.tsx)** + **Firebase (Auth & Firestore)** phục vụ cho kỳ thi thực hành **MMA301 (Fall 2026)**.

---

## 📁 Cấu trúc thư mục dự án

```text
PE-MMA/
├── src/
│   ├── config/
│   │   └── firebase.ts          # Khởi tạo Firebase Auth & Firestore từ biến môi trường
│   ├── types/
│   │   └── index.ts             # Định nghĩa Type: Book, Genre, Status, Form, Navigation
│   ├── context/
│   │   └── AuthContext.tsx      # Quản lý Auth state (User, loading, signOut)
│   ├── navigation/
│   │   └── AppNavigator.tsx     # Điều hướng React Navigation: Home, Login, Register, List, Detail
│   ├── components/
│   │   ├── Header.tsx           # Header hiển thị email & nút Logout hoặc Login/Register
│   │   ├── Input.tsx            # Ô nhập liệu có validation error message
│   │   ├── Button.tsx           # Nút bấm chuẩn hóa UI
│   │   └── Summary.tsx          # Thống kê book-count, favorite-count, breakdown
│   ├── screens/
│   │   ├── HomeScreen.tsx       # Màn hình public (home-title, 3 feature cards, auth buttons)
│   │   ├── LoginScreen.tsx      # Màn hình đăng nhập (email, password, error-auth)
│   │   ├── RegisterScreen.tsx   # Màn hình đăng ký (email, password, confirmPassword, form-success)
│   │   ├── ListScreen.tsx       # Màn hình chính (list-screen, book-form, book-item, books-empty, filter & search)
│   │   └── DetailScreen.tsx     # Chi tiết sách, xem/sửa (view/edit mode) & xóa (Delete confirm)
│   └── services/
│       ├── firebaseAuth.ts      # Gọi API Firebase Authentication (login, register, logout)
│       └── bookService.ts       # Gọi API Firestore CRUD & kiểm tra trùng lặp title + author
├── .env                         # Chứa Firebase config thật (không nộp file này)
├── .env.example                 # Mẫu cấu hình môi trường (nộp kèm trong zip)
├── .gitignore                   # Loại trừ node_modules, .expo, .env
├── app.json                     # Cấu hình Expo
├── App.tsx                      # Root App (wrap SafeAreaProvider & AuthProvider)
├── firestore.rules              # Quy tắc bảo mật Firestore (nộp ở thư mục gốc)
├── index.ts                     # Entry point đăng ký ứng dụng
├── package.json                 # Khai báo thư viện và script
└── tsconfig.json                # Cấu hình TypeScript
```

---

## 🛠️ Hướng dẫn cài đặt & Thiết lập Firebase từ A - Z

### Bước 1: Tạo dự án Firebase
1. Truy cập [Firebase Console](https://console.firebase.google.com/) và đăng nhập tài khoản Google.
2. Bấm **Add project**, đặt tên dự án (ví dụ: `bookshelf-qe200012`), bấm **Continue** và hoàn tất tạo project.

### Bước 2: Bật Firebase Authentication (Email/Password)
1. Trong thanh menu bên trái, chọn **Build** → **Authentication** → bấm **Get started**.
2. Tại tab **Sign-in method**, chọn **Email/Password**.
3. Bật công tắc **Enable** ở dòng đầu tiên (Email/Password), bấm **Save**.
4. Chuyển sang tab **Users**, bấm **Add user** để tạo sẵn 1 tài khoản test cho giám khảo:
   - **Email:** `grader.<MãSinhViên>@example.com` (ví dụ: `grader.qe200012@example.com`)
   - **Password:** `Test1234!` (hoặc mật khẩu theo yêu cầu)

### Bước 3: Tạo cơ sở dữ liệu Cloud Firestore & Cài đặt Rules
1. Trong thanh menu bên trái, chọn **Build** → **Firestore Database** → bấm **Create database**.
2. Chọn vị trí server (ví dụ: `asia-southeast1` hoặc mặc định), chọn **Start in test mode** hoặc **Start in production mode** → bấm **Create**.
3. Chuyển sang tab **Rules**, sao chép toàn bộ nội dung từ file `firestore.rules` trong dự án và dán vào đây:
   - Rules này đảm bảo:
     - Chỉ người dùng đã đăng nhập mới đọc/ghi được dữ liệu của chính họ (`userId == request.auth.uid`).
     - Người chưa đăng nhập không thể đọc/ghi bất kỳ dữ liệu nào.
     - Kiểm tra dữ liệu hợp lệ: `title` (bắt buộc, <= 100 ký tự), `author` (bắt buộc, <= 60 ký tự), `genre` (Fiction, Non-Fiction, Academic, Other), `status` (To Read, Reading, Finished), `rating` (0 - 5), `notes` (<= 300 ký tự).
4. Bấm **Publish** để áp dụng rules.

### Bước 4: Lấy thông tin cấu hình (Firebase SDK Web Config)
1. Bấm vào biểu tượng bánh răng **Project settings** (ở góc trên bên trái).
2. Cuộn xuống mục **Your apps**, bấm vào biểu tượng Web `</>` để đăng ký ứng dụng web.
3. Đặt App nickname (ví dụ: `BookShelfApp`) → bấm **Register app**.
4. Sao chép các giá trị trong biến `firebaseConfig`:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

### Bước 5: Điền cấu hình vào file `.env`
Mở file `.env` trong thư mục gốc dự án và điền các giá trị vừa lấy:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
EXPO_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:...
```

---

## 🚀 Cách chạy ứng dụng

1. Cài đặt các thư viện (chạy ở Terminal máy tính của bạn):
   ```bash
   npm install
   ```

2. Khởi chạy ứng dụng Expo:
   ```bash
   npx expo start
   ```
   - Nhấn `w` để mở giao diện Web trên trình duyệt.
   - Hoặc quét mã QR bằng ứng dụng **Expo Go** trên điện thoại iOS / Android.

---

## 📋 Checklist 16 Ảnh chụp màn hình cần nộp trong `<StudentCode>.docx`

Theo đúng yêu cầu mục 3 của đề bài:
1. **Firebase console — Authentication:** Danh sách Users hiển thị tài khoản test của grader.
2. **Firebase console — Firestore data:** Collection `books` có ít nhất 3 documents thuộc tài khoản test.
3. **Firebase console — Security Rules:** Tab Rules hiển thị các quy tắc đã Publish trên console.
4. **Register screen — validation:** Bấm submit khi form trống, hiển thị các thông báo lỗi.
5. **Register screen — success:** Ngay sau khi đăng ký thành công, hiển thị `Registration successful`.
6. **Login screen:** Form đăng nhập trống.
7. **List screen — after login:** Hiển thị email của user, nút Logout và ít nhất 3 sách trong danh sách.
8. **Add Book form — validation:** Bấm submit form thêm sách khi để trống hoặc nhập sai, hiển thị các lỗi.
9. **Add Book form — success:** Ngay sau khi thêm sách thành công, hiển thị `Book added` và sách mới xuất hiện trong list.
10. **Filters and search:** Bộ lọc Genre, Status, Favorites-only switch và ô Search thay đổi danh sách hiển thị.
11. **Summary:** Hiển thị `book-count`, `favorite-count` và bảng phân tích trạng thái (Status breakdown).
12. **Detail screen — view mode:** Xem đầy đủ chi tiết 1 cuốn sách (title, author, genre, status, rating, notes).
13. **Detail screen — edit mode, validation:** Chế độ sửa, bấm lưu với dữ liệu lỗi hiển thị các thông báo lỗi.
14. **Detail screen — after Save:** Hiển thị các giá trị đã được sửa và lưu thành công.
15. **Favorite toggle and Delete:** Cặp ảnh trước/sau khi bấm toggle ngôi sao favorite, và xóa sách thành công.
16. **Empty state:** Màn hình `books-empty` hiển thị chữ `No books found` (dùng tài khoản test thứ 2 chưa có sách).

---

## 📦 Hướng dẫn đóng gói nộp bài

Tạo thư mục tên `<MãSinhViên>` chứa 2 file:
1. `<StudentCode>.docx`: Bảng thông tin sinh viên + link Github + link Expo + Firebase info + 16 ảnh chụp có caption.
2. `<StudentCode>.zip`: Mã nguồn gồm `package.json`, lock file, `src/`, `app.json`, `App.tsx`, `firestore.rules`, `.env.example`.
   - **LƯU Ý QUAN TRỌNG:** Tuyệt đối KHÔNG nén thư mục `node_modules/`, `.expo/`, `.git/` hoặc file `.env` chứa key thật!

