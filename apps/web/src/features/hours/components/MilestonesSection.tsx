// apps/web/src/features/hours/components/MilestonesSection.tsx

import {
  Trophy,
  Users,
  Star,
  Target,
  Gift,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import type { Milestone } from '../types/hours.types';
import styles from '../Hours.module.css';

interface MilestonesSectionProps {
  milestones: Milestone[];
}

export function MilestonesSection({ milestones }: MilestonesSectionProps) {
  function getMilestoneIcon(icon: string) {
    switch (icon) {
      case 'users':
        return <Users size={20} />;
      case 'star':
        return <Star size={20} fill="currentColor" />;
      case 'trophy':
        return <Trophy size={20} />;
      case 'target':
        return <Target size={20} />;
      case 'gift':
        return <Gift size={20} />;
      case 'sparkles':
        return <Sparkles size={20} />;
      default:
        return <Trophy size={20} />;
    }
  }

  return (
    <div className={styles.milestonesCard}>
      <div className={styles.cardHeader}>
        <div className={styles.cardHeaderLeft}>
          <Trophy size={20} className={styles.cardIcon} />
          <h3 className={styles.sectionTitle}>Milestones</h3>
        </div>
      </div>
      <div className={styles.milestonesList}>
        {milestones.map((milestone) => (
          <div key={milestone.id} className={styles.milestoneItem}>
            <div className={styles.milestoneIcon}>{getMilestoneIcon(milestone.icon)}</div>
            <div className={styles.milestoneInfo}>
              <p className={styles.milestoneTitle}>{milestone.title}</p>
              <p className={styles.milestoneDate}>
                {new Date(milestone.date_achieved).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
            <button className={styles.milestoneButton}>
              <CheckCircle size={16} />
            </button>
          </div>
        ))}
      </div>
      <div className={styles.nextMilestone}>
        <p className={styles.nextMilestoneLabel}>Next milestone</p>
        <div className={styles.nextMilestoneProgress}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: '51%' }} />
          </div>
          <p className={styles.nextMilestoneText}>153 clients away</p>
        </div>
      </div>
    </div>
  );
}