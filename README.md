# 🎬 CineList - MMA301 Practical Exam (FALL 2026)

Ứng dụng quản lý danh sách phim cá nhân (**CineList**) được xây dựng bằng **React Native (Expo)** + **TypeScript (.tsx)** + **Firebase (Auth & Firestore)**.

---

## 📁 Cấu trúc thư mục dự án

```text
PE-MMA/
├── src/
│   ├── config/
│   │   └── firebase.ts          # Khởi tạo Firebase Auth & Firestore từ biến môi trường
│   ├── types/
│   │   └── index.ts             # Định nghĩa Type: Movie, Genre, MovieStatus, Form, Navigation
│   ├── context/
│   │   └── AuthContext.tsx      # Quản lý Auth state (User, loading, signOut)
│   ├── navigation/
│   │   └── AppNavigator.tsx     # Điều hướng Navigation: Home, Login, Register, List, Detail
│   ├── components/
│   │   ├── Header.tsx           # Header hiển thị Email & Logout hoặc nút Login/Register
│   │   ├── Input.tsx            # Ô nhập liệu chuẩn hóa có hiển thị lỗi validation
│   │   ├── Button.tsx           # Nút bấm đồng bộ giao diện
│   │   └── Summary.tsx          # Thống kê movie-count, favorite-count, status breakdown
│   ├── screens/
│   │   ├── HomeScreen.tsx       # Màn hình public (home-title, 3 feature cards, auth buttons)
│   │   ├── LoginScreen.tsx      # Màn hình đăng nhập (email, password, error-auth)
│   │   ├── RegisterScreen.tsx   # Màn hình đăng ký (email, password, confirmPassword, form-success)
│   │   ├── ListScreen.tsx       # Màn hình danh sách (list-screen, movie-form, movie-item, movies-empty, filter & search)
│   │   └── DetailScreen.tsx     # Chi tiết phim, xem/sửa (view/edit mode) & xóa (Delete confirm)
│   └── services/
│       ├── firebaseAuth.ts      # Gọi API Firebase Authentication (login, register, logout)
│       └── movieService.ts      # Gọi API Firestore CRUD & kiểm tra trùng lặp title + director
├── .env                         # Chứa Firebase config thật (không nộp file này)
├── .env.example                 # Mẫu cấu hình môi trường (nộp kèm trong zip)
├── .gitignore                   # Loại trừ node_modules, .expo, .env
├── .npmrc                       # Cấu hình legacy-peer-deps cho EAS Build
├── app.json                     # Cấu hình Expo app (name: CineList, slug: pe-mma)
├── App.tsx                      # Root App (wrap SafeAreaProvider & AuthProvider)
├── eas.json                     # Cấu hình build file APK cho Android
├── firestore.rules              # Quy tắc bảo mật Firestore (collection: movies)
├── index.ts                     # Entry point đăng ký ứng dụng
├── package.json                 # Khai báo dependencies
├── tsconfig.json                # Cấu hình TypeScript
└── README.md                    # Hướng dẫn chi tiết
```

---

## 📋 Checklist 16 Ảnh chụp màn hình nộp trong `<StudentCode>.docx`

1. **Firebase console — Authentication:** Danh sách Users hiển thị tài khoản test của grader (`grader.<MãSV>@example.com`).
2. **Firebase console — Firestore data:** Collection `movies` có ít nhất 3 documents thuộc tài khoản test.
3. **Firebase console — Security Rules:** Tab Rules hiển thị các quy tắc đã Publish trên console.
4. **Register screen — validation:** Bấm submit khi form trống, hiển thị các thông báo lỗi.
5. **Register screen — success:** Ngay sau khi đăng ký thành công, hiển thị `Registration successful`.
6. **Login screen:** Form đăng nhập trống.
7. **List screen — after login:** Hiển thị email của user, nút Logout và ít nhất 3 phim trong danh sách.
8. **Add Movie form — validation:** Bấm submit form thêm phim khi để trống hoặc nhập sai, hiển thị các lỗi.
9. **Add Movie form — success:** Ngay sau khi thêm phim thành công, hiển thị `Movie added` và phim mới xuất hiện trong list.
10. **Filters and search:** Bộ lọc Genre (Action/Comedy/Drama/Horror), Status (Plan to Watch/Watching/Watched), Favorites-only switch và ô Search thay đổi danh sách hiển thị.
11. **Summary:** Hiển thị `movie-count`, `favorite-count` và bảng phân tích trạng thái (Status breakdown).
12. **Detail screen — view mode:** Xem đầy đủ chi tiết 1 bộ phim (title, director, genre, status, rating, notes).
13. **Detail screen — edit mode, validation:** Chế độ sửa, bấm lưu với dữ liệu lỗi hiển thị các thông báo lỗi.
14. **Detail screen — after Save:** Hiển thị các giá trị đã được sửa và lưu thành công.
15. **Favorite toggle and Delete:** Cặp ảnh trước/sau khi bấm toggle ngôi sao favorite, và xóa phim thành công.
16. **Empty state:** Màn hình `movies-empty` hiển thị chữ `No movies found` (dùng tài khoản test thứ 2 chưa có phim).
