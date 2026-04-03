# KE HOACH PHAT TRIEN DAILY DIGEST SERVICE (IN-APP FIRST)

Ngay lap: 03/04/2026  
Phien ban: 1.0  
Trang thai: Planning

---

## I. MUC TIEU

### 1.1 Muc tieu chinh

- Moi ngay cung cap "ban tin 60 giay" cho moi user.
- Noi dung gom:
  - 3 tin noi bat tu News Service.
  - 3 thuat ngu crypto de hieu tu Academy/Glossary data.
- Hien thi qua in-app notification de dam bao user nhan duoc trong demo.

### 1.2 Muc tieu mo rong (optional)

- Ho tro gui email cho user da xac thuc email (`emailVerified = true`).
- Co fallback ve in-app neu email fail hoac user chua verify.

### 1.3 Muc tieu phi chuyen sau

- Khong du doan gia.
- Khong phan tich trading strategy.
- Chi tong hop va dien giai de tang trai nghiem nguoi dung.

---

## II. PHAM VI

### 2.1 Chuc nang trong scope

1. Tao daily digest 1 lan/ngay/user.
2. Trigger digest lan dau user dang nhap trong ngay.
3. Luu trang thai `delivered`, `read`.
4. Truy van danh sach digest da nhan.
5. Retry nhe neu lay news bi loi.
6. Optional: gui email cho user da verify.

### 2.2 Ngoai scope

1. Push notification mobile (FCM/APNs).
2. Phan loai sentiment chuyen sau.
3. Recommendation engine nang.
4. Real-time streaming feed.

---

## III. LUA CHON CONG NGHE

- Service moi: Java Spring Boot (de bo sung stack Java lan 2).
- Port: `3008`.
- DB: MongoDB (`digest-service` database).
- Tich hop:
  - News Service: lay top news.
  - Academy Service hoac static glossary: lay 3 thuat ngu.
  - Notification Service: tao in-app notifications.
  - User Service: lay profile + `emailVerified`.

Ly do chon Java:

- Scheduler + API ro rang, de trinh bay cho giang vien.
- Code structure enterprise de mo rong.
- Van giu logic nghiep vu don gian.

---

## IV. KIEN TRUC TONG QUAT

```text
Frontend (login/dashboard)
        |
        v
API Gateway (Node.js)
        |
        v
Daily Digest Service (Java, :3008)
   |         |         |         \
   v         v         v          v
News      Academy   User      Notification
Service   Service   Service   Service
```

Luong chinh:

1. User login thanh cong.
2. Gateway goi Daily Digest Service: `POST /digest/trigger-login`.
3. Service kiem tra `userId + date` da ton tai chua.
4. Neu chua ton tai:

- Lay 3 tin + 3 thuat ngu.
- Luu digest record.
- Goi Notification Service tao thong bao in-app.
- Neu user `emailVerified=true` va bat email preference thi xep hang gui email.

5. Neu da ton tai: tra ve digest co san, khong tao moi.

---

## V. QUY TAC NGHIEP VU QUAN TRONG

### 5.1 One digest per day per user

- Khoa unique: `userId + digestDate (yyyy-mm-dd)`.
- Moi ngay toi da 1 digest moi user.

### 5.2 Trigger theo "lan dau login trong ngay"

- Login thu 1 trong ngay: tao digest neu chua co.
- Login thu 2,3...: khong tao moi, chi tra ve digest hien co.

### 5.3 Uu tien in-app

- In-app la kenh chinh trong scope.
- Email la optional, khong anh huong flow chinh neu fail.

### 5.4 Chinh sach email verification

- Chi gui email neu:
  - `emailVerified = true`
  - user bat setting `dailyDigestEmail = true`
- Neu khong dat dieu kien: bo qua email, van gui in-app.

---

## VI. THIET KE API

### 6.1 Trigger login digest

`POST /digest/trigger-login`

Request:

```json
{
  "userId": "u123",
  "date": "2026-04-03"
}
```

Response (tao moi):

```json
{
  "success": true,
  "created": true,
  "data": {
    "digestId": "d001",
    "title": "Crypto Daily Digest - 03/04",
    "inAppDelivered": true,
    "emailQueued": false
  }
}
```

Response (da ton tai):

```json
{
  "success": true,
  "created": false,
  "data": {
    "digestId": "d001",
    "title": "Crypto Daily Digest - 03/04"
  }
}
```

### 6.2 Get digest hom nay

`GET /digest/today?userId=u123`

### 6.3 Get lich su digest

`GET /digest/history?userId=u123&page=1&limit=10`

### 6.4 Mark as read

`PATCH /digest/{digestId}/read`

### 6.5 Health

`GET /health`

---

## VII. DATA MODEL

### 7.1 Collection: `daily_digests`

```json
{
  "_id": "ObjectId",
  "userId": "u123",
  "digestDate": "2026-04-03",
  "title": "Crypto Daily Digest - 03/04",
  "topNews": [
    {
      "id": "n1",
      "title": "Bitcoin ETF sees inflow",
      "source": "CoinDesk",
      "url": "https://..."
    }
  ],
  "glossary": [
    {
      "term": "DCA",
      "simpleDefinition": "Mua deu dinh ky de giam anh huong bien dong gia"
    }
  ],
  "inAppDelivered": true,
  "emailStatus": "SKIPPED",
  "read": false,
  "createdAt": "2026-04-03T08:00:00Z",
  "updatedAt": "2026-04-03T08:00:00Z"
}
```

### 7.2 Indexes

- Unique: `{ userId: 1, digestDate: 1 }`
- Query history: `{ userId: 1, createdAt: -1 }`

### 7.3 Collection optional: `email_verification_tokens`

```json
{
  "_id": "ObjectId",
  "userId": "u123",
  "tokenHash": "sha256(...)",
  "expiresAt": "2026-04-04T08:00:00Z",
  "used": false,
  "createdAt": "2026-04-03T08:00:00Z"
}
```

---

## VIII. EMAIL VERIFICATION FLOW (OPTIONAL PHASE 2)

### 8.1 Luong verify email

1. User dang ky hoac vao profile bam "Verify email".
2. User Service tao token (raw token chi gui 1 lan qua email, DB luu hash).
3. Gui link: `/verify-email?token=...`.
4. User bam link, backend kiem tra token con han va chua dung.
5. Set `emailVerified=true` cho user.

### 8.2 API de xac thuc

- `POST /auth/email/send-verification`
- `POST /auth/email/verify`
- `GET /profile/email-status`

### 8.3 Luu y quan trong

- Khong can goi Google de verify email thuong.
- Google OAuth moi co claim `email_verified`.
- Verify email thuong la xac minh quyen truy cap mailbox qua verification link.

---

## IX. KE HOACH TRIEN KHAI

### Day 1 - Skeleton

1. Tao Spring Boot project `digest-service`.
2. Them dependency web, data-mongodb, validation, openfeign/resttemplate.
3. Tao endpoint health + trigger-login.
4. Cau hinh Consul register.

### Day 2 - Business core

1. Tich hop News Service + Academy Service.
2. Generate digest content (3 news + 3 terms).
3. Luu MongoDB + unique rule per day.
4. Goi Notification Service de tao in-app.

### Day 3 - History + Read status

1. Them APIs history/today/read.
2. Validation + error handling.
3. Log + metrics don gian.

### Day 4 - Optional email phase

1. Them check `emailVerified` + preference.
2. Queue gui email (co the dung background scheduler).
3. Implement retry nhe va log status.

### Day 5 - Integration + Demo

1. Gateway routing `/api/digest/*`.
2. Frontend widget tren dashboard.
3. End-to-end test login -> digest -> notification.

Tong thoi gian:

- Ban chinh (in-app): 3 ngay.
- Co email verify + email delivery: 4-5 ngay.

---

## X. TICH HOP GATEWAY

Them proxy route trong Gateway:

- `const digestProxy = createServiceProxy('digest-service', 'digest');`
- `app.use('/api/digest', authMiddleware, digestProxy);`

Them config service name vao danh sach service fallback neu can.

---

## XI. FRONTEND TICH HOP (MINIMAL)

Widget tren Dashboard:

1. Card "Daily Digest Today".
2. Hien 3 tin + 3 terms.
3. Nut "Mark as read".
4. Tab "History" xem digest cu.

UX target:

- User login vao la thay digest neu hom nay chua doc.
- Neu da doc thi card o trang thai collapse gon.

---

## XII. TESTING CHECKLIST

### Functional

- Login lan dau trong ngay tao digest moi.
- Login lan 2 cung ngay khong tao digest moi.
- In-app notification duoc tao thanh cong.
- Lich su digest tra ve dung paging.

### Error handling

- News Service down -> fallback message van tao digest.
- Academy Service down -> dung glossary static backup.
- Notification Service loi -> digest van luu, queue retry thong bao.

### Optional email

- User chua verify -> emailStatus = SKIPPED.
- User verify + preference on -> emailStatus = QUEUED/SENT.

---

## XIII. RUI RO VA GIAM THIEU

1. Mot service phu bi down:

- Giam thieu: fallback content + graceful degradation.

2. Spam thong bao:

- Giam thieu: unique rule 1 digest/user/day.

3. Email bounce:

- Giam thieu: chi gui user verified + theo doi status.

4. Noi dung trung lap:

- Giam thieu: randomize tu top 10 news de lay 3 news.

---

## XIV. SUCCESS CRITERIA

1. Moi user moi ngay toi da 1 digest.
2. Trigger theo lan login dau tien trong ngay chay dung 100% test cases.
3. In-app notification hien thi dung tren frontend.
4. Response APIs < 200ms (khong tinh call external).
5. Khong anh huong den luong trade/portfolio hien tai.

---

## XV. GOI Y MO RONG SAU BAO CAO

1. Them "tone mode": beginner/pro.
2. Them localization: VI/EN.
3. Them weekly digest tong hop.
4. Them A/B test format digest.

---

End of document.
