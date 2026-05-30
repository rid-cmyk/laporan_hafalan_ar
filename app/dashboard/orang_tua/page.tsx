"use client";

import { useEffect, useState } from "react";
import { Row, Col, Card, Statistic, List, Tag, Typography } from "antd";
import { BookOutlined, CheckCircleOutlined, UserOutlined } from "@ant-design/icons";
import LayoutApp from "../../components/LayoutApp";

const { Title } = Typography;

interface HafalanItem {
  id: number;
  tanggal: string;
  surat: string;
  ayatMulai: number;
  ayatSelesai: number;
  status: "ziyadah" | "murojaah";
  santri: { id: number; namaLengkap: string };
}

export default function OrangTuaDashboard() {
  const [hafalan, setHafalan] = useState<HafalanItem[]>([]);

  useEffect(() => {
    const fetchHafalan = async () => {
      try {
        const res = await fetch("/api/hafalan?limit=50");
        if (res.ok) {
          const result = await res.json();
          setHafalan(result.data || []);
        }
      } catch (error) {
        console.error("Error fetching hafalan:", error);
      }
    };
    fetchHafalan();
  }, []);

  const santriSet = new Set(hafalan.map(h => h.santri.namaLengkap));
  const stats = {
    total: hafalan.length,
    santri: santriSet.size,
    ziyadah: hafalan.filter(h => h.status === "ziyadah").length,
  };

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0" }}>
        <Title level={2}>Dashboard Orang Tua</Title>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic title="Total Hafalan" value={stats.total} prefix={<BookOutlined />} valueStyle={{ color: "#1890ff" }} />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic title="Anak Terdaftar" value={stats.santri} prefix={<UserOutlined />} valueStyle={{ color: "#3f8600" }} />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic title="Ziyadah (Baru)" value={stats.ziyadah} prefix={<CheckCircleOutlined />} valueStyle={{ color: "#722ed1" }} />
            </Card>
          </Col>
        </Row>

        <Card title="Perkembangan Hafalan">
          <List
            dataSource={hafalan.slice(0, 20)}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={`${item.santri.namaLengkap} - ${item.surat} ${item.ayatMulai}:${item.ayatSelesai}`}
                  description={new Date(item.tanggal).toLocaleDateString("id-ID")}
                />
                <Tag color={item.status === "ziyadah" ? "green" : "blue"}>
                  {item.status.toUpperCase()}
                </Tag>
              </List.Item>
            )}
          />
        </Card>
      </div>
    </LayoutApp>
  );
}
