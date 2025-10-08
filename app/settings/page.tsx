import { Card, Space, Button } from "antd";
import { FileTextOutlined, CalendarOutlined, DatabaseOutlined } from "@ant-design/icons";
import Link from "next/link";
import LayoutApp from "../components/LayoutApp";

export default function SettingsPage() {
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
        <p>wbdwdbjdwbd</p>
      </div>
    </LayoutApp>
  );
}
