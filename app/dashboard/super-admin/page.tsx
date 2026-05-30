"use client";

import { useEffect, useState, useMemo } from "react";
import { Row, Col, Card, Statistic } from "antd";
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
}

interface User {
  id: number;
  username: string;
  namaLengkap: string;
  noTlp?: string;
  role: Role;
}

export default function SuperAdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [hafalan, setHafalan] = useState<{ id: number; status: string }[]>([]);
  const [absensi] = useState<{ id: number; status: string }[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [usersRes, hafRes] = await Promise.all([
          fetch("/api/users?limit=100"),
          fetch("/api/hafalan?limit=100"),
        ]);
        if (usersRes.ok) {
          const result = await usersRes.json();
          setUsers(result.data || result);
        }
        if (hafRes.ok) {
          const result = await hafRes.json();
          setHafalan(result.data || []);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    fetchAll();
  }, []);

  const userStats = useMemo(() => {
    const totalSantri = users.filter((user) => user.role.name.toLowerCase() === "santri").length;
    const totalGuru = users.filter((user) => user.role.name.toLowerCase() === "guru").length;
    const totalAdmin = users.filter((user) => user.role.name.toLowerCase() === "admin").length;
    return { totalUsers: users.length, totalSantri, totalGuru, totalAdmin };
  }, [users]);

  const hafalanStats = useMemo(() => {
    const completed = hafalan.filter((h) => h.status === "ziyadah").length;
    const total = hafalan.length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { rate, total, completed };
  }, [hafalan]);

  const absensiRate = useMemo(() => {
    const present = absensi.filter((a) => a.status === "masuk").length;
    const total = absensi.length;
    return total > 0 ? Math.round((present / total) * 100) : 0;
  }, [absensi]);

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0" }}>
        <h1 style={{ marginBottom: 24 }}>Super Admin Dashboard</h1>
        <p style={{ marginBottom: 24, color: "#666" }}>
          Overview of system statistics and user management
        </p>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Total Users"
                value={userStats.totalUsers}
                prefix={<UserOutlined />}
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Santri"
                value={userStats.totalSantri}
                prefix={<TeamOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Guru"
                value={userStats.totalGuru}
                prefix={<TeamOutlined />}
                valueStyle={{ color: "#722ed1" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Admin"
                value={userStats.totalAdmin}
                prefix={<TeamOutlined />}
                valueStyle={{ color: "#eb2f96" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Hafalan Rate"
                value={hafalanStats.rate}
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
                value={absensiRate}
                suffix="%"
                prefix={<CalendarOutlined />}
                valueStyle={{ color: "#fa8c16" }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card title="Quick Actions" bordered={false}>
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
            <Card title="System Status" bordered={false}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                <DatabaseOutlined style={{ color: "#52c41a", marginRight: 8 }} />
                <span>Database: <strong style={{ color: "#52c41a" }}>Healthy</strong></span>
              </div>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                <UserOutlined style={{ color: "#1890ff", marginRight: 8 }} />
                <span>Active Users: <strong>{userStats.totalUsers}</strong></span>
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
