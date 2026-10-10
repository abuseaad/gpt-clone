import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import styles from "./Auth.module.css";

// Password box with a show/hide button
export default function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  autoComplete,
  hasError,
  describedBy,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={styles.passwordWrap}>
      <input
        id={id}
        type={visible ? "text" : "password"}
        className={`${styles.input} ${hasError ? styles.inputError : ""}`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={hasError ? "true" : "false"}
        aria-describedby={describedBy}
      />
      <button
        type="button"
        className={styles.eyeBtn}
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
