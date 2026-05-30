"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Row, Col, Card, Statistic, Table, Select, DatePicker, Tag, Space, Typography } from "antd";
import { BookOutlined, FilterOutlined, ReloadOutlined } from "@ant-design/icons";
import LayoutApp from "../../components/LayoutApp";

const { Title } = Typography;
const { RangePicker } = DatePicker;

interface Santri {
  id: number;
  namaLengkap: string;
}

interface HafalanItem {
  id: number;
  tanggal: string;
  surat: string;
  ayatMulai: number;
  ayatSelesai: number;
  status: "ziyadah" | "murojaah";
  keterangan: string | null;
  santri: { id: number; namaLengkap: string };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function LaporanPage() {
  const [hafalan, setHafalan] = useState<HafalanItem[]>([]);
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, totalPages: 0 });

  const [filterSantri, setFilterSantri] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterDateRange, setFilterDateRange] = useState<[string, string] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchHafalan = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: "50" });
      if (filterSantri) params.set("santriId", String(filterSantri));
      if (filterStatus) params.set("status", filterStatus);
      if (filterDateRange) {
        params.set("tanggalMulai", filterDateRange[0]);
        params.set("tanggalSelesai", filterDateRange[1]);
      }

      const res = await fetch(`/api/hafalan?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const result = await res.json();
      setHafalan(result.data);
      setPagination(result.pagination);
    } catch (err) {
      console.error("Error fetching hafalan:", err);
    } finally {
      setLoading(false);
    }
  }, [filterSantri, filterStatus, filterDateRange]);

  const fetchSantri = useCallback(async () => {
    try {
      const res = await fetch("/api/users?limit=100");
      if (!res.ok) return;
      const result = await res.json();
      const data = result.data || result;
      setSantriList(data.filter((u: { role: { name: string } }) => u.role.name.toLowerCase() === "santri"));
    } catch (err) {
      console.error("Error fetching santri:", err);
    }
  }, []);

  useEffect(() => { fetchSantri(); }, [fetchSantri]);
  useEffect(() => { fetchHafalan(currentPage); }, [fetchHafalan, currentPage]);

  const statsHafalan = useMemo(() => {
    const total = hafalan.length;
    const ziyadah = hafalan.filter(h => h.status === "ziyadah").length;
    const murojaah = hafalan.filter(h => h.status === "murojaah").length;
    return { total, ziyadah, murojaah };
  }, [hafalan]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleFilterReset = useCallback(() => {
    setFilterSantri(null);
    setFilterStatus(null);
    setFilterDateRange(null);
    setCurrentPage(1);
  }, []);

  const statusColor = (status: string) => {
    return status === "ziyadah" ? "green" : "blue";
  };

  const columns = [
    { title: "No", key: "index", width: 60, render: (_: unknown, __: unknown, i: number) => (currentPage - 1) * 50 + i + 1 },
    { title: "Tanggal", dataIndex: "tanggal", key: "tanggal", width: 120, render: (t: string) => new Date(t).toLocaleDateString("id-ID") },
    { title: "Santri", key: "santri", width: 200, render: (_: unknown, r: HafalanItem) => r.santri.namaLengkap },
    { title: "Surat", dataIndex: "surat", key: "surat", width: 150 },
    { title: "Ayat", key: "ayat", width: 100, render: (_: unknown, r: HafalanItem) => `${r.ayatMulai}:${r.ayatSelesai}` },
    { title: "Jumlah Ayat", key: "jumlah", width: 100, render: (_: unknown, r: HafalanItem) => r.ayatSelesai - r.ayatMulai + 1 },
    {
      title: "Status", dataIndex: "status", key: "status", width: 110,
      render: (s: string) => <Tag color={statusColor(s)}>{s.toUpperCase()}</Tag>,
    },
    { title: "Keterangan", dataIndex: "keterangan", key: "keterangan", ellipsis: true },
  ];

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0" }}>
        <Title level={2}>Laporan Hafalan</Title>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8} md={6}>
            <Card size="small">
              <Statistic
                title="Total Hafalan"
                value={pagination.total || statsHafalan.total}
                prefix={<BookOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Card size="small">
              <Statistic
                title="Ziyadah (Baru)"
                value={statsHafalan.ziyadah}
                prefix={<BookOutlined />}
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Card size="small">
              <Statistic
                title="Murojaah (Ulang)"
                value={statsHafalan.murojaah}
                prefix={<BookOutlined />}
                valueStyle={{ color: "#722ed1" }}
              />
            </Card>
          </Col>
        </Row>

        <Card
          size="small"
          style={{ marginBottom: 16 }}
          title={<Space><FilterOutlined /> Filter</Space>}
          extra={
            <Space>
              <ReloadOutlined style={{ cursor: "pointer" }} onClick={handleFilterReset} />
            </Space>
          }
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Select
                style={{ width: "100%" }}
                placeholder="Filter Santri"
                allowClear
                value={filterSantri}
                onChange={(v) => { setFilterSantri(v); setCurrentPage(1); }}
                showSearch
                filterOption={(input, option) =>
                  (option?.label as string || "").toLowerCase().includes(input.toLowerCase())
                }
                options={santriList.map(s => ({ value: s.id, label: s.namaLengkap }))}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                style={{ width: "100%" }}
                placeholder="Filter Status"
                allowClear
                value={filterStatus}
                onChange={(v) => { setFilterStatus(v); setCurrentPage(1); }}
                options={[
                  { value: "ziyadah", label: "Ziyadah" },
                  { value: "murojaah", label: "Murojaah" },
                ]}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <RangePicker
                style={{ width: "100%" }}
                onChange={(dates) => {
                  if (dates && dates[0] && dates[1]) {
                    setFilterDateRange([dates[0].format("YYYY-MM-DD"), dates[1].format("YYYY-MM-DD")]);
                  } else {
                    setFilterDateRange(null);
                  }
                  setCurrentPage(1);
                }}
              />
            </Col>
          </Row>
        </Card>

        <Card>
          <Table
            dataSource={hafalan}
            columns={columns}
            rowKey="id"
            loading={loading}
            size="small"
            scroll={{ x: 800 }}
            pagination={{
              current: currentPage,
              pageSize: 50,
              total: pagination.total,
              onChange: handlePageChange,
              showSizeChanger: false,
              showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total}`,
            }}
          />
        </Card>
      </div>
    </LayoutApp>
  );
}
