import { logout } from "../lib/authFirebase";

export function WorkerDashboard() {
  return (
    <div>
      <h1>🎨 Worker Dashboard</h1>
      <p>Welcome Creative!</p>

<button
  onClick={async () => {
    await logout();
    window.location.reload();
  }}
>
  Logout
</button>
    </div>
  );
}
