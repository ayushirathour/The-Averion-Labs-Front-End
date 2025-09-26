import React, { useState } from 'react';

const AdminCredits: React.FC = () => {
  const [username, setUsername] = useState('');
  const [credits, setCredits] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleManageCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Managing credits for:', username, 'Credits:', credits, 'Reason:', reason);
      alert('Credit management feature coming soon!');
    } catch (error) {
      console.error('Failed to manage credits:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Credit Management</h1>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <form onSubmit={handleManageCredits} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Credits to Add/Remove</label>
            <input
              type="number"
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              rows={3}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Update Credits'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminCredits;
