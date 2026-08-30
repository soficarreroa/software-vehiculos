"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, useWatch, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  clienteRegisterSchema,
  tallerRegisterSchema,
  type ClienteRegisterSchema,
  type TallerRegisterSchema,
} from "./Register.schema";
import { registerRequest } from "./Register.service";
import styles from "./RegisterPage.module.css";

type Role = "cliente" | "taller";

function ErrorMessage({ message }: { message?: string }) {
  return message ? <span className={styles.errorText}>{message}</span> : null;
}

export default function RegisterPage() {
  const [role, setRole] = useState<Role>("cliente");
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [brandInput, setBrandInput] = useState("");

  const clienteForm = useForm<ClienteRegisterSchema>({
    resolver: zodResolver(clienteRegisterSchema),
  });
  const tallerForm = useForm<TallerRegisterSchema>({
    resolver: zodResolver(tallerRegisterSchema),
    defaultValues: { marcas_soportadas: [] },
  });

  const changeRole = (nextRole: Role) => {
    setRole(nextRole);
    setServerError(null);
    setSuccessMessage(null);
  };

  const addBrand = () => {
    const brand = brandInput.trim();
    if (!brand || tallerForm.getValues("marcas_soportadas").includes(brand)) return;
    tallerForm.setValue("marcas_soportadas", [...tallerForm.getValues("marcas_soportadas"), brand], {
      shouldValidate: true,
    });
    setBrandInput("");
  };

  const removeBrand = (brandToRemove: string) => {
    tallerForm.setValue(
      "marcas_soportadas",
      tallerForm.getValues("marcas_soportadas").filter((brand) => brand !== brandToRemove),
      { shouldValidate: true },
    );
  };

  const submit = async (data: ClienteRegisterSchema | TallerRegisterSchema) => {
    setServerError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    const payload =
      role === "cliente" && "placa" in data
        ? {
            ...data,
            placa: data.placa?.trim().toUpperCase() || undefined,
          }
        : data;

    try {
      const response = await registerRequest(role, payload);
      setSuccessMessage(response.message ?? "Registro completado correctamente.");
      if (role === "cliente") clienteForm.reset();
      else tallerForm.reset({ marcas_soportadas: [] });
      setBrandInput("");
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Error inesperado al registrar la cuenta.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const clienteErrors = clienteForm.formState.errors;
  const tallerErrors = tallerForm.formState.errors;
  const supportedBrands = useWatch({ control: tallerForm.control, name: "marcas_soportadas" });

  return (
    <div className={styles.form}>
      <div className={styles.heading}>
        <h1 className={styles.title}>Crear cuenta</h1>
        <p className={styles.subtitle}>Regístrate para comenzar a usar AutoPerito</p>
      </div>

      <div className={styles.tabs} role="tablist" aria-label="Tipo de registro">
        <button type="button" role="tab" aria-selected={role === "cliente"} className={role === "cliente" ? styles.activeTab : ""} onClick={() => changeRole("cliente")}>
          Soy Cliente
        </button>
        <button type="button" role="tab" aria-selected={role === "taller"} className={role === "taller" ? styles.activeTab : ""} onClick={() => changeRole("taller")}>
          Soy Taller
        </button>
      </div>

      {role === "cliente" ? (
        <form onSubmit={clienteForm.handleSubmit(submit)} noValidate>
          <section className={styles.section}>
            <h2>Datos personales</h2>
            <div className={styles.grid}>
              <Field label="Nombre completo" id="nombre_completo" error={clienteErrors.nombre_completo?.message}>
                <input id="nombre_completo" autoComplete="name" {...clienteForm.register("nombre_completo")} />
              </Field>
              <Field label="Correo electrónico" id="correo" error={clienteErrors.correo?.message}>
                <input id="correo" type="email" autoComplete="email" {...clienteForm.register("correo")} />
              </Field>
              <Field label="Teléfono" id="telefono" error={clienteErrors.telefono?.message}>
                <input id="telefono" type="tel" autoComplete="tel" {...clienteForm.register("telefono")} />
              </Field>
              <PasswordFields registerPassword={(name) => clienteForm.register(name)} errors={clienteErrors} />
            </div>
          </section>
          <VehicleFields register={clienteForm.register} errors={clienteErrors} />
          <SubmitButton isSubmitting={isSubmitting} label="Crear cuenta de cliente" />
        </form>
      ) : (
        <form onSubmit={tallerForm.handleSubmit(submit)} noValidate>
          <section className={styles.section}>
            <h2>Datos del taller</h2>
            <div className={styles.grid}>
              <Field label="Nombre del representante" id="nombre_representante" error={tallerErrors.nombre_representante?.message}>
                <input id="nombre_representante" {...tallerForm.register("nombre_representante")} />
              </Field>
              <Field label="Correo corporativo" id="correo_corporativo" error={tallerErrors.correo_corporativo?.message}>
                <input id="correo_corporativo" type="email" {...tallerForm.register("correo_corporativo")} />
              </Field>
              <Field label="Nombre comercial" id="nombre_comercial" error={tallerErrors.nombre_comercial?.message}>
                <input id="nombre_comercial" {...tallerForm.register("nombre_comercial")} />
              </Field>
              <Field label="Teléfono del taller" id="telefono_taller" error={tallerErrors.telefono_taller?.message}>
                <input id="telefono_taller" type="tel" {...tallerForm.register("telefono_taller")} />
              </Field>
              <Field label="Categoría o especialidad" id="categoria_especialidad" error={tallerErrors.categoria_especialidad?.message}>
                <input id="categoria_especialidad" {...tallerForm.register("categoria_especialidad")} />
              </Field>
              <Field label="Dirección física" id="direccion_fisica" error={tallerErrors.direccion_fisica?.message}>
                <input id="direccion_fisica" {...tallerForm.register("direccion_fisica")} />
              </Field>
              <PasswordFields registerPassword={(name) => tallerForm.register(name)} errors={tallerErrors} />
            </div>
            <Field label="Marcas soportadas" id="marca-input" error={tallerErrors.marcas_soportadas?.message}>
              <div className={styles.brandEntry}>
                <input id="marca-input" value={brandInput} onChange={(event) => setBrandInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addBrand(); } }} placeholder="Ej. Toyota" />
                <button type="button" onClick={addBrand}>Agregar</button>
              </div>
              <div className={styles.tags} aria-live="polite">
                {supportedBrands.map((brand) => (
                  <span className={styles.tag} key={brand}>{brand}<button type="button" aria-label={`Quitar ${brand}`} onClick={() => removeBrand(brand)}>×</button></span>
                ))}
              </div>
            </Field>
            <Field label="Notas de servicios (opcional)" id="notas_servicios" error={tallerErrors.notas_servicios?.message}>
              <textarea id="notas_servicios" rows={3} {...tallerForm.register("notas_servicios")} />
            </Field>
          </section>
          <SubmitButton isSubmitting={isSubmitting} label="Crear cuenta de taller" />
        </form>
      )}

      {serverError && <p className={styles.serverError} role="alert">{serverError}</p>}
      {successMessage && <p className={styles.successMessage} role="status">{successMessage}</p>}
      <p className={styles.switchLink}>¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link></p>
    </div>
  );
}

function Field({ label, id, error, children }: { label: string; id: string; error?: string; children: React.ReactNode }) {
  return <div className={styles.field}><label htmlFor={id}>{label}</label>{children}<ErrorMessage message={error} /></div>;
}

function PasswordFields({ registerPassword, errors }: {
  registerPassword: (name: "contrasena" | "confirmar_contrasena") => ReturnType<UseFormRegister<ClienteRegisterSchema>>;
  errors: FieldErrors<ClienteRegisterSchema> | FieldErrors<TallerRegisterSchema>;
}) {
  return <>
    <Field label="Contraseña" id="contrasena" error={errors.contrasena?.message ? String(errors.contrasena.message) : undefined}><input id="contrasena" type="password" autoComplete="new-password" {...registerPassword("contrasena")} /></Field>
    <Field label="Confirmar contraseña" id="confirmar_contrasena" error={errors.confirmar_contrasena?.message ? String(errors.confirmar_contrasena.message) : undefined}><input id="confirmar_contrasena" type="password" autoComplete="new-password" {...registerPassword("confirmar_contrasena")} /></Field>
  </>;
}

function VehicleFields({ register, errors }: { register: UseFormRegister<ClienteRegisterSchema>; errors: FieldErrors<ClienteRegisterSchema> }) {
  return <section className={styles.section}><h2>Datos del vehículo <span>(opcional)</span></h2><p className={styles.hint}>Si completas cualquier campo, la placa será obligatoria.</p><div className={styles.grid}>
    <Field label="Placa" id="placa" error={errors.placa?.message}><input id="placa" {...register("placa")} /></Field>
    <Field label="Marca" id="marca" error={errors.marca?.message}><input id="marca" {...register("marca")} /></Field>
    <Field label="Modelo" id="modelo" error={errors.modelo?.message}><input id="modelo" {...register("modelo")} /></Field>
    <Field label="Color" id="color" error={errors.color?.message}><input id="color" {...register("color")} /></Field>
    <Field label="Año de fabricación" id="anio_fabricacion" error={errors.anio_fabricacion?.message}><input id="anio_fabricacion" type="number" min="1900" max="2100" {...register("anio_fabricacion", { setValueAs: (value) => value === "" ? undefined : Number(value) })} /></Field>
    <Field label="Tipo de carrocería" id="tipo_carroceria" error={errors.tipo_carroceria?.message}><input id="tipo_carroceria" {...register("tipo_carroceria")} /></Field>
    <Field label="Detalles de equipamiento" id="detalles_equipamiento" error={errors.detalles_equipamiento?.message}><textarea id="detalles_equipamiento" rows={3} {...register("detalles_equipamiento")} /></Field>
  </div></section>;
}

function SubmitButton({ isSubmitting, label }: { isSubmitting: boolean; label: string }) {
  return <button type="submit" disabled={isSubmitting} className={styles.submitButton}>{isSubmitting ? "Registrando..." : label}</button>;
}
