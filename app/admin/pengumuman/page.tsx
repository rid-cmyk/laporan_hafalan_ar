"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Card, Table, Button, Modal, Form, Input, Space, message, Popconfirm, Typography } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, NotificationOutlined } from "@ant-design/icons";
import LayoutApp from "../../components/LayoutApp";

const { Title } = Typography;
const { TextArea } = Input;

interface PengumumanItem {
  id: number;
  judul: string;
  isi: string;
  tanggal: string;
}

export default function PengumumanPage() {
  const [pengumuman, setPengumuman] = useState<PengumumanItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PengumumanItem | null>(null);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/pengumuman");
      if (res.ok) {
        const result = await res.json();
        setPengumuman(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching pengumuman:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openModal = useCallback((item?: PengumumanItem) => {
    if (item) {
      setEditing(item);
      form.setFieldsValue({ judul: item.judul, isi: item.isi });
    } else {
      setEditing(null);
      form.resetFields();
    }
    setModalOpen(true);
  }, [form]);

  const handleSave = useCallback(async () => {
    try {
      const values = await form.validateFields();

      const url = editing ? `/api/pengumuman/${editing.id}` : "/api/pengumuman";
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

      message.success(editing ? "Pengumuman berhasil diperbarui" : "Pengumuman berhasil ditambahkan");
      setModalOpen(false);
      form.resetFields();
      fetchData();
    } catch (error: unknown) {
      message.error(error instanceof Error ? error.message : "Error saving pengumuman");
    }
  }, [form, editing, fetchData]);

  const handleDelete = useCallback(async (id: number) => {
    try {
      const res = await fetch(`/api/pengumuman/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal menghapus");
      }
      message.success("Pengumuman berhasil dihapus");
      fetchData();
    } catch (error: unknown) {
      message.error(error instanceof Error ? error.message : "Error deleting pengumuman");
    }
  }, [fetchData]);

  const columns = useMemo(() => [
    { title: "ID", dataIndex: "id", key: "id", width: 60 },
    { title: "Judul", dataIndex: "judul", key: "judul" },
    { title: "Isi", dataIndex: "isi", key: "isi", ellipsis: true, width: 300 },
    { title: "Tanggal", dataIndex: "tanggal", key: "tanggal", width: 120, render: (t: string) => new Date(t).toLocaleDateString("id-ID") },
    {
      title: "Actions", key: "actions", width: 160,
      render: (_: unknown, r: PengumumanItem) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => openModal(r)} size="small">Edit</Button>
          <Popconfirm title="Hapus pengumuman ini?" onConfirm={() => handleDelete(r.id)} okText="Ya" cancelText="Batal">
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
          <Title level={2}>Manajemen Pengumuman</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>Tambah Pengumuman</Button>
        </div>

        <Table dataSource={pengumuman} columns={columns} rowKey="id" loading={loading} size="small" scroll={{ x: 700 }} />

        <Modal
          title={<Space><NotificationOutlined /> {editing ? "Edit Pengumuman" : "Tambah Pengumuman"}</Space>}
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          onOk={handleSave}
          okText="Simpan"
          width={600}
        >
          <Form form={form} layout="vertical">
            <Form.Item label="Judul" name="judul" rules={[{ required: true, message: "Masukkan judul" }]}>
              <Input placeholder="Judul pengumuman" />
            </Form.Item>
            <Form.Item label="Isi" name="isi" rules={[{ required: true, message: "Masukkan isi" }]}>
              <TextArea rows={4} placeholder="Isi pengumuman" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </LayoutApp>
  );
}
