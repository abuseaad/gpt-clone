import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { Bot, CircleAlert, CircleCheck, Loader2 } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import { getErrorMessage } from "../../api/client";
import { isValidEmail } from "../../utils/validation";
import PasswordInput from "../PasswordInput";
import styles from "../Auth.module.css";

export default function Login() {
  const { user, login } = useAuth();
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.email || "");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Already logged in? Go to the page the user wanted (or the chat page)
  if (user) {
    return <Navigate to={location.state?.from?.pathname || "/"} replace />;
  }

  const validate = () => {
    const next = {};
    if (!email.trim()) next.email = "Email is required";
    else if (!isValidEmail(email)) next.email = "Enter a valid email address";
    if (!password) next.password = "Password is required";
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
      await login(email.trim(), password);
      // On success `user` is set, and the <Navigate> above takes over.
    } catch (error) {
      setServerError(getErrorMessage(error));
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <Bot size={24} />
        </div>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Log in to continue to your chats</p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {location.state?.registered && (
            <div className={`${styles.alert} ${styles.alertSuccess}`} role="status">
              <CircleCheck size={16} />
              <span>Account created successfully. Please log in.</span>
            </div>
          )}

          {serverError && (
            <div className={`${styles.alert} ${styles.alertError}`} role="alert">
              <CircleAlert size={16} />
              <span>{serverError}</span>
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              aria-invalid={errors.email ? "true" : "false"}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <span id="email-error" className={styles.fieldError}>
                {errors.email}
              </span>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              Password
            </label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              hasError={Boolean(errors.password)}
              describedBy={errors.password ? "password-error" : undefined}
            />
            {errors.password && (
              <span id="password-error" className={styles.fieldError}>
                {errors.password}
              </span>
            )}
          </div>

          <button type="submit" className={styles.submit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 size={18} className={styles.spinner} />}
            {isSubmitting ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className={styles.footer}>
          Don&apos;t have an account?{" "}
          <Link className={styles.link} to="/register">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
