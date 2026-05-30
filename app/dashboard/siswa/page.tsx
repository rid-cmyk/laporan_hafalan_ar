"use client";

import { useEffect, useState } from "react";
import { Row, Col, Card, Statistic, List, Tag, Typography } from "antd";
import { BookOutlined, CheckCircleOutlined, SyncOutlined } from "@ant-design/icons";
import LayoutApp from "../../components/LayoutApp";

const { Title } = Typography;

interface HafalanItem {
  id: number;
  tanggal: string;
  surat: string;
  ayatMulai: number;
  ayatSelesai: number;
  status: "ziyadah" | "murojaah";
}

export default function SiswaDashboard() {
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

  const stats = {
    total: hafalan.length,
    ziyadah: hafalan.filter(h => h.status === "ziyadah").length,
    murojaah: hafalan.filter(h => h.status === "murojaah").length,
  };

  const recentHafalan = hafalan.slice(0, 10);

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0" }}>
        <Title level={2}>Dashboard Santri</Title>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic title="Total Hafalan" value={stats.total} prefix={<BookOutlined />} valueStyle={{ color: "#1890ff" }} />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic title="Ziyadah (Baru)" value={stats.ziyadah} prefix={<CheckCircleOutlined />} valueStyle={{ color: "#3f8600" }} />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic title="Murojaah (Ulang)" value={stats.murojaah} prefix={<SyncOutlined />} valueStyle={{ color: "#722ed1" }} />
            </Card>
          </Col>
        </Row>

        <Card title="Hafalan Terbaru">
          <List
            dataSource={recentHafalan}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={`${item.surat} ${item.ayatMulai}:${item.ayatSelesai}`}
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
