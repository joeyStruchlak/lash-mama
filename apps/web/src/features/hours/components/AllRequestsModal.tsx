// apps/web/src/features/hours/components/AllRequestsModal.tsx

import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatDateRange } from '../utils/hours.helpers';
import type { TimeOffRequest } from '../types/hours.types';
import styles from '../Hours.module.css';

interface AllRequestsModalProps {
  isOpen: boolean;
  requests: TimeOffRequest[];
  onClose: () => void;
  onDeleteClick: (requestId: string) => void;
}

export function AllRequestsModal({
  isOpen,
  requests,
  onClose,
  onDeleteClick,
}: AllRequestsModalProps) {
  if (!isOpen) return null;

  function getStatusIcon(status: string) {
    switch (status) {
      case 'approved':
        return <CheckCircle size={24} color="#10B981" />;
      case 'rejected':
        return <XCircle size={24} color="#EF4444" />;
      default:
        return <Clock size={24} color="#F59E0B" />;
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContentLarge} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>All Time Off Requests</h3>
          <button className={styles.modalClose} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          {requests.length === 0 ? (
            <div className={styles.emptyStateModal}>
              <Calendar size={48} color="hsl(0 0% 67%)" />
              <p>No time off requests yet</p>
            </div>
          ) : (
            <div className={styles.allRequestsList}>
              {requests.map((request) => (
                <div key={request.id} className={styles.requestCard}>
                  <div className={styles.requestCardHeader}>
                    <div className={styles.requestCardLeft}>
                      <div className={styles.requestCardIcon}>
                        {getStatusIcon(request.status)}
                      </div>
                      <div>
                        <p className={styles.requestCardDate}>
                          {formatDateRange(request.start_date, request.end_date)}
                        </p>
                        <p className={styles.requestCardReason}>{request.reason}</p>
                      </div>
                    </div>
                    <div className={styles.requestCardRight}>
                      <span
                        className={`${styles.timeOffStatus} ${
                          styles[
                            `status${request.status.charAt(0).toUpperCase() + request.status.slice(1)}`
                          ]
                        }`}
                      >
                        {request.status}
                      </span>
                      <button
                        className={styles.deleteButtonLarge}
                        onClick={() => {
                          onDeleteClick(request.id);
                          if (requests.length === 1) {
                            onClose();
                          }
                        }}
                        title="Delete request"
                      >
                        <XCircle size={18} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}