"use client";

import { useEffect, useState } from "react";
import { Row, Col, Card, Statistic, List, Button, Avatar, Typography } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  CalendarOutlined,
  NotificationOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import LayoutApp from "../../components/LayoutApp";

const { Title } = Typography;

interface User {
  id: number;
  namaLengkap: string;
  role: { name: string };
}

interface Halaqah {
  id: number;
  namaHalaqah: string;
}

interface Jadwal {
  id: number;
  hari: string;
  jamMulai: string;
  jamSelesai: string;
  halaqah: { namaHalaqah: string; guru: { namaLengkap: string } };
}

interface Pengumuman {
  id: number;
  judul: string;
  isi: string;
  tanggal: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [halaqah, setHalaqah] = useState<Halaqah[]>([]);
  const [jadwal, setJadwal] = useState<Jadwal[]>([]);
  const [pengumuman, setPengumuman] = useState<Pengumuman[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch users, halaqah, jadwal, pengumuman
      const [usersRes, halaqahRes, jadwalRes, pengumumanRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/halaqah"),
        fetch("/api/jadwal"),
        fetch("/api/pengumuman"),
      ]);

      if (usersRes.ok) setUsers(await usersRes.json());
      if (halaqahRes.ok) setHalaqah(await halaqahRes.json());
      if (jadwalRes.ok) setJadwal(await jadwalRes.json());
      if (pengumumanRes.ok) setPengumuman(await pengumumanRes.json());
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Statistics
  const totalSantri = users.filter(u => u.role.name.toLowerCase() === "santri").length;
  const totalGuru = users.filter(u => u.role.name.toLowerCase() === "guru").length;
  const totalHalaqah = halaqah.length;

  // Today's schedule
  const today = new Date().toLocaleDateString("id-ID", { weekday: "long" });
  const todaySchedule = jadwal.filter(j => j.hari === today);

  // Recent announcements
  const recentPengumuman = pengumuman.slice(0, 3);

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <Title level={2}>Dashboard Admin</Title>
          <Avatar size="large" icon={<UserOutlined />} />
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Santri"
                value={totalSantri}
                prefix={<BookOutlined />}
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Guru"
                value={totalGuru}
                prefix={<TeamOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Halaqah"
                value={totalHalaqah}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: "#722ed1" }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card title="Jadwal Hari Ini" variant="borderless">
              <List
                dataSource={todaySchedule}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={`${item.halaqah.namaHalaqah} - ${item.halaqah.guru.namaLengkap}`}
                      description={`${item.jamMulai} - ${item.jamSelesai}`}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card
              title="Pengumuman Terbaru"
              variant="borderless"
              extra={<Button type="primary" icon={<PlusOutlined />}>Tambah Pengumuman</Button>}
            >
              <List
                dataSource={recentPengumuman}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.judul}
                      description={item.isi.substring(0, 100) + "..."}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>

        {/* Notifications Panel */}
        <Card title="Notifikasi" style={{ marginTop: 24 }}>
          <List
            dataSource={[]} // Placeholder for notifications
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<NotificationOutlined />}
                  title="Notifikasi Title"
                  description="Notifikasi description"
                />
              </List.Item>
            )}
          />
        </Card>
      </div>
    </LayoutApp>
  );
}