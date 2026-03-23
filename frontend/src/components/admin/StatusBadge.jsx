import React from 'react';

const StatusBadge = ({ type = 'pending' }) => {
const normalizedType = type.toLowerCase();
  
  const variants = {
    pending: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      dot: "bg-amber-400"
    },
    confirmed: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      dot: "bg-blue-400"
    },
    completed: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      dot: "bg-emerald-500"
    },
    active: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      dot: "bg-emerald-500"
    },
    cancelled: {
      bg: "bg-rose-50",
      text: "text-rose-700",
      dot: "bg-rose-500"
    },
    banned: {
      bg: "bg-slate-100",
      text: "text-slate-600",
      dot: "bg-slate-400"
    }
  };

  const style = variants[normalizedType] || variants.pending;

  return (
    <span className={`
      inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ring-1 ring-inset tracking-wide
      ${style.bg} ${style.text} ${normalizedType === 'banned' ? 'ring-slate-200' : 'ring-current/10'}
    `}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
      <span className="capitalize font-bold">{type}</span>
    </span>
  );
};

export default StatusBadge;