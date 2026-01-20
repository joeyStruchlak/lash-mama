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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isTextarea && isEditing) {
      e.preventDefault();
      onSave();
    } else if (e.key === 'Escape' && isEditing) {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div className={styles.formGroup}>
      <div className={styles.labelRow}>
        <label className={styles.label}>
          {icon}
          {label}
        </label>
        {!disabled && !isEditing && (
          <button className={styles.editButton} onClick={onEdit} type="button">
            <Edit2 size={14} />
            <span>Edit</span>
          </button>
        )}
      </div>

      <div className={styles.inputContainer}>
        {isTextarea ? (
          <textarea
            className={`${styles.textarea} ${isEditing ? styles.textareaEditing : ''}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={4}
            disabled={!isEditing || disabled}
            placeholder={disabled ? '' : 'Enter your bio...'}
          />
        ) : (
          <input
            type={type}
            className={`${styles.input} ${disabled ? styles.inputDisabled : ''} ${
              isEditing ? styles.inputEditing : ''
            }`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!isEditing || disabled}
            placeholder={disabled ? '' : `Enter ${label.toLowerCase()}...`}
          />
        )}

        {isEditing && (
          <div className={styles.editActions}>
            <button className={styles.cancelBtn} onClick={onCancel} type="button">
              <X size={16} />
              Cancel
            </button>
            <button className={styles.saveBtn} onClick={onSave} type="button">
              <Check size={16} />
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
