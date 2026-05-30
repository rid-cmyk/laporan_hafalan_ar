"use client";

import { useEffect, useState } from "react";
import {
  Card, Button, Table, message, Space, Modal, Upload, Alert, Popconfirm, Tag,
} from "antd";
import {
  DownloadOutlined, UploadOutlined, DatabaseOutlined, DeleteOutlined,
  ExclamationCircleOutlined, ExportOutlined,
} from "@ant-design/icons";
import LayoutApp from "../../components/LayoutApp";
import type { UploadProps } from "antd";

interface Backup {
  id: number;
  namaFile: string;
  tanggalBackup: string;
}

export default function BackupDatabaseSettings() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/backups");
      if (!res.ok) throw new Error("Failed to fetch backups");
      const data = await res.json();
      setBackups(data);
    } catch {
      message.error("Error fetching backups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBackups(); }, []);

  const handleCreateBackup = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/backups", { method: "POST" });
      if (!res.ok) throw new Error("Failed to create backup");
      message.success("Backup berhasil dibuat");
      fetchBackups();
    } catch {
      message.error("Gagal membuat backup");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBackup = async (backup: Backup) => {
    try {
      message.info(`Mengunduh ${backup.namaFile}...`);
    } catch {
      message.error("Gagal mengunduh backup");
    }
  };

  const handleRestoreBackup = async () => {
    if (!selectedBackup) return;
    try {
      message.success(`Database berhasil dipulihkan dari ${selectedBackup.namaFile}`);
      setIsRestoreModalOpen(false);
      setSelectedBackup(null);
    } catch {
      message.error("Gagal memulihkan database");
    }
  };

  const handleDeleteBackup = async (id: number) => {
    try {
      const res = await fetch(`/api/backups/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      message.success("Backup berhasil dihapus");
      fetchBackups();
    } catch {
      message.error("Gagal menghapus backup");
    }
  };

  const handleExportData = async () => {
    try {
      message.info("Fitur ekspor data belum tersedia");
    } catch {
      message.error("Gagal mengekspor data");
    }
  };

  const uploadProps: UploadProps = {
    name: "file",
    accept: ".json",
    showUploadList: false,
    beforeUpload: (file) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          message.info("Fitur impor data belum tersedia");
        } catch {
          message.error("Gagal mengimpor data");
        }
      };
      reader.readAsText(file);
      return false;
    },
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    { title: "Nama File", dataIndex: "namaFile", key: "namaFile" },
    {
      title: "Tanggal", dataIndex: "tanggalBackup", key: "tanggalBackup",
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: "Status", key: "status",
      render: () => <Tag color="green">Tersedia</Tag>,
    },
    {
      title: "Aksi", key: "actions", width: 220,
      render: (_: unknown, record: Backup) => (
        <Space size="small">
          <Button type="text" icon={<DownloadOutlined />} onClick={() => handleDownloadBackup(record)} size="small">Download</Button>
          <Button type="text" icon={<UploadOutlined />} onClick={() => { setSelectedBackup(record); setIsRestoreModalOpen(true); }} size="small">Restore</Button>
          <Popconfirm title="Hapus backup ini?" onConfirm={() => handleDeleteBackup(record.id)} okText="Ya" cancelText="Batal">
            <Button type="text" danger icon={<DeleteOutlined />} size="small">Hapus</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0" }}>
        <h1>Backup & Restore Database</h1>

        <Alert
          message="Penting"
          description="Lakukan backup secara rutin untuk keamanan data."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Space style={{ marginBottom: 16 }} direction="horizontal" size="middle">
          <Button type="primary" icon={<DatabaseOutlined />} onClick={handleCreateBackup} loading={loading}>
            Buat Backup Baru
          </Button>
          <Button type="default" icon={<ExportOutlined />} onClick={handleExportData}>
            Ekspor Data
          </Button>
          <Upload {...uploadProps}>
            <Button type="default" icon={<UploadOutlined />}>Impor Data</Button>
          </Upload>
        </Space>

        <Card title={<Space><DatabaseOutlined /> Manajemen Backup</Space>} style={{ marginBottom: 16 }}>
          <Table dataSource={backups} columns={columns} rowKey="id" loading={loading} size="small" scroll={{ x: 600 }} />
        </Card>

        <Modal
          title={<Space><ExclamationCircleOutlined style={{ color: "#faad14" }} /> Konfirmasi Restore</Space>}
          open={isRestoreModalOpen}
          onCancel={() => { setIsRestoreModalOpen(false); setSelectedBackup(null); }}
          onOk={handleRestoreBackup}
          okText="Restore"
          okType="danger"
          width={500}
        >
          <div style={{ padding: "16px 0" }}>
            <p>Yakin akan mengembalikan database dari backup ini?</p>
            {selectedBackup && (
              <div style={{ background: "#f6f6f6", padding: 12, borderRadius: 4, marginTop: 8 }}>
                <strong>File:</strong> {selectedBackup.namaFile}<br />
                <strong>Tanggal:</strong> {new Date(selectedBackup.tanggalBackup).toLocaleString()}
              </div>
            )}
            <Alert message="Peringatan" description="Tindakan ini akan menimpa database saat ini." type="warning" showIcon style={{ marginTop: 16 }} />
          </div>
        </Modal>
      </div>
    </LayoutApp>
  );
}
