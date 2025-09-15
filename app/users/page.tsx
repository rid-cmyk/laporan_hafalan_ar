/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
  message,
  Select,
} from "antd";
import LayoutApp from "../components/LayoutApp";

interface Role {
  id: number;
  name: string;
}

interface User {
  id: number;
  username: string;
  namaLengkap: string;
  noTlp?: string;
  role: Role;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      message.error("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  // Fetch roles
  const fetchRoles = async () => {
    try {
      const res = await fetch("/api/roles");
      if (!res.ok) throw new Error("Failed to fetch roles");
      const data = await res.json();
      setRoles(data);
    } catch (error) {
      message.error("Error fetching roles");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  // Open modal
  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      form.setFieldsValue({ ...user, roleId: user.role.id });
    } else {
      setEditingUser(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  // Save user
  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      const url = editingUser ? `/api/users/${editingUser.id}` : "/api/users";
      const method = editingUser ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("Failed to save user");

      message.success(editingUser ? "User updated" : "User added");
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      message.error("Error saving user");
    }
  };

  // Delete user
  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete user");
      message.success("User deleted");
      fetchUsers();
    } catch (error) {
      message.error("Error deleting user");
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Username", dataIndex: "username", key: "username" },
    { title: "Full Name", dataIndex: "namaLengkap", key: "namaLengkap" },
    { title: "Phone", dataIndex: "noTlp", key: "noTlp" },
    { title: "Role", dataIndex: ["role", "name"], key: "role" },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: User) => (
        <Space>
          <Button type="link" onClick={() => openModal(record)}>Edit</Button>
          <Popconfirm
            title="Are you sure want to delete this user?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <LayoutApp>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h2>Users Management</h2>
         <Space>
          <Button type="primary" onClick={() => openModal()}>
            + Add User
          </Button>
        </Space>
       
      </div>

      <Table
        dataSource={users}
        columns={columns}
        rowKey="id"
        loading={loading}
        bordered
      />

      <Modal
        title={editingUser ? "Edit User" : "Add User"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSave}
        okText="Save"
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Username" name="username" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: !editingUser }]}
          >
            <Input.Password placeholder={editingUser ? "Leave blank to keep current" : ""} />
          </Form.Item>
          <Form.Item label="Full Name" name="namaLengkap" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Phone" name="noTlp">
            <Input />
          </Form.Item>
          <Form.Item label="Role" name="roleId" rules={[{ required: true }]}>
            <Select placeholder="Select a role">
              {roles.map((role) => (
                <Select.Option key={role.id} value={role.id}>
                  {role.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </LayoutApp>
  );
}
