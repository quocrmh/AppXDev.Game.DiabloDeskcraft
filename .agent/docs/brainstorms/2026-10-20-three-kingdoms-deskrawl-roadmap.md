# Thiết Kế Tổng Thể & Roadmap 12 Phases: Tam Quốc Deskrawl (Transparent Pixel-Art Desktop ARPG)

> **Trạng thái:** 100% Hoàn Tất (Phases 1 – 12)
> **Ngày cập nhật:** 2026-10-20

## 1. Kiến Trúc Cốt Lõi & Giao Diện Chuẩn Deskrawl: Idle ARPG
1. **Nền Trong Suốt 100% (`transparent: true`) & Đường Hành Quân Sát Đáy Màn Hình (`groundY = H - 20`)**: Quân đoàn Tam Quốc và Xe Lương Thảo (*Mộc Ngưu Lưu Mã*) chạy trực tiếp dọc theo mép dưới màn hình Windows.
2. **Thanh Tiến Độ 4 Mốc (`💀 ━━ 💀 ━━ 💀 ━━ 👑`) & Thanh Máu Boss Diablo**:
   - Đợt 1, 2, 3 (`💀`): Xuất hiện ngay Tiểu Boss Trấn Ải (`[TIÊN PHONG]`, `[TẢ QUÂN]`, `[HỮU QUÂN]`).
   - Đợt 4 (`👑`): Xuất hiện Chủ Soái Trấn Ải (`[CHỦ SOÁI]`).
   - Có thể click trực tiếp vào từng nút `💀` hoặc `👑` để triệu hồi Boss ngay lập tức.
3. **Mưa Chiến Lợi Phẩm Diablo (`Loot Fountain`)**: Hạ Boss nổ văng 2–4 Trang Bị + Rương Hoàng Kim + Huyền Thiết + Đầu Lâu Boss (`💀`) + Mảnh Hồn Tướng (`🏮`) phát cột sáng thẳng đứng nhiều màu.
4. **Chế Độ Doanh Trại Tiền Tuyến (`🏕️ Doanh Trại`)**: 4 gian hàng NPC tương tác trực tiếp trên đường (`⚒ Thợ Rèn`, `🏮 Điểm Tướng Đài`, `📕 Thái Học Viện`, `🗺️ Sa Bàn`).

## 2. Bảng Tổng Hợp 12 Phases Phát Triển

| Giai Đoạn | Hạng Mục Thực Thi | Trạng Thái |
| :--- | :--- | :--- |
| **Phase 1** | **Nền Trong Suốt 100% (`transparent: true`) + Click-Through Desktop Overlay** | ✅ Hoàn tất |
| **Phase 2** | **Hoạt Ảnh 2D Pixel Art Sprite Sheet 4-Frame & Tự Động Khử Nền (`cleanSpriteImage`)** | ✅ Hoàn tất |
| **Phase 3** | **Hệ Thống Tự Do Lắp Ghép 4 Ô Võ Kỹ (`equippedSkillHeroIds`)** | ✅ Hoàn tất |
| **Phase 4** | **HUD Chuẩn Deskrawl (Cầu Máu/Nộ Đôi, Bình Thuốc `🧪`, Thanh Máu Boss Giữa, Thanh `💀 💀 💀 👑` Phải)** | ✅ Hoàn tất |
| **Phase 5** | **Đại Bách Tướng 60 Danh Tướng (15 Thục, 15 Ngụy, 15 Ngô, 15 Quần) & Thái Thú Trấn 13 Châu (`PROVINCES_13`)** | ✅ Hoàn tất |
| **Phase 6** | **6 Ấn Biến Đổi Kỹ Năng (`SKILL_RUNES` kiểu Diablo / PoE)** | ✅ Hoàn tất |
| **Phase 7** | **6 Bộ Thần Trang Danh Tướng (`ITEM_SETS` - Đồ Xanh Lá Diablo) & Lò Rèn `+1..+15`** | ✅ Hoàn tất |
| **Phase 8** | **Chế Độ Boss Rush "Quá Ngũ Quan Trảm Lục Tướng" (`GAUNTLET_PASSES`) & Âm Thanh 16-Bit** | ✅ Hoàn tất |
| **Phase 9** | **Cây Thiên Phú Chiến Đấu 5 Bậc × 3 Nút Tròn (`COMBAT_TALENTS` - 15 Nút, `0/5` Điểm/Nút)** | ✅ Hoàn tất |
| **Phase 10** | **Thương Hội Đầu Lâu Boss & Đổ Thần Binh (`gambleSkullItem` — `3💀 / 8💀 / 15💀`)** | ✅ Hoàn tất |
| **Phase 11** | **Rớt Mảnh Hồn Tướng & Tự Động Thu Phục Chủ Soái (`heroShards` — `🏮 3/3`)** | ✅ Hoàn tất |
| **Phase 12** | **Hệ Thống 8 Duyên Phận Danh Tướng Lịch Sử (`HERO_BONDS`)** | ✅ Hoàn tất |
