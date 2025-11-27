#!/bin/bash
# Script to update FCM routes in app.ts

cd /var/www/goatgoat-app/server

# Backup app.ts
cp src/app.ts src/app.ts.backup_fcm

# Find the line with fcm-management and replace it with the new implementation
sed -i 's|app.get("/admin/fcm-management", async (req, reply) => { reply.send("<h1>FCM Working</h1>"); });|// FCM Management Dashboard\n    const { getFCMManagementDashboard, sendToCustomers, sendToSellers, sendToDelivery } = await import("./api/routes/admin/fcm/fcmManagement.js");\n    app.get("/admin/fcm-management", getFCMManagementDashboard);\n    app.post("/api/fcm/send-to-customers", sendToCustomers);\n    app.post("/api/fcm/send-to-sellers", sendToSellers);\n    app.post("/api/fcm/send-to-delivery", sendToDelivery);|' src/app.ts

echo "✅ FCM routes updated in src/app.ts"
echo "📝 Backup saved as src/app.ts.backup_fcm"

