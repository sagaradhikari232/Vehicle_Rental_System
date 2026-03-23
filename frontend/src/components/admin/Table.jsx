import React from 'react';
import { Inbox } from 'lucide-react';

const Table = ({ headers, children, loading, isEmpty }) => {
  if (loading) return <TableSkeleton columnCount={headers.length} />;

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-100 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-0">
          <thead className="bg-slate-50/50">
            <tr>
              {headers.map((header, i) => (
                <th 
                  key={i} 
                  className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] border-b border-slate-100"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isEmpty ? (
              <tr>
                <td colSpan={headers.length} className="py-20">
                  <EmptyState />
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const TableSkeleton = ({ columnCount }) => (
  <div className="w-full overflow-hidden rounded-2xl border border-slate-100 bg-white animate-pulse">
    <div className="h-12 bg-slate-50 border-b border-slate-100" />
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center px-8 py-5 border-b border-slate-50 last:border-0">
        {[...Array(columnCount)].map((_, j) => (
          <div 
            key={j} 
            className="h-4 bg-slate-100 rounded-md mr-12 last:mr-0" 
            style={{ width: `${Math.floor(Math.random() * (100 - 40 + 1) + 40)}px` }}
          />
        ))}
      </div>
    ))}
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center text-center">
    <div className="bg-slate-50 p-4 rounded-full mb-4">
      <Inbox className="w-8 h-8 text-slate-300" />
    </div>
    <h3 className="text-slate-900 font-bold">No results found</h3>
    <p className="text-slate-500 text-sm max-w-[240px] mt-1">
      We couldn't find any data matching your current filters.
    </p>
  </div>
);

export default Table;