"use client";

import { useEffect, useState } from "react";
import { Row, Col, Card, Statistic, Space } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  CalendarOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import LayoutApp from "../../components/LayoutApp";

interface Role {
  id: number;
  name: string;
  userCount?: number;
}

interface User {
  id: number;
  username: string;
  namaLengkap: string;
  noTlp?: string;
  role: Role;
}

interface Hafalan {
  id: number;
  status: string;
}

interface Absensi {
  id: number;
  status: string;
}

export default function SuperAdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [hafalan, setHafalan] = useState<Hafalan[]>([]);
  const [absensi, setAbsensi] = useState<Absensi[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch data
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch {
      // Handle error silently for dashboard
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch("/api/roles");
      if (!res.ok) throw new Error("Failed to fetch roles");
      const data = await res.json();
      setRoles(data);
    } catch {
      // Handle error silently for dashboard
    }
  };

  const fetchHafalan = async () => {
    try {
      // Assuming there's an API for hafalan stats
      // For now, using placeholder
      setHafalan([]);
    } catch {
      // Handle error
    }
  };

  const fetchAbsensi = async () => {
    try {
      // Assuming there's an API for absensi stats
      // For now, using placeholder
      setAbsensi([]);
    } catch {
      // Handle error
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchHafalan();
    fetchAbsensi();
  }, []);

  // Statistics
  const getUserCountByRole = (roleName: string) => {
    return users.filter((user) => user.role.name.toLowerCase() === roleName.toLowerCase()).length;
  };

  const totalUsers = users.length;
  const totalSantri = getUserCountByRole("santri");
  const totalGuru = getUserCountByRole("guru");
  const totalAdmin = getUserCountByRole("admin");

  // Calculate hafalan completion rate (placeholder)
  const hafalanCompleted = hafalan.filter((h) => h.status === "selesai").length;
  const hafalanTotal = hafalan.length;
  const hafalanRate = hafalanTotal > 0 ? Math.round((hafalanCompleted / hafalanTotal) * 100) : 0;

  // Calculate attendance rate (placeholder)
  const absensiPresent = absensi.filter((a) => a.status === "masuk").length;
  const absensiTotal = absensi.length;
  const attendanceRate = absensiTotal > 0 ? Math.round((absensiPresent / absensiTotal) * 100) : 0;

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0" }}>
        <h1 style={{ marginBottom: 24 }}>Super Admin Dashboard</h1>
        <p style={{ marginBottom: 24, color: "#666" }}>
          Overview of system statistics and user management
        </p>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Total Users"
                value={totalUsers}
                prefix={<UserOutlined />}
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Santri"
                value={totalSantri}
                prefix={<TeamOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Guru"
                value={totalGuru}
                prefix={<TeamOutlined />}
                valueStyle={{ color: "#722ed1" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Admin"
                value={totalAdmin}
                prefix={<TeamOutlined />}
                valueStyle={{ color: "#eb2f96" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Hafalan Rate"
                value={hafalanRate}
                suffix="%"
                prefix={<BookOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Attendance"
                value={attendanceRate}
                suffix="%"
                prefix={<CalendarOutlined />}
                valueStyle={{ color: "#fa8c16" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Quick Actions */}
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card
              title="Quick Actions"
              bordered={false}
            >
              <p style={{ marginBottom: 16 }}>
                <strong>Manage Users:</strong> Add, edit, and organize user accounts by role
              </p>
              <p style={{ marginBottom: 16 }}>
                <strong>System Settings:</strong> Configure raport templates, academic years, and backups
              </p>
              <p>
                <strong>Database:</strong> Monitor system performance and data integrity
              </p>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card
              title="System Status"
              bordered={false}
            >
              <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                <DatabaseOutlined style={{ color: "#52c41a", marginRight: 8 }} />
                <span>Database: <strong style={{ color: "#52c41a" }}>Healthy</strong></span>
              </div>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                <UserOutlined style={{ color: "#1890ff", marginRight: 8 }} />
                <span>Active Users: <strong>{totalUsers}</strong></span>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <BookOutlined style={{ color: "#722ed1", marginRight: 8 }} />
                <span>Last Backup: <strong>Today</strong></span>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </LayoutApp>
  );
}