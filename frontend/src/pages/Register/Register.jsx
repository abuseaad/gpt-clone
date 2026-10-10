import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Bot, CircleAlert, Loader2 } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import { getErrorMessage } from "../../api/client";
import {
  MIN_NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  isValidEmail,
} from "../../utils/validation";
import PasswordInput from "../PasswordInput";
import styles from "../Auth.module.css";

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();

  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  // Returns a function that updates one field of `values`
  const handleChange = (field) => (e) =>
    setValues((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const next = {};
    const firstName = values.firstName.trim();
    const lastName = values.lastName.trim();

    if (!firstName) next.firstName = "First name is required";
    else if (firstName.length < MIN_NAME_LENGTH)
      next.firstName = `At least ${MIN_NAME_LENGTH} characters`;

    if (!lastName) next.lastName = "Last name is required";
    else if (lastName.length < MIN_NAME_LENGTH)
      next.lastName = `At least ${MIN_NAME_LENGTH} characters`;

    if (!values.email.trim()) next.email = "Email is required";
    else if (!isValidEmail(values.email)) next.email = "Enter a valid email address";

    if (!values.password) next.password = "Password is required";
    else if (values.password.length < MIN_PASSWORD_LENGTH)
      next.password = `At least ${MIN_PASSWORD_LENGTH} characters`;

    if (!values.confirmPassword) next.confirmPassword = "Please confirm your password";
    else if (values.confirmPassword !== values.password)
      next.confirmPassword = "Passwords do not match";

    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setServerError("");
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await register({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        password: values.password,
      });
      // Account created: send them to the login page with a success message
      navigate("/login", {
        replace: true,
        state: { registered: true, email: values.email.trim() },
      });
    } catch (error) {
      setServerError(getErrorMessage(error));
      setIsSubmitting(false);
    }
  };

  // Small helper so each text field is written once
  const renderField = (field, label, type, placeholder, autoComplete) => (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={field}>
        {label}
      </label>
      <input
        id={field}
        type={type}
        className={`${styles.input} ${errors[field] ? styles.inputError : ""}`}
        value={values[field]}
        onChange={handleChange(field)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={errors[field] ? "true" : "false"}
        aria-describedby={errors[field] ? `${field}-error` : undefined}
      />
      {errors[field] && (
        <span id={`${field}-error`} className={styles.fieldError}>
          {errors[field]}
        </span>
      )}
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <Bot size={24} />
        </div>
        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.subtitle}>Sign up to start chatting</p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {serverError && (
            <div className={`${styles.alert} ${styles.alertError}`} role="alert">
              <CircleAlert size={16} />
              <span>{serverError}</span>
            </div>
          )}

          <div className={styles.row}>
            {renderField("firstName", "First name", "text", "sadik", "given-name")}
            {renderField("lastName", "Last name", "text", "Jemal", "family-name")}
          </div>

          {renderField("email", "Email address", "email", "sadu@example.com", "email")}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              Password
            </label>
            <PasswordInput
              id="password"
              value={values.password}
              onChange={handleChange("password")}
              placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
              autoComplete="new-password"
              hasError={Boolean(errors.password)}
              describedBy={errors.password ? "password-error" : undefined}
            />
            {errors.password && (
              <span id="password-error" className={styles.fieldError}>
                {errors.password}
              </span>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="confirmPassword">
              Confirm password
            </label>
            <PasswordInput
              id="confirmPassword"
              value={values.confirmPassword}
              onChange={handleChange("confirmPassword")}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              hasError={Boolean(errors.confirmPassword)}
              describedBy={errors.confirmPassword ? "confirmPassword-error" : undefined}
            />
            {errors.confirmPassword && (
              <span id="confirmPassword-error" className={styles.fieldError}>
                {errors.confirmPassword}
              </span>
            )}
          </div>

          <button type="submit" className={styles.submit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 size={18} className={styles.spinner} />}
            {isSubmitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account?{" "}
          <Link className={styles.link} to="/login">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
