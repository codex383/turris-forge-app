import { useEffect, useState } from "react";
import { logout } from "../lib/authFirebase";
import { getAllUsers } from "../lib/userProfile";

export function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
  const data = await getAllUsers();

  console.log("🔥 USERS:", data);
  console.log("🔥 COUNT:", data.length);

  setUsers(data);
};

  return (
    <div>
      <h1>👑 Admin Dashboard</h1>
      <p>Welcome Admin!</p>

      <button
        onClick={async () => {
          await logout();
          window.location.reload();
        }}
      >
        Logout
      </button>

      <h2>Registered Users</h2>

      {users.map((user) => (
        <div
          key={user.id}
          style={{
            border: "1px solid #444",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "8px",
          }}
        >
          <p><b>Name:</b> {user.name}</p>
          <p><b>Email:</b> {user.email}</p>
          <p><b>Role:</b> {user.role}</p>
        </div>
      ))}
    </div>
  );
}
