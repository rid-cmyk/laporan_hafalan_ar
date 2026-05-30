"use client";

import { useEffect, useState } from "react";
import { Row, Col, Card, Statistic, List, Typography } from "antd";
import { TeamOutlined, CalendarOutlined, BookOutlined } from "@ant-design/icons";
import LayoutApp from "../../components/LayoutApp";

const { Title } = Typography;

interface Halaqah {
  id: number;
  namaHalaqah: string;
  jumlahSantri: number;
}

interface Jadwal {
  id: number;
  hari: string;
  jamMulai: string;
  jamSelesai: string;
  halaqah: { namaHalaqah: string };
}

export default function GuruDashboard() {
  const [halaqah, setHalaqah] = useState<Halaqah[]>([]);
  const [jadwal, setJadwal] = useState<Jadwal[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [halaqahRes, jadwalRes] = await Promise.all([
          fetch("/api/halaqah?limit=50"),
          fetch("/api/jadwal"),
        ]);
        if (halaqahRes.ok) {
          const result = await halaqahRes.json();
          setHalaqah(result.data || []);
        }
        if (jadwalRes.ok) {
          const result = await jadwalRes.json();
          setJadwal(result.data || []);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    fetchData();
  }, []);

  const totalSantri = halaqah.reduce((sum, h) => sum + (h.jumlahSantri || 0), 0);
  const today = new Date().toLocaleDateString("id-ID", { weekday: "long" });
  const todaySchedule = jadwal.filter(j => j.hari === today);

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0" }}>
        <Title level={2}>Dashboard Guru</Title>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic title="Total Halaqah" value={halaqah.length} prefix={<TeamOutlined />} valueStyle={{ color: "#1890ff" }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic title="Total Santri" value={totalSantri} prefix={<BookOutlined />} valueStyle={{ color: "#3f8600" }} />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card title="Jadwal Saya Hari Ini">
              <List
                dataSource={todaySchedule}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.halaqah.namaHalaqah}
                      description={`${item.jamMulai} - ${item.jamSelesai}`}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Halaqah Saya">
              <List
                dataSource={halaqah}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.namaHalaqah}
                      description={`${item.jumlahSantri} santri`}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </LayoutApp>
  );
}
