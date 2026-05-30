"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
  message,
  Select,
  Table,
  Tabs,
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import LayoutApp from "../components/LayoutApp";

const { TabPane } = Tabs;

interface Role {
  id: number;
  name: string;
  userCount?: number;
}

interface User {
  id: number;
  username: string;
  namaLengkap: string;
  noTlp?: string;
  role: Role;
}

export default function UsersPageClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [userForm] = Form.useForm();
  const [roleForm] = Form.useForm();
  const [roleDuplicateWarning, setRoleDuplicateWarning] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/users?limit=100");
      if (!res.ok) throw new Error("Failed to fetch users");
      const result = await res.json();
      setUsers(result.data || result);
    } catch {
      message.error("Error fetching users");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const res = await fetch("/api/roles");
      if (!res.ok) throw new Error("Failed to fetch roles");
      const data = await res.json();
      setRoles(data);
    } catch {
      message.error("Error fetching roles");
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchUsers(), fetchRoles()]);
  }, [fetchUsers, fetchRoles]);

  const userStats = useMemo(() => {
    const total = users.length;
    const byRole: Record<string, number> = {};
    for (const user of users) {
      const name = user.role.name.toLowerCase();
      byRole[name] = (byRole[name] || 0) + 1;
    }
    return { total, byRole };
  }, [users]);

  const usersByRole = useMemo(() => {
    const map: Record<string, User[]> = {};
    for (const user of users) {
      const name = user.role.name.toLowerCase();
      if (!map[name]) map[name] = [];
      map[name].push(user);
    }
    return map;
  }, [users]);

  const openUserModal = useCallback((user?: User) => {
    if (user) {
      setEditingUser(user);
      userForm.setFieldsValue({ ...user, roleId: user.role.id });
    } else {
      setEditingUser(null);
      userForm.resetFields();
    }
    setIsUserModalOpen(true);
  }, [userForm]);

  const handleSaveUser = useCallback(async () => {
    try {
      const values = await userForm.validateFields();
      const payload = {
        ...values,
        roleId: Number(values.roleId),
      };

      const url = editingUser ? `/api/users/${editingUser.id}` : "/api/users";
      const method = editingUser ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch {
          errorData = { error: `Server error (${res.status})` };
        }
        throw new Error(errorData.error || `Failed to save user (${res.status})`);
      }

      message.success(editingUser ? "User berhasil diperbarui" : "User berhasil ditambahkan");
      setIsUserModalOpen(false);
      userForm.resetFields();
      fetchUsers();
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "Unknown error";
      if (errMsg.includes("validateFields")) {
        message.error("Please fill in all required fields correctly");
      } else {
        message.error(errMsg || "Error saving user");
      }
    }
  }, [userForm, editingUser, fetchUsers]);

  const handleDeleteUser = useCallback(async (id: number) => {
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch {
          errorData = { error: `Server error (${res.status})` };
        }
        throw new Error(errorData.error || `Failed to delete user (${res.status})`);
      }
      const data = await res.json();
      message.success(data.message || "User berhasil dihapus");
      fetchUsers();
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "Error deleting user";
      message.error(errMsg);
    }
  }, [fetchUsers]);

  const handleResetPassword = useCallback(async (id: number) => {
    try {
      const res = await fetch(`/api/users/${id}/reset-password`, { method: "POST" });
      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch {
          errorData = { error: `Server error (${res.status})` };
        }
        throw new Error(errorData.error || `Failed to reset password (${res.status})`);
      }
      const data = await res.json();
      message.success(data.message || "Password berhasil direset");
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "Error resetting password";
      message.error(errMsg);
    }
  }, []);

  const openRoleModal = useCallback((role?: Role) => {
    if (role) {
      setEditingRole(role);
      roleForm.setFieldsValue(role);
    } else {
      setEditingRole(null);
      roleForm.resetFields();
    }
    setRoleDuplicateWarning("");
    setIsRoleModalOpen(true);
  }, [roleForm]);

  const handleSaveRole = useCallback(async () => {
    try {
      const values = await roleForm.validateFields();
      const normalizedName = values.name.trim().charAt(0).toUpperCase() + values.name.trim().slice(1).toLowerCase();

      const url = editingRole ? `/api/roles/${editingRole.id}` : "/api/roles";
      const method = editingRole ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch {
          errorData = { error: `Server error (${res.status})` };
        }
        throw new Error(errorData.error || `Failed to save role (${res.status})`);
      }

      message.success(editingRole ? "Role berhasil diperbarui" : "Role berhasil ditambahkan");
      setIsRoleModalOpen(false);
      roleForm.resetFields();

      await Promise.all([fetchRoles(), fetchUsers()]);
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "Unknown error";
      if (errMsg.includes("validateFields")) {
        message.error("Masukkan nama role yang valid");
      } else if (errMsg.includes("sudah ada")) {
        message.error("Role sudah ada. Gunakan nama lain.");
      } else {
        message.error(errMsg || "Error menyimpan role");
      }
    }
  }, [roleForm, editingRole, fetchRoles, fetchUsers]);

  const handleDeleteRole = useCallback(async (id: number) => {
    try {
      const res = await fetch(`/api/roles/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete role");
      }
      const data = await res.json();
      message.success(data.message || "Role berhasil dihapus");
      await Promise.all([fetchRoles(), fetchUsers()]);
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "Error menghapus role";
      message.error(errMsg);
    }
  }, [fetchRoles, fetchUsers]);

  const userColumns = useMemo(() => [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    { title: "Username", dataIndex: "username", key: "username" },
    { title: "Full Name", dataIndex: "namaLengkap", key: "namaLengkap" },
    { title: "Phone", dataIndex: "noTlp", key: "noTlp" },
    { title: "Role", dataIndex: ["role", "name"], key: "role" },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_: unknown, record: User) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openUserModal(record)}
            size="small"
          >
            Edit
          </Button>
          <Button
            type="text"
            icon={<KeyOutlined />}
            onClick={() => handleResetPassword(record.id)}
            size="small"
          >
            Reset
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this user?"
            onConfirm={() => handleDeleteUser(record.id)}
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
  ], [openUserModal, handleResetPassword, handleDeleteUser]);

  const roleColumns = useMemo(() => [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    { title: "Role Name", dataIndex: "name", key: "name" },
    {
      title: "Users Count",
      dataIndex: "userCount",
      key: "userCount",
      width: 120,
      render: (count: number) => (
        <span style={{ fontWeight: 'bold', color: count > 0 ? '#1890ff' : '#666' }}>
          {count || 0}
        </span>
      )
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_: unknown, record: Role) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openRoleModal(record)}
            size="small"
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Role"
            description="All users with this role will be permanently deleted."
            onConfirm={() => handleDeleteRole(record.id)}
            okText="Delete"
            cancelText="Cancel"
            okType="danger"
          >
            <Button type="text" danger icon={<DeleteOutlined />} size="small">
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ], [openRoleModal, handleDeleteRole]);

  const renderUserTable = useCallback((roleName: string) => {
    const filteredUsers = usersByRole[roleName] || [];
    return (
      <Card
        title={`${roleName.charAt(0).toUpperCase() + roleName.slice(1)} Users (${filteredUsers.length})`}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openUserModal()}>
            Add {roleName}
          </Button>
        }
      >
        <Table
          dataSource={filteredUsers}
          columns={userColumns}
          rowKey="id"
          loading={loading}
          size="small"
          scroll={{ x: 600 }}
        />
      </Card>
    );
  }, [usersByRole, userColumns, loading, openUserModal]);

  const colors = useMemo(() => ["#1890ff", "#722ed1", "#eb2f96", "#52c41a", "#faad14", "#f5222d"], []);

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0" }}>
        <h1>Users Management</h1>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Users"
                value={userStats.total}
                prefix={<UserOutlined />}
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
          {roles.map((role, index) => (
            <Col xs={24} sm={12} md={6} key={role.id}>
              <Card>
                <Statistic
                  title={role.name}
                  value={userStats.byRole[role.name.toLowerCase()] || 0}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: colors[index % colors.length] }}
                />
              </Card>
            </Col>
          ))}
        </Row>

        <Tabs defaultActiveKey="users" type="card" size="large">
          <TabPane tab="User Management" key="users">
            <Tabs defaultActiveKey="all" type="line" size="small">
              <TabPane tab="All Users" key="all">
                <Card
                  title={`All Users (${userStats.total})`}
                  extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => openUserModal()}>
                      Add User
                    </Button>
                  }
                >
                  <Table
                    dataSource={users}
                    columns={userColumns}
                    rowKey="id"
                    loading={loading}
                    size="small"
                    scroll={{ x: 600 }}
                  />
                </Card>
              </TabPane>
              {roles.map(role => (
                <TabPane tab={role.name} key={role.name.toLowerCase()}>
                  {renderUserTable(role.name.toLowerCase())}
                </TabPane>
              ))}
            </Tabs>
          </TabPane>
          <TabPane tab="Role Management" key="roles">
            <Card
              title="Roles Management"
              extra={
                <Button type="primary" icon={<PlusOutlined />} onClick={() => openRoleModal()}>
                  Add Role
                </Button>
              }
            >
              <Table
                dataSource={roles}
                columns={roleColumns}
                rowKey="id"
                loading={loading}
                size="small"
                scroll={{ x: 500 }}
              />
            </Card>
          </TabPane>
        </Tabs>

        <Modal
          title={
            <Space>
              <UserOutlined />
              {editingUser ? "Edit User" : "Add New User"}
            </Space>
          }
          open={isUserModalOpen}
          onCancel={() => setIsUserModalOpen(false)}
          onOk={handleSaveUser}
          okText="Save"
          width={600}
        >
          <Form form={userForm} layout="vertical" size="large">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Username"
                  name="username"
                  rules={[{ required: true, message: "Please enter username" }]}
                >
                  <Input placeholder="Enter username" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Password"
                  name="password"
                  rules={[{ required: !editingUser, message: "Please enter password" }]}
                >
                  <Input.Password
                    placeholder={editingUser ? "Leave blank to keep current" : "Enter password"}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              label="Full Name"
              name="namaLengkap"
              rules={[{ required: true, message: "Please enter full name" }]}
            >
              <Input placeholder="Enter full name" />
            </Form.Item>
            <Form.Item label="Phone Number" name="noTlp">
              <Input placeholder="Enter phone number" />
            </Form.Item>
            <Form.Item
              label="Role"
              name="roleId"
              rules={[{ required: true, message: "Please select a role" }]}
            >
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

        <Modal
          title={
            <Space>
              <TeamOutlined />
              {editingRole ? "Edit Role" : "Add New Role"}
            </Space>
          }
          open={isRoleModalOpen}
          onCancel={() => setIsRoleModalOpen(false)}
          onOk={handleSaveRole}
          okText="Save"
          width={400}
        >
          <Form form={roleForm} layout="vertical" size="large">
            <Form.Item
              label="Role Name"
              name="name"
              rules={[{ required: true, message: "Please enter role name" }]}
            >
              <Input
                placeholder="Enter role name"
                onChange={(e) => {
                  const value = e.target.value;
                  const normalized = value.trim().charAt(0).toUpperCase() + value.trim().slice(1).toLowerCase();
                  const existing = roles.find(role =>
                    role.name.toLowerCase() === normalized.toLowerCase() &&
                    (!editingRole || role.id !== editingRole.id)
                  );
                  setRoleDuplicateWarning(existing ? "Role sudah ada. Gunakan nama lain." : "");
                }}
              />
              {roleDuplicateWarning && (
                <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                  {roleDuplicateWarning}
                </div>
              )}
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </LayoutApp>
  );
}
