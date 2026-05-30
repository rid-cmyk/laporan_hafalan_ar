"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Row, Col, Card, Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm, Typography } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, TeamOutlined } from "@ant-design/icons";
import LayoutApp from "../../components/LayoutApp";

const { Title } = Typography;

interface Guru {
  id: number;
  namaLengkap: string;
}

interface Santri {
  id: number;
  namaLengkap: string;
}

interface HalaqahItem {
  id: number;
  namaHalaqah: string;
  guru: Guru;
  santri: Santri[];
  jumlahSantri: number;
}

export default function HalaqahPage() {
  const [halaqah, setHalaqah] = useState<HalaqahItem[]>([]);
  const [guruList, setGuruList] = useState<Guru[]>([]);
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HalaqahItem | null>(null);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [halaqahRes, usersRes] = await Promise.all([
        fetch("/api/halaqah?limit=50"),
        fetch("/api/users?limit=100"),
      ]);
      if (halaqahRes.ok) {
        const result = await halaqahRes.json();
        setHalaqah(result.data || []);
      }
      if (usersRes.ok) {
        const result = await usersRes.json();
        const data = result.data || result;
        setGuruList(data.filter((u: { role: { name: string } }) => u.role.name.toLowerCase() === "guru"));
        setSantriList(data.filter((u: { role: { name: string } }) => u.role.name.toLowerCase() === "santri"));
      }
    } catch (error) {
      console.error("Error fetching halaqah:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openModal = useCallback((item?: HalaqahItem) => {
    if (item) {
      setEditing(item);
      form.setFieldsValue({
        namaHalaqah: item.namaHalaqah,
        guruId: item.guru.id,
        santriIds: item.santri.map(s => s.id),
      });
    } else {
      setEditing(null);
      form.resetFields();
    }
    setModalOpen(true);
  }, [form]);

  const handleSave = useCallback(async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        guruId: Number(values.guruId),
        santriIds: values.santriIds?.map(Number) || [],
        tahunAkademik: "2025/2026",
        semester: "S1",
      };

      const url = editing ? `/api/halaqah/${editing.id}` : "/api/halaqah";
      const method = editing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }

      message.success(editing ? "Halaqah berhasil diperbarui" : "Halaqah berhasil ditambahkan");
      setModalOpen(false);
      form.resetFields();
      fetchData();
    } catch (error: unknown) {
      message.error(error instanceof Error ? error.message : "Error saving halaqah");
    }
  }, [form, editing, fetchData]);

  const handleDelete = useCallback(async (id: number) => {
    try {
      const res = await fetch(`/api/halaqah/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete");
      }
      message.success("Halaqah berhasil dihapus");
      fetchData();
    } catch (error: unknown) {
      message.error(error instanceof Error ? error.message : "Error deleting halaqah");
    }
  }, [fetchData]);

  const columns = useMemo(() => [
    { title: "ID", dataIndex: "id", key: "id", width: 60 },
    { title: "Nama Halaqah", dataIndex: "namaHalaqah", key: "namaHalaqah" },
    { title: "Guru", key: "guru", render: (_: unknown, r: HalaqahItem) => r.guru.namaLengkap },
    { title: "Jumlah Santri", dataIndex: "jumlahSantri", key: "jumlahSantri", width: 120 },
    {
      title: "Actions", key: "actions", width: 160,
      render: (_: unknown, r: HalaqahItem) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => openModal(r)} size="small">Edit</Button>
          <Popconfirm title="Hapus halaqah ini?" onConfirm={() => handleDelete(r.id)} okText="Ya" cancelText="Batal">
            <Button type="text" danger icon={<DeleteOutlined />} size="small">Hapus</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ], [openModal, handleDelete]);

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <Title level={2}>Manajemen Halaqah</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>Tambah Halaqah</Button>
        </div>

        <Table dataSource={halaqah} columns={columns} rowKey="id" loading={loading} size="small" scroll={{ x: 600 }} />

        <Modal
          title={<Space><TeamOutlined /> {editing ? "Edit Halaqah" : "Tambah Halaqah"}</Space>}
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          onOk={handleSave}
          okText="Simpan"
          width={600}
        >
          <Form form={form} layout="vertical">
            <Form.Item label="Nama Halaqah" name="namaHalaqah" rules={[{ required: true, message: "Masukkan nama halaqah" }]}>
              <Input placeholder="Nama halaqah" />
            </Form.Item>
            <Form.Item label="Guru" name="guruId" rules={[{ required: true, message: "Pilih guru" }]}>
              <Select placeholder="Pilih guru" showSearch filterOption={(input, option) =>
                (option?.label as string || "").toLowerCase().includes(input.toLowerCase())
              } options={guruList.map(g => ({ value: g.id, label: g.namaLengkap }))} />
            </Form.Item>
            <Form.Item label="Santri" name="santriIds">
              <Select mode="multiple" placeholder="Pilih santri" showSearch filterOption={(input, option) =>
                (option?.label as string || "").toLowerCase().includes(input.toLowerCase())
              } options={santriList.map(s => ({ value: s.id, label: s.namaLengkap }))} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </LayoutApp>
  );
}
