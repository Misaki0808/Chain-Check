import React from 'react';
import { getStatusLabel, getStatusClass } from '../utils/statusLabels';

const StatusBadge = ({ statusIndex }) => {
  const statusNumber = Number(statusIndex);
  const label = getStatusLabel(statusNumber);
  const cssClass = getStatusClass(statusNumber);

  return (
    <span className={`status-badge ${cssClass}`}>
      {label}
    </span>
  );
};

export default StatusBadge;
