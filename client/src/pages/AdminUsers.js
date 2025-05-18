// pages/AdminUsers.js
import React, { useEffect, useState } from "react";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/users")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("Error fetching users:", err));
  }, []);

  const handleAdd = () => {
    alert("Add user clicked");
  };

  const handleEdit = (id) => {
    alert(`Edit user ${id}`);
  };

  const handleDelete = (id) => {
    alert(`Delete user ${id}`);
  };

  return (
    <div>
      <h2>Users</h2>
      <button onClick={handleAdd}>➕ Add User</button>

      <table>
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Status</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.phone}</td>
              <td>{user.email}</td>
              <td>{user.status ? "✅ Active" : "❌ Inactive"}</td>
              <td>{user.role}</td>
              <td>
                <button onClick={() => handleEdit(user._id)}>Edit</button>
                <button onClick={() => handleDelete(user._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsers;
