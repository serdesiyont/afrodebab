# Client Integration Guide (This Session Only)

This guide covers only the features added in this session:
1. employee salary fields,
2. attendance lunch break,
3. payroll payment APIs.

Use JSON for all request bodies unless noted.

## Authentication to use these APIs

- Admin endpoints require an **admin token**.
- Employee self endpoints require an **employee token**.
- Send token as:

```http
Authorization: Bearer <token>
```

---

## 1) Employee salary fields

### What it does
Adds salary metadata to employee create/update/profile APIs:
- `salaryDate` (`YYYY-MM-DD`)
- `salaryAmountMinor` (number in minor units)
- `salaryScheduleDays` (`MONDAY` ... `SUNDAY`)

### Where to send/read it
- `POST /admin/employees` (request)
- `POST /admin/employees/form` (form fields)
- `PUT /admin/employees/{id}` (request)
- `GET /admin/employees`, `GET /admin/employees/{id}`, `GET /employee/me` (response)

### Example (create/update payload part)
```json
{
  "salaryDate": "2026-05-01",
  "salaryAmountMinor": 250000,
  "salaryScheduleDays": ["MONDAY", "THURSDAY"]
}
```

---

## 2) Attendance lunch break

### What it does
Attendance now tracks lunch break:
- `lunchBreakInAt`
- `lunchBreakOutAt`

### Admin use (set full attendance)

**Endpoint**
`PUT /admin/employees/{id}/attendance`

**Request**
```json
{
  "date": "2026-05-16",
  "clockInAt": "2026-05-16T08:00:00Z",
  "clockOutAt": "2026-05-16T17:00:00Z",
  "lunchBreakInAt": "2026-05-16T12:00:00Z",
  "lunchBreakOutAt": "2026-05-16T12:45:00Z"
}
```

**Response**
```json
{
  "id": 11,
  "employeeId": 4,
  "date": "2026-05-16",
  "clockInAt": "2026-05-16T08:00:00Z",
  "clockOutAt": "2026-05-16T17:00:00Z",
  "lunchBreakInAt": "2026-05-16T12:00:00Z",
  "lunchBreakOutAt": "2026-05-16T12:45:00Z",
  "createdAt": "2026-05-16T08:00:00Z",
  "updatedAt": "2026-05-16T17:00:00Z"
}
```

### Employee self use (simple actions)

1. Start lunch: `POST /employee/me/lunch-break-in`
2. End lunch: `POST /employee/me/lunch-break-out`

Both return `EmployeeAttendanceResponse`.

---

## 3) Payroll / payslip flow APIs

### What it does
- Persists employee payment cycles.
- Lets admin fetch due/overdue payments.
- Lets admin mark payment as paid with transaction reference.
- Notifies employee by email after payment.
- Employee can view payment history.

### Admin: list due payments

**Endpoint**
`GET /admin/payments/due`

**Use**
- Call this to render payroll dashboard rows.
- Includes unpaid salaries that are due soon and overdue.

**Response item**
```json
{
  "id": 31,
  "employeeId": 4,
  "employeeName": "Jane Doe",
  "cycleStartDate": "2026-04-01",
  "dueDate": "2026-05-01",
  "amountMinor": 250000,
  "paidAmountMinor": null,
  "status": "PENDING",
  "transactionReference": null,
  "paidAt": null,
  "lastReminderSentAt": null,
  "createdAt": "2026-04-01T00:00:00Z",
  "updatedAt": "2026-04-01T00:00:00Z"
}
```

### Admin: mark as paid

**Endpoint**
`POST /admin/payments/{paymentId}/mark-paid`

**Request**
```json
{
  "transactionReference": "TRX-2026-05-001",
  "paidAmountMinor": 255000
}
```

`transactionReference` is required and must be unique.  
`paidAmountMinor` is optional (if omitted, backend uses cycle amount).

**Response**
`EmployeePaymentResponse`

### Employee: payment history

1. `GET /employee/me/payments` → all payment rows (`PENDING` + `PAID`)
2. `GET /employee/me/payments/paid` → paid-only rows

Use these endpoints for employee payment notifications/history UI.

---

## 4) Recommended frontend flow

1. Admin opens payroll page → call `GET /admin/payments/due`.
2. Admin clicks “Mark Paid” on one row → call `POST /admin/payments/{paymentId}/mark-paid`.
3. Refresh due list.
4. Employee opens profile payments tab:
   - call `GET /employee/me/payments` for full history,
   - call `GET /employee/me/payments/paid` for paid-only list.
