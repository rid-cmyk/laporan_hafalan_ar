"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Button,
  Table,
  message,
  Space,
  Modal,
  Form,
  Input,
  Popconfirm,
  Tag,
  Alert,
} from "antd";
import {
  DownloadOutlined,
  UploadOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import LayoutApp from "../../components/LayoutApp";

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

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateBackup = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/backups", { method: "POST" });
      if (!res.ok) throw new Error("Failed to create backup");
      const newBackup = await res.json();
      message.success("Backup created successfully");
      fetchBackups();
    } catch {
      message.error("Error creating backup");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBackup = async (backup: Backup) => {
    try {
      // In a real implementation, this would download the actual file
      message.info(`Downloading ${backup.namaFile}`);
    } catch {
      message.error("Error downloading backup");
    }
  };

  const handleRestoreBackup = async () => {
    if (!selectedBackup) return;

    try {
      // In a real implementation, this would restore from the selected backup
      message.success(`Database restored from ${selectedBackup.namaFile}`);
      setIsRestoreModalOpen(false);
      setSelectedBackup(null);
    } catch {
      message.error("Error restoring backup");
    }
  };

  const handleDeleteBackup = async (id: number) => {
    try {
      // In a real implementation, this would delete the backup file
      message.success("Backup deleted successfully");
      fetchBackups();
    } catch {
      message.error("Error deleting backup");
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "File Name",
      dataIndex: "namaFile",
      key: "namaFile",
    },
    {
      title: "Date Created",
      dataIndex: "tanggalBackup",
      key: "tanggalBackup",
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: "Status",
      key: "status",
      render: () => <Tag color="green">Available</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_: unknown, record: Backup) => (
        <Space size="small">
          <Button
            type="text"
            icon={<DownloadOutlined />}
            onClick={() => handleDownloadBackup(record)}
            size="small"
          >
            Download
          </Button>
          <Button
            type="text"
            icon={<UploadOutlined />}
            onClick={() => {
              setSelectedBackup(record);
              setIsRestoreModalOpen(true);
            }}
            size="small"
          >
            Restore
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this backup?"
            onConfirm={() => handleDeleteBackup(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} size="small">
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0" }}>
        <h1>Database Backup & Restore</h1>

        <Alert
          message="Important Notice"
          description="Regular backups are crucial for data safety. Always test restore procedures in a development environment first."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Card
          title={
            <Space>
              <DatabaseOutlined />
              Backup Management
            </Space>
          }
          extra={
            <Button
              type="primary"
              icon={<DatabaseOutlined />}
              onClick={handleCreateBackup}
              loading={loading}
            >
              Create New Backup
            </Button>
          }
          style={{ marginBottom: 16 }}
        >
          <Table
            dataSource={backups}
            columns={columns}
            rowKey="id"
            loading={loading}
            size="small"
            scroll={{ x: 600 }}
          />
        </Card>

        <Modal
          title={
            <Space>
              <ExclamationCircleOutlined style={{ color: "#faad14" }} />
              Confirm Database Restore
            </Space>
          }
          open={isRestoreModalOpen}
          onCancel={() => {
            setIsRestoreModalOpen(false);
            setSelectedBackup(null);
          }}
          onOk={handleRestoreBackup}
          okText="Restore"
          okType="danger"
          width={500}
        >
          <div style={{ padding: "16px 0" }}>
            <p>Are you sure you want to restore the database from this backup?</p>
            {selectedBackup && (
              <div style={{ background: "#f6f6f6", padding: 12, borderRadius: 4, marginTop: 8 }}>
                <strong>File:</strong> {selectedBackup.namaFile}
                <br />
                <strong>Date:</strong> {new Date(selectedBackup.tanggalBackup).toLocaleString()}
              </div>
            )}
            <Alert
              message="Warning"
              description="This action will overwrite the current database. Make sure you have a recent backup before proceeding."
              type="warning"
              showIcon
              style={{ marginTop: 16 }}
            />
          </div>
        </Modal>
      </div>
    </LayoutApp>
  );
}