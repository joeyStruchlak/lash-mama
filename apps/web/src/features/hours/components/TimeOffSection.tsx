// apps/web/src/features/hours/components/TimeOffSection.tsx

import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatDateRange } from '../utils/hours.helpers';
import type { TimeOffRequest } from '../types/hours.types';
import styles from '../Hours.module.css';

interface TimeOffSectionProps {
  requests: TimeOffRequest[];
  onRequestClick: () => void;
  onViewAllClick: () => void;
  onDeleteClick: (requestId: string) => void;
}

export function TimeOffSection({
  requests,
  onRequestClick,
  onViewAllClick,
  onDeleteClick,
}: TimeOffSectionProps) {
  function getStatusIcon(status: string) {
    switch (status) {
      case 'approved':
        return <CheckCircle size={20} color="#10B981" />;
      case 'rejected':
        return <XCircle size={20} color="#EF4444" />;
      default:
        return <Clock size={20} color="#F59E0B" />;
    }
  }

  return (
    <div className={styles.timeOffCard}>
      <div className={styles.timeOffHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Time Off Requests</h2>
          <p className={styles.sectionSubtitle}>Submit time off requests for Lash Mama approval</p>
        </div>
        <button className={styles.requestButton} onClick={onRequestClick}>
          <Calendar size={18} />
          Request Time Off
        </button>
      </div>
      <div className={styles.timeOffList}>
        {requests.length === 0 ? (
          <p className={styles.emptyState}>No time off requests yet</p>
        ) : (
          requests.slice(0, 3).map((request) => (
            <div key={request.id} className={styles.timeOffItem}>
              <div className={styles.timeOffIcon}>{getStatusIcon(request.status)}</div>
              <div className={styles.timeOffInfo}>
                <p className={styles.timeOffDate}>
                  {formatDateRange(request.start_date, request.end_date)}
                </p>
                <p className={styles.timeOffReason}>{request.reason}</p>
              </div>
              <span
                className={`${styles.timeOffStatus} ${
                  styles[`status${request.status.charAt(0).toUpperCase() + request.status.slice(1)}`]
                }`}
              >
                {request.status}
              </span>
              <button
                className={styles.deleteButton}
                onClick={() => onDeleteClick(request.id)}
                title="Delete request"
              >
                <XCircle size={16} />
              </button>
            </div>
          ))
        )}
      </div>
      {requests.length > 0 && (
        <button className={styles.viewAllButton} onClick={onViewAllClick}>
          View All Requests →
        </button>
      )}
    </div>
  );
}