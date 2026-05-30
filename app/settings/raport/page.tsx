"use client";

import { useEffect, useState } from "react";
import { Card, Form, Input, Button, message, Select, Space } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import LayoutApp from "../../components/LayoutApp";

const { TextArea } = Input;
const { Option } = Select;

export default function RaportSettings() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/settings/raport");
        if (res.ok) {
          const data = await res.json();
          if (Object.keys(data).length > 0) {
            form.setFieldsValue(data);
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [form]);

  const handleSave = async (values: Record<string, unknown>) => {
    try {
      setSaving(true);
      const res = await fetch("/api/settings/raport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed to save");
      message.success("Pengaturan raport berhasil disimpan");
    } catch {
      message.error("Gagal menyimpan pengaturan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0" }}>
        <h1>Pengaturan Raport</h1>
        <Card title="Konfigurasi Raport" style={{ marginTop: 16 }}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
            initialValues={{
              templateType: "standard",
              headerText: "Laporan Hasil Belajar",
              footerText: "Disetujui oleh: ________________",
            }}
          >
            <Form.Item
              label="Tipe Template Raport"
              name="templateType"
              rules={[{ required: true, message: "Pilih tipe template" }]}
            >
              <Select placeholder="Pilih tipe template">
                <Option value="standard">Standard</Option>
                <Option value="custom">Kustom</Option>
                <Option value="minimal">Minimal</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Teks Header"
              name="headerText"
              rules={[{ required: true, message: "Masukkan teks header" }]}
            >
              <Input placeholder="Teks header raport" />
            </Form.Item>

            <Form.Item label="Teks Footer" name="footerText">
              <Input placeholder="Teks footer raport" />
            </Form.Item>

            <Form.Item label="Catatan Tambahan" name="notes">
              <TextArea rows={4} placeholder="Catatan tambahan untuk raport" />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
                  Simpan Pengaturan
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </LayoutApp>
  );
}
