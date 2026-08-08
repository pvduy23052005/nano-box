## 📌 Loại thay đổi (Type of Change)

Đánh dấu `[x]` vào các mục phù hợp:

- [ ] 🚀 **Feat**: Tính năng mới
- [ ] 🐛 **Fix**: Sửa lỗi (Bug fix)
- [ ] 🔨 **Refactor**: Cải tiến code (không thay đổi logic/chức năng)
- [ ] ⚡ **Perf**: Tối ưu hiệu năng
- [ ] 🎨 **Style**: Thay đổi UI/UX hoặc format code
- [ ] 🧪 **Test**: Bổ sung hoặc sửa test case
- [ ] 📝 **Docs**: Cập nhật tài liệu
- [ ] 🚨 **Chore**: Cấu hình CI/CD, dependencies, build tool

---

## 🎯 Mô tả (Context & Problem)

- **Vấn đề cần giải quyết**: [Mô tả ngắn gọn bug hoặc yêu cầu tính năng]
- **Ticket / Issue ID**: `#123` hoặc `[JIRA-123]`

---

## 🛠️ Giải pháp triển khai (Solution & Changes)

- [Nêu ngắn gọn các thay đổi chính trong code]
- [Ví dụ: Thêm custom hook `useTypingEmitter` để debounce socket event]
- [Ví dụ: Tách `ChatGateway` ra namespace `/chat`]

---

## 📸 Hình ảnh / GIF minh họa (UI Changes)

| Trước thay đổi (Before) | Sau thay đổi (After) |
| ----------------------- | -------------------- |
| _Ảnh/Video_             | _Ảnh/Video_          |

---

## 🧪 Cách kiểm thử (How to Test)

1. **Bước 1**: ...
2. **Bước 2**: ...
3. **Kết quả mong đợi**: ...

---

## ⚠️ Tác động & Breaking Changes (Impact)

- [ ] Không có breaking change.
- [ ] Có breaking change: [Mô tả chi tiết tác động và cách migration]

---

## ✅ Kiểm tra trước khi gửi (Self-Checklist)

- [ ] Code tuân thủ quy chuẩn (Clean Code, Naming, Typing).
- [ ] Đã chạy `pnpm lint` / `pnpm type-check` thành công không lỗi.
- [ ] Không chứa `console.log` thừa, code comment không dùng đến.
- [ ] Đã tự kiểm thử trên môi trường local (Mobile & Desktop nếu là UI).
- [ ] Đã xử lý các trường hợp Edge Case (Edge cases, Error handling, Loading state).
