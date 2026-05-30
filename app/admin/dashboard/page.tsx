"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Row, Col, Card, Statistic, List, Button, Avatar, Typography } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  CalendarOutlined,
  NotificationOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import Link from "next/link";
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

  const fetchData = useCallback(async () => {
    try {
      const [usersRes, halaqahRes, jadwalRes, pengumumanRes] = await Promise.all([
        fetch("/api/users?limit=100"),
        fetch("/api/halaqah?limit=20"),
        fetch("/api/jadwal"),
        fetch("/api/pengumuman"),
      ]);

      if (usersRes.ok) {
        const result = await usersRes.json();
        setUsers(result.data || result);
      }
      if (halaqahRes.ok) {
        const result = await halaqahRes.json();
        setHalaqah(result.data || result);
      }
      if (jadwalRes.ok) {
        const result = await jadwalRes.json();
        setJadwal(result.data || result);
      }
      if (pengumumanRes.ok) {
        const result = await pengumumanRes.json();
        setPengumuman(result.data || result);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats = useMemo(() => {
    const santri = users.filter(u => u.role.name.toLowerCase() === "santri").length;
    const guru = users.filter(u => u.role.name.toLowerCase() === "guru").length;
    const totalHalaqah = halaqah.length;
    return { santri, guru, totalHalaqah };
  }, [users, halaqah]);

  const todaySchedule = useMemo(() => {
    const today = new Date().toLocaleDateString("id-ID", { weekday: "long" });
    return jadwal.filter(j => j.hari === today);
  }, [jadwal]);

  const recentPengumuman = useMemo(() => pengumuman.slice(0, 3), [pengumuman]);

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <Title level={2}>Dashboard Admin</Title>
          <Avatar size="large" icon={<UserOutlined />} />
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Santri"
                value={stats.santri}
                prefix={<BookOutlined />}
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Guru"
                value={stats.guru}
                prefix={<TeamOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Halaqah"
                value={stats.totalHalaqah}
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
              extra={<Link href="/admin/pengumuman"><Button type="primary" icon={<PlusOutlined />}>Tambah Pengumuman</Button></Link>}
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

        <Card title="Notifikasi" style={{ marginTop: 24 }}>
          <p style={{ color: "#999" }}>Belum ada notifikasi</p>
        </Card>
      </div>
    </LayoutApp>
  );
}
