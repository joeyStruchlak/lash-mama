// apps/web/src/features/profile/components/EditableField.tsx

import { Check, X, Edit2 } from 'lucide-react';
import type { EditableField as FieldType } from '../types/profile.types';
import styles from '../Profile.module.css';

interface EditableFieldProps {
  field: FieldType;
  label: string;
  value: string;
  icon?: React.ReactNode;
  isEditing: boolean;
  disabled?: boolean;
  type?: 'text' | 'email' | 'tel' | 'textarea';
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onChange: (value: string) => void;
}

export function EditableField({
  field,
  label,
  value,
  icon,
  isEditing,
  disabled = false,
  type = 'text',
  onEdit,
  onSave,
  onCancel,
  onChange,
}: EditableFieldProps) {
  const isTextarea = type === 'textarea';

  return (
    <div className={styles.formGroup}>
      <label className={styles.label}>
        {icon}
        {label}
      </label>
      <div className={styles.inputWrapper}>
        {isTextarea ? (
          <textarea
            className={styles.textarea}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            disabled={!isEditing || disabled}
          />
        ) : (
          <input
            type={type}
            className={`${styles.input} ${disabled ? styles.inputDisabled : ''}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={!isEditing || disabled}
          />
        )}
        {!disabled && (
          <>
            {isEditing ? (
              <div className={styles.iconGroup}>
                <button className={styles.iconBtn} onClick={onSave}>
                  <Check size={16} />
                </button>
                <button className={styles.iconBtn} onClick={onCancel}>
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button className={styles.iconBtn} onClick={onEdit}>
                <Edit2 size={14} />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
