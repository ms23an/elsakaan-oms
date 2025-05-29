
# Clothes Store Backend API

Backend API للنظام إدارة متجر الملابس باستخدام Node.js و Express و MongoDB.

## التثبيت والتشغيل

### المتطلبات
- Node.js (إصدار 16 أو أحدث)
- MongoDB (محلي أو MongoDB Atlas)
- npm أو yarn

### خطوات التثبيت

1. تثبيت المتطلبات:
```bash
npm install
```

2. إنشاء ملف البيئة:
```bash
cp .env.example .env
```

3. تحديث متغيرات البيئة في ملف `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/clothes_store
JWT_SECRET=your_very_secure_secret_key
NODE_ENV=development
```

4. تشغيل الخادم:
```bash
# للتطوير
npm run dev

# للإنتاج
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - تسجيل الدخول
- `GET /api/auth/verify` - التحقق من الرمز المميز

### Customers
- `GET /api/customers` - جلب جميع العملاء
- `GET /api/customers/:id` - جلب عميل محدد
- `POST /api/customers` - إضافة عميل جديد
- `PUT /api/customers/:id` - تحديث عميل
- `DELETE /api/customers/:id` - حذف عميل

### Orders
- `GET /api/orders` - جلب جميع الطلبات
- `GET /api/orders/:id` - جلب طلب محدد
- `POST /api/orders` - إضافة طلب جديد
- `PUT /api/orders/:id` - تحديث طلب
- `DELETE /api/orders/:id` - حذف طلب

### Shipments
- `GET /api/shipments` - جلب جميع الشحنات
- `GET /api/shipments/:id` - جلب شحنة محددة
- `PUT /api/shipments/:id/status` - تحديث حالة الشحنة

## بيانات التسجيل الافتراضية

### المدير
- Username: `admin`
- Password: `admin123`

### الموظف
- Username: `employee`
- Password: `admin123`

## ملاحظات مهمة

1. تأكد من تشغيل MongoDB قبل تشغيل الخادم
2. قم بتغيير `JWT_SECRET` إلى قيمة آمنة في بيئة الإنتاج
3. يمكنك استخدام MongoDB Compass لإدارة قاعدة البيانات محلياً
4. للربط مع الفرونت إند، تأكد من تشغيل الخادم على البورت 5000

## اختبار API

يمكنك استخدام Postman أو أي أداة مشابهة لاختبار الـ API endpoints.

مثال على طلب تسجيل الدخول:
```json
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```
