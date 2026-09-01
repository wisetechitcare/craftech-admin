import React from 'react';

const AdminLoading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: 'linear-gradient(180deg, #040e1f 0%, #050f21 100%)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin">
          <div
            className="w-12 h-12 border-4 border-slate-700 border-t-red-600 rounded-full"
            style={{ boxShadow: '0 0 20px rgba(196, 27, 31, 0.3)' }}
          />
        </div>
        <p className="text-gray-400 text-sm font-medium">Loading...</p>
      </div>
    </div>
  );
};

export default AdminLoading;
