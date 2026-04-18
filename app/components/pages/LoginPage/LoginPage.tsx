"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "../../ui/Input/Input";
import Button from "../../ui/Button/Button";
import styles from "./LoginPage.module.css";

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!email || !password) {
      setError("Por favor completa todos los campos.");
      return false;
    }
    if (!email.includes("@")) {
      setError("Ingresa un correo electrónico válido.");
      return false;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    setError("");
    if (!validate()) return;
    setLoading(true);
    try {
const response = await fetch("http://127.0.0.1:8000/api/v1/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});
const data = await response.json();
if (!response.ok) throw new Error(data.detail || "Error al iniciar sesión");
localStorage.setItem("usuario", JSON.stringify(data));
router.push("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al iniciar sesión. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.logo}>🚗</span>
          <h1 className={styles.title}>AutoPerito</h1>
          <p className={styles.subtitle}>Inicia sesión para continuar</p>
        </div>

        <div className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Correo electrónico</label>
            <Input
              type="email"
              placeholder="tucorreo@email.com"
              value={email}
              onChange={setEmail}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Contraseña</label>
            <div className={styles.passwordWrapper}>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={setPassword}
              />
              <button
                className={styles.eyeBtn}
                onClick={() => setShowPassword(!showPassword)}
                type="button"
              >
                {showPassword ? "Ocultar" : "Ver"}
              </button>
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.btnWrapper}>
            <Button
              color="green"
              onClick={handleLogin}
            >
              {loading ? "Ingresando..." : "Iniciar sesión"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;