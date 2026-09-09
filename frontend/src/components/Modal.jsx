import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import styles from './Modal.module.css';

export function Modal({ title, children, onClose }) {
  const headingId = useId();
  const modalRef = useRef(null);

  useEffect(() => {
    const handler = (event) => {
      if (event.key === 'Escape') return onClose();
      if (event.key !== 'Tab') return;
      const focusable = [
        ...modalRef.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])',
        ),
      ];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handler);
    modalRef.current?.querySelector('button')?.focus();
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className={styles.backdrop} onMouseDown={onClose}>
      <div className={styles.ambientGlow} />
      <section
        ref={modalRef}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2 id={headingId} className={styles.title}>
            {title}
          </h2>
          <button
            type="button"
            className={styles.close}
            aria-label="Close dialog"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>
        <div className={styles.modalBody}>{children}</div>
      </section>
    </div>
  );
}
