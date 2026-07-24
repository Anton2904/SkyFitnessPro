import { useState, type FormEvent } from "react";

import logo from "../../assets/logo.svg";
import { getErrorMessage } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

type AuthMode = "login" | "register";

interface AuthFormProps {
  initialMode?: AuthMode;
  onSuccess?: () => void;
}

export function AuthForm({
  initialMode = "login",
  onSuccess,
}: AuthFormProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login, register } = useAuth();

  const validateForm = (): string | null => {
    if (!email.trim()) {
      return mode === "login"
        ? "Введите логин"
        : "Введите электронную почту";
    }

    if (!email.includes("@")) {
      return mode === "login"
        ? "Введите корректный логин"
        : "Введите корректную электронную почту";
    }

    if (!password) {
      return "Введите пароль";
    }

    if (mode === "register") {
      if (password.length < 6) {
        return "Пароль должен содержать не менее 6 символов";
      }

      const specialCharacters =
        password.match(/[^A-Za-zА-Яа-яЁё0-9]/g) ?? [];

      if (specialCharacters.length < 2) {
        return "Пароль должен содержать не менее 2 спецсимволов";
      }

      if (!/[A-ZА-ЯЁ]/.test(password)) {
        return "Пароль должен содержать как минимум одну заглавную букву";
      }

      if (!passwordRepeat) {
        return "Повторите пароль";
      }

      if (password !== passwordRepeat) {
        return "Пароли не совпадают";
      }
    }

    return null;
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    try {
      if (mode === "login") {
        await login(email.trim(), password);
      } else {
        await register(email.trim(), password);
      }

      onSuccess?.();
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMode = () => {
    setMode((currentMode) =>
      currentMode === "login" ? "register" : "login",
    );

    setPassword("");
    setPasswordRepeat("");
    setError("");
  };

  return (
    <form className="authForm" onSubmit={submit} noValidate>
      <img
        src={logo}
        alt="SkyFitnessPro"
        className="authLogo"
      />

      <div className="authFields">
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={mode === "login" ? "Логин" : "Эл. почта"}
          type="email"
          autoComplete={mode === "login" ? "username" : "email"}
          disabled={submitting}
        />

        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Пароль"
          type="password"
          autoComplete={
            mode === "login"
              ? "current-password"
              : "new-password"
          }
          disabled={submitting}
        />

        {mode === "register" && (
          <input
            value={passwordRepeat}
            onChange={(event) =>
              setPasswordRepeat(event.target.value)
            }
            placeholder="Повторите пароль"
            type="password"
            autoComplete="new-password"
            disabled={submitting}
          />
        )}

        {error && (
          <p className="formError" role="alert">
            {error}
          </p>
        )}
      </div>

      <div className="authActions">
        <button
          type="submit"
          className="primaryButton"
          disabled={submitting}
        >
          {submitting
            ? "Подождите..."
            : mode === "login"
              ? "Войти"
              : "Зарегистрироваться"}
        </button>

        <button
          type="button"
          className="secondaryButton"
          onClick={toggleMode}
          disabled={submitting}
        >
          {mode === "login"
            ? "Зарегистрироваться"
            : "Войти"}
        </button>
      </div>
    </form>
  );
}