"use client";

import { useEffect, useState } from "react";
import { Card, Form, Input, Button, DatePicker, message, Space, Select } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import LayoutApp from "../../components/LayoutApp";
import dayjs from "dayjs";

const { Option } = Select;
const { RangePicker } = DatePicker;

export default function TahunAjaranSettings() {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings/tahun-ajaran");
        if (res.ok) {
          const data = await res.json();
          if (Object.keys(data).length > 0) {
            form.setFieldsValue({
              ...data,
              startDate: data.startDate ? dayjs(data.startDate) : undefined,
              endDate: data.endDate ? dayjs(data.endDate) : undefined,
            });
          }
        }
      } catch {
        // ignore
      }
    };
    fetchSettings();
  }, [form]);

  const handleSave = async (values: Record<string, unknown>) => {
    try {
      setSaving(true);
      const payload = { ...values };
      if (payload.startDate) {
        payload.startDate = (payload.startDate as dayjs.Dayjs).toISOString();
      }
      if (payload.endDate) {
        payload.endDate = (payload.endDate as dayjs.Dayjs).toISOString();
      }

      const res = await fetch("/api/settings/tahun-ajaran", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save");
      message.success("Pengaturan tahun ajaran berhasil disimpan");
    } catch {
      message.error("Gagal menyimpan pengaturan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0" }}>
        <h1>Pengaturan Tahun Ajaran</h1>
        <Card title="Konfigurasi Tahun Ajaran" style={{ marginTop: 16 }}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
            initialValues={{
              currentYear: "2025/2026",
              semester: "S1",
              startDate: dayjs(),
              endDate: dayjs().add(1, "year"),
            }}
          >
            <Form.Item
              label="Tahun Ajaran"
              name="currentYear"
              rules={[{ required: true, message: "Masukkan tahun ajaran" }]}
            >
              <Input placeholder="contoh: 2025/2026" />
            </Form.Item>

            <Form.Item
              label="Semester"
              name="semester"
              rules={[{ required: true, message: "Pilih semester" }]}
            >
              <Select placeholder="Pilih semester">
                <Option value="S1">Semester 1</Option>
                <Option value="S2">Semester 2</Option>
              </Select>
            </Form.Item>

            <Form.Item label="Periode Tahun Ajaran" name="period">
              <RangePicker style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item label="Deskripsi" name="description">
              <Input.TextArea rows={3} placeholder="Deskripsi tahun ajaran" />
            </Form.Item>

            <Form.Item label="Target Hafalan (Halaman)" name="hafalanTarget">
              <Input type="number" placeholder="Target hafalan" />
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
