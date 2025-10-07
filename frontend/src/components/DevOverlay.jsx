import { useState } from "react";
import { api } from "../services/api";

export default function DevOverlay() {
  const [team, setTeam] = useState(null);
  const [open, setOpen] = useState(false);

  async function fetchTeam() {
    try {
      const res = await api.get("/team/");
      setTeam(res.data);
    } catch (err) {
      setTeam({ error: true, message: err.message });
    }
  }

  return (
    <div>
      <div style={{ position: 'fixed', right: 12, bottom: 12, zIndex: 9999 }}>
        <button onClick={() => setOpen(!open)} className="bg-black text-white px-3 py-1 rounded shadow">
          {open ? 'Close Dev' : 'Dev'}
        </button>
      </div>

      {open && (
        <div style={{ position: 'fixed', right: 12, bottom: 56, width: 360, maxHeight: '60vh', overflow: 'auto', zIndex: 9999 }} className="bg-white border rounded p-3 shadow">
          <div className="flex justify-between items-center mb-2">
            <strong>Dev Overlay</strong>
            <button onClick={() => fetchTeam()} className="bg-blue-500 text-white px-2 py-1 rounded text-sm">Fetch team</button>
          </div>

          <div className="text-sm text-gray-700 mb-2">API baseURL: <code className="bg-gray-100 p-1 rounded">{api.defaults.baseURL}</code></div>

          <div className="text-sm text-gray-700 mb-2">Endpoints:
            <ul className="list-disc ml-5">
              <li>GET /api/team/</li>
              <li>POST /api/team/{"{team_id}"}/add</li>
              <li>DELETE /api/team/remove/{"{name}"}</li>
            </ul>
          </div>

          <div className="text-sm">
            <strong>Team JSON</strong>
            <pre className="text-xs bg-gray-50 p-2 rounded mt-1">{team ? JSON.stringify(team, null, 2) : 'Not fetched'}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
