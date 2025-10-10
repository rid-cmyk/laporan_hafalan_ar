/* eslint-disable @typescript-eslint/no-explicit-any */
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import { Card, Space, Button } from "antd";
import { FileTextOutlined, CalendarOutlined, DatabaseOutlined } from "@ant-design/icons";
import Link from "next/link";
import LayoutApp from "../components/LayoutApp";

const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

export default async function SettingsPage() {
  // 🧠 Read token from cookies
  const cookieStore = cookies();
  const token = (await cookieStore).get("auth_token")?.value;

  // 🚫 If no token → redirect to login
  if (!token) {
    redirect("/login");
  }

  let decoded: any;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    console.error("JWT invalid:", err);
    redirect("/login");
  }

  // 🧩 Allow only super_admin & admin
  const allowedRoles = ["super_admin", "admin"];
  if (!allowedRoles.includes(decoded.role)) {
    redirect("/unauthorized");
  }

  // ✅ If role is allowed, show page
  return (
    <LayoutApp>
      <div>
        <title>Settings</title>
        <h1>Settings</h1>
        <p>Manage your account settings here.</p>
      </div>
      <div style={{ padding: "24px 0" }}>
        <h1>Settings</h1>
        <p style={{ marginBottom: 24, color: "#666" }}>
          Configure system settings and manage data backups
        </p>

        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Card
            title={
              <Space>
                <FileTextOutlined />
                Raport Settings
              </Space>
            }
            extra={
              <Link href="/settings/raport">
                <Button type="primary">Configure</Button>
              </Link>
            }
          >
            <p>Configure raport templates, headers, footers, and report generation settings.</p>
          </Card>

          <Card
            title={
              <Space>
                <CalendarOutlined />
                Tahun Ajaran Settings
              </Space>
            }
            extra={
              <Link href="/settings/tahun-ajaran">
                <Button type="primary">Configure</Button>
              </Link>
            }
          >
            <p>Manage academic year periods, semesters, and educational targets.</p>
          </Card>

          <Card
            title={
              <Space>
                <DatabaseOutlined />
                Database Backup
              </Space>
            }
            extra={
              <Link href="/settings/backup-database">
                <Button type="primary">Manage</Button>
              </Link>
            }
          >
            <p>Create, download, and restore database backups for data safety.</p>
          </Card>
        </Space>

        <p style={{ marginTop: 40, textAlign: "center", color: "#888" }}>
          Hanya dapat diakses oleh Admin dan Super Admin
        </p>
      </div>
    </LayoutApp>
  );
}
