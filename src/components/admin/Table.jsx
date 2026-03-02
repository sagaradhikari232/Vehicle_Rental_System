import React from 'react';

const Table = ({ headers, children, loading }) => {
  if (loading) return <TableSkeleton />;

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50/50 border-b border-gray-100">
          <tr>
            {headers.map((header, i) => (
              <th key={i} className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {children}
        </tbody>
      </table>
    </div>
  );
};

const TableSkeleton = () => (
  <div className="w-full animate-pulse space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-12 bg-gray-100 rounded-lg w-full" />
    ))}
  </div>
);

export default Table;