import styles from "./AuthLayout.module.css";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.brand}>AutoPerito</div>
        {children}
      </div>
    </div>
  );
}