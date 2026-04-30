const STATUS_CONFIG = {
  Applied: {
    label: 'Applied',
    badgeClass: 'badge-applied',
    dot: 'bg-blue-400',
  },
  Interview: {
    label: 'Interview',
    badgeClass: 'badge-interview',
    dot: 'bg-amber-400',
  },
  Offer: {
    label: 'Offer',
    badgeClass: 'badge-offer',
    dot: 'bg-emerald-400',
  },
  Rejected: {
    label: 'Rejected',
    badgeClass: 'badge-rejected',
    dot: 'bg-red-400',
  },
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['Applied'];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.badgeClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

export default StatusBadge;
