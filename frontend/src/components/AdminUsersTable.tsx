import type { UserStats } from '../types';

interface AdminUsersTableProps {
  users: UserStats[];
  onSelect: (userId: number) => void;
}

const AdminUsersTable = ({ users, onSelect }: AdminUsersTableProps) => {
  return (
    <div className="card" style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ textAlign: 'left', color: '#94a3b8' }}>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Entries</th>
            <th>Total Calories</th>
            <th>Last Meal</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} style={{ borderTop: '1px solid #f1f5f9' }}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.entryCount}</td>
              <td>{user.totalCalories}</td>
              <td>{user.lastMealTime ? new Date(user.lastMealTime).toLocaleString() : '—'}</td>
              <td>
                <button className="btn btn-primary" onClick={() => onSelect(user.id)}>
                  View entries
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsersTable;

