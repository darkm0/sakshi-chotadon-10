# AshaSetu API
POST /api/auth/register
POST /api/auth/login
POST /api/auth/admin-login
GET /api/courses
GET /api/courses/:classLevel
POST /api/dashboard/progress (Bearer token)
GET /api/dashboard/:userId (Bearer token)
POST /api/community/help
POST /api/community/volunteer
POST /api/community/contribution
POST /api/community/contact
GET /api/admin/overview (admin Bearer token)
POST /api/admin/users (admin Bearer token)
PUT /api/admin/users/:id (admin Bearer token)
DELETE /api/admin/users/:id (admin Bearer token)
POST /api/admin/resources (admin Bearer token)
PUT /api/admin/help/:id (admin Bearer token)
