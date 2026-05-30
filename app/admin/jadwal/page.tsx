"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Card, Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm, Typography } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, CalendarOutlined } from "@ant-design/icons";
import LayoutApp from "../../components/LayoutApp";

const { Title } = Typography;
const { Option } = Select;

interface HalaqahOption {
  id: number;
  namaHalaqah: string;
}

interface JadwalItem {
  id: number;
  hari: string;
  jamMulai: string;
  jamSelesai: string;
  halaqah: { id: number; namaHalaqah: string; guru: { namaLengkap: string } };
}

const HARI_LIST = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

export default function JadwalPage() {
  const [jadwal, setJadwal] = useState<JadwalItem[]>([]);
  const [halaqahList, setHalaqahList] = useState<HalaqahOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<JadwalItem | null>(null);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [jadwalRes, halaqahRes] = await Promise.all([
        fetch("/api/jadwal"),
        fetch("/api/halaqah?limit=50"),
      ]);
      if (jadwalRes.ok) {
        const result = await jadwalRes.json();
        setJadwal(result.data || []);
      }
      if (halaqahRes.ok) {
        const result = await halaqahRes.json();
        setHalaqahList((result.data || result).map((h: { id: number; namaHalaqah: string }) => ({ id: h.id, namaHalaqah: h.namaHalaqah })));
      }
    } catch (error) {
      console.error("Error fetching jadwal:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openModal = useCallback((item?: JadwalItem) => {
    if (item) {
      setEditing(item);
      form.setFieldsValue({
        hari: item.hari,
        jamMulai: item.jamMulai,
        jamSelesai: item.jamSelesai,
        halaqahId: item.halaqah.id,
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

      const url = editing ? `/api/jadwal/${editing.id}` : "/api/jadwal";
      const method = editing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal menyimpan");
      }

      message.success(editing ? "Jadwal berhasil diperbarui" : "Jadwal berhasil ditambahkan");
      setModalOpen(false);
      form.resetFields();
      fetchData();
    } catch (error: unknown) {
      message.error(error instanceof Error ? error.message : "Error saving jadwal");
    }
  }, [form, editing, fetchData]);

  const handleDelete = useCallback(async (id: number) => {
    try {
      const res = await fetch(`/api/jadwal/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal menghapus");
      }
      message.success("Jadwal berhasil dihapus");
      fetchData();
    } catch (error: unknown) {
      message.error(error instanceof Error ? error.message : "Error deleting jadwal");
    }
  }, [fetchData]);

  const columns = useMemo(() => [
    { title: "ID", dataIndex: "id", key: "id", width: 60 },
    { title: "Hari", dataIndex: "hari", key: "hari", width: 100 },
    { title: "Jam Mulai", dataIndex: "jamMulai", key: "jamMulai", width: 100, render: (t: string) => new Date(t).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) },
    { title: "Jam Selesai", dataIndex: "jamSelesai", key: "jamSelesai", width: 100, render: (t: string) => new Date(t).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) },
    { title: "Halaqah", key: "halaqah", render: (_: unknown, r: JadwalItem) => `${r.halaqah.namaHalaqah} - ${r.halaqah.guru.namaLengkap}` },
    {
      title: "Actions", key: "actions", width: 160,
      render: (_: unknown, r: JadwalItem) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => openModal(r)} size="small">Edit</Button>
          <Popconfirm title="Hapus jadwal ini?" onConfirm={() => handleDelete(r.id)} okText="Ya" cancelText="Batal">
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
          <Title level={2}>Manajemen Jadwal</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>Tambah Jadwal</Button>
        </div>

        <Table dataSource={jadwal} columns={columns} rowKey="id" loading={loading} size="small" scroll={{ x: 700 }} />

        <Modal
          title={<Space><CalendarOutlined /> {editing ? "Edit Jadwal" : "Tambah Jadwal"}</Space>}
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          onOk={handleSave}
          okText="Simpan"
        >
          <Form form={form} layout="vertical">
            <Form.Item label="Hari" name="hari" rules={[{ required: true, message: "Pilih hari" }]}>
              <Select placeholder="Pilih hari">
                {HARI_LIST.map(h => <Option key={h} value={h}>{h}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item label="Jam Mulai" name="jamMulai" rules={[{ required: true, message: "Masukkan jam mulai" }]}>
              <Input type="time" placeholder="08:00" />
            </Form.Item>
            <Form.Item label="Jam Selesai" name="jamSelesai" rules={[{ required: true, message: "Masukkan jam selesai" }]}>
              <Input type="time" placeholder="09:00" />
            </Form.Item>
            <Form.Item label="Halaqah" name="halaqahId" rules={[{ required: true, message: "Pilih halaqah" }]}>
              <Select placeholder="Pilih halaqah" showSearch filterOption={(input, option) =>
                (option?.label as string || "").toLowerCase().includes(input.toLowerCase())
              } options={halaqahList.map(h => ({ value: h.id, label: h.namaHalaqah }))} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </LayoutApp>
  );
}
