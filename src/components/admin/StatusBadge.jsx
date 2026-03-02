import React from 'react';

const StatusBadge = ({ type }) => {
  const styles = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    active: "bg-emerald-100 text-emerald-700",
    banned: "bg-gray-100 text-gray-700",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${styles[type.toLowerCase()] || styles.pending}`}>
      {type}
    </span>
  );
};

export default StatusBadge;