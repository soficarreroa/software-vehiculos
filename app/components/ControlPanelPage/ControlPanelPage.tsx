import Card from "../ui/Card/Card";
import Info from "../ui/Info/Info";
import Button from "../ui/Button/Button";
import Pill from "../ui/Pill/Pill";
import styles from "./controlPanelpage.module.css";
import { controlPanelPageOptions } from "@/lib/constants/controlPanel.constants";

const ControlPanelPage = () => {
  return (
    <main className={styles.main}>
      <div className={styles.headerMain}>
        <div>
          <h1 className={styles.title}>Panel de Control</h1>
          <p className={styles.subtitle}>Gestión integral de daños materiales</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <Pill>SOAT Vigente</Pill>
        </div>
      </div>

      <Info severity="error">
        <span>¿Necesitas ayuda inmediata en la vía?</span>
        <Button color="red">Llamar Asistencia</Button>
      </Info>

      <div className={styles.gridOptions}>
        {controlPanelPageOptions.map((option) => (
          <Card
            key={option.title}
            icon={option.icon}
            title={option.title}
            description={option.description}
          />
        ))}
      </div>
    </main>
  );
};

export default ControlPanelPage;
