# ERD – Hệ thống đặt lịch Royal Barber

```mermaid
erDiagram
  USER ||--o| CUSTOMER_PROFILE : has
  USER ||--o| STAFF_PROFILE : has
  USER ||--o{ REFRESH_TOKEN : owns
  USER ||--o{ PASSWORD_RESET_TOKEN : owns
  CUSTOMER_PROFILE ||--o{ APPOINTMENT : books
  CUSTOMER_PROFILE ||--o{ REVIEW : writes
  STAFF_PROFILE ||--o{ STAFF_SHIFT : works
  STAFF_PROFILE ||--o{ STAFF_DAY_OFF : requests
  STAFF_PROFILE ||--o{ APPOINTMENT : serves
  STAFF_PROFILE ||--o{ REVIEW : receives
  STAFF_PROFILE ||--o{ STAFF_SERVICE : performs
  SERVICE ||--o{ STAFF_SERVICE : assigned
  APPOINTMENT ||--|{ APPOINTMENT_SERVICE : contains
  SERVICE ||--o{ APPOINTMENT_SERVICE : snapshot
  APPOINTMENT ||--o| REVIEW : receives

  USER {
    string id PK
    string email UK
    string passwordHash
    string fullName
    string phone UK
    Role role
    UserStatus status
  }
  CUSTOMER_PROFILE {
    string id PK
    string userId FK,UK
    int loyaltyPoint
  }
  STAFF_PROFILE {
    string id PK
    string userId FK,UK
    string specialties
    decimal averageRating
    boolean isBookable
  }
  SERVICE {
    string id PK
    string slug UK
    decimal price
    int durationMinutes
    boolean isActive
  }
  STAFF_SERVICE {
    string staffId PK,FK
    string serviceId PK,FK
  }
  STAFF_SHIFT {
    string id PK
    string staffId FK
    int dayOfWeek
    time startTime
    time endTime
  }
  STAFF_DAY_OFF {
    string id PK
    string staffId FK
    datetime startAt
    datetime endAt
    DayOffStatus status
  }
  APPOINTMENT {
    string id PK
    string code UK
    string customerId FK
    string staffId FK
    datetime startAt
    datetime endAt
    AppointmentStatus status
    decimal totalPrice
    int totalDurationMinutes
  }
  APPOINTMENT_SERVICE {
    string appointmentId PK,FK
    string serviceId PK,FK
    string serviceName
    decimal price
    int durationMinutes
  }
  REVIEW {
    string id PK
    string appointmentId FK,UK
    string customerId FK
    string staffId FK
    int rating
  }
  REFRESH_TOKEN {
    string id PK
    string userId FK
    string tokenHash UK
    datetime expiresAt
  }
  PASSWORD_RESET_TOKEN {
    string id PK
    string userId FK
    string tokenHash UK
    datetime expiresAt
  }
```

`AppointmentService` lưu snapshot tên, giá và thời lượng tại thời điểm đặt để lịch cũ không bị thay đổi khi bảng giá được cập nhật. Ràng buộc đánh giá một lần được bảo đảm bằng unique key trên `appointmentId`; điều kiện lịch đã `COMPLETED` sẽ được kiểm tra trong transaction ở tầng service (Giai đoạn 3).
