"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, useWatch, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  clienteRegisterSchema,
  BODY_TYPES,
  SUPPORTED_BRANDS,
  VEHICLE_COLORS,
  VEHICLE_MODELS,
  tallerRegisterSchema,
  type ClienteRegisterSchema,
  type TallerRegisterSchema,
} from "./Register.schema";
import { registerRequest } from "./Register.service";
import styles from "./RegisterPage.module.css";

type Role = "cliente" | "taller";

const SPECIALTIES = ["Mecánica general", "Electricidad", "Frenos", "Inyección", "Latonería y pintura", "Aire acondicionado", "Diagnóstico electrónico", "Llantas"];
type SupportedBrand = typeof SUPPORTED_BRANDS[number];

function ErrorMessage({ message }: { message?: string }) {
  return message ? <span className={styles.errorText}>{message}</span> : null;
}

export default function RegisterPage() {
  const [role, setRole] = useState<Role>("cliente");
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [brandSelection, setBrandSelection] = useState<SupportedBrand | "">("");
  const [specialties, setSpecialties] = useState<string[]>([]);

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
    const brand = brandSelection;
    if (!brand || tallerForm.getValues("marcas_soportadas").includes(brand)) return;
    tallerForm.setValue("marcas_soportadas", [...tallerForm.getValues("marcas_soportadas"), brand], {
      shouldValidate: true,
      shouldDirty: true,
    });
    setBrandSelection("");
  };

  const toggleSpecialty = (specialty: string) => {
    const next = specialties.includes(specialty)
      ? specialties.filter((item) => item !== specialty)
      : [...specialties, specialty];
    setSpecialties(next);
    tallerForm.setValue("categoria_especialidad", next.join(", "), { shouldValidate: true, shouldDirty: true });
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
      "telefono" in data
        ? {
            ...data,
            placa: data.placa?.trim().toUpperCase() || undefined,
            telefono: data.telefono.replace(/\D/g, ""),
          }
        : { ...data, telefono_taller: data.telefono_taller.replace(/\D/g, ""), categoria_especialidad: data.categoria_especialidad };

    try {
      const response = await registerRequest(role, payload);
      setSuccessMessage(response.message ?? "Registro completado correctamente.");
      if (role === "cliente") clienteForm.reset();
      else {
        tallerForm.reset({ marcas_soportadas: [], categoria_especialidad: "" });
        setSpecialties([]);
      }
      setBrandSelection("");
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Error inesperado al registrar la cuenta.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const clienteErrors = clienteForm.formState.errors;
  const tallerErrors = tallerForm.formState.errors;
  const supportedBrands = useWatch({ control: tallerForm.control, name: "marcas_soportadas" }) ?? [];
  const clientePassword = useWatch({ control: clienteForm.control, name: "contrasena" }) ?? "";
  const tallerPassword = useWatch({ control: tallerForm.control, name: "contrasena" }) ?? "";

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
              <Field label="Teléfono" id="telefono" hint="Ej. 300 123 4567" error={clienteErrors.telefono?.message}>
                <input id="telefono" type="tel" inputMode="numeric" autoComplete="tel" maxLength={12} {...clienteForm.register("telefono", { onChange: formatPhoneChange })} />
              </Field>
              <PasswordFields registerPassword={(name) => clienteForm.register(name)} errors={clienteErrors} password={clientePassword} />
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
              <Field label="Teléfono del taller" id="telefono_taller" hint="Ej. 300 123 4567" error={tallerErrors.telefono_taller?.message}>
                <input id="telefono_taller" type="tel" inputMode="numeric" autoComplete="tel" maxLength={12} {...tallerForm.register("telefono_taller", { onChange: formatPhoneChange })} />
              </Field>
              <Field label="Especialidades" id="categoria_especialidad" hint="Selecciona una o varias" error={tallerErrors.categoria_especialidad?.message}>
                <input type="hidden" id="categoria_especialidad" {...tallerForm.register("categoria_especialidad")} />
                <div className={styles.choiceList} role="group" aria-label="Especialidades">
                  {SPECIALTIES.map((specialty) => <button type="button" key={specialty} className={specialties.includes(specialty) ? styles.choiceActive : styles.choice} onClick={() => toggleSpecialty(specialty)}>{specialty}</button>)}
                </div>
              </Field>
              <Field label="Dirección física" id="direccion_fisica" error={tallerErrors.direccion_fisica?.message}>
                <input id="direccion_fisica" {...tallerForm.register("direccion_fisica")} />
              </Field>
              <PasswordFields registerPassword={(name) => tallerForm.register(name)} errors={tallerErrors} password={tallerPassword} />
            </div>
            <Field label="Marcas soportadas" id="marca-input" error={tallerErrors.marcas_soportadas?.message}>
              <div className={styles.brandEntry}>
                <select
                  id="marca-input"
                  value={brandSelection}
                  onChange={(event) => {
                    const value = event.target.value;
                    setBrandSelection(SUPPORTED_BRANDS.find((brand) => brand === value) ?? "");
                  }}
                >
                  <option value="">Selecciona una marca</option>
                  {SUPPORTED_BRANDS.filter((brand) => !supportedBrands.includes(brand)).map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
                <button type="button" onClick={addBrand} disabled={!brandSelection}>Agregar</button>
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

function Field({ label, id, hint, error, children }: { label: string; id: string; hint?: string; error?: string; children: React.ReactNode }) {
  return <div className={styles.field}><label htmlFor={id}>{label}</label>{children}{hint && !error ? <span className={styles.hint}>{hint}</span> : null}<ErrorMessage message={error} /></div>;
}

function PasswordFields({ registerPassword, errors, password }: {
  registerPassword: (name: "contrasena" | "confirmar_contrasena") => ReturnType<UseFormRegister<ClienteRegisterSchema>>;
  errors: FieldErrors<ClienteRegisterSchema> | FieldErrors<TallerRegisterSchema>;
  password: string;
}) {
  const requirements = [
    ["8 caracteres", password.length >= 8],
    ["Una mayúscula", /[A-Z]/.test(password)],
    ["Una minúscula", /[a-z]/.test(password)],
    ["Un número", /\d/.test(password)],
    ["Un carácter especial", /[@$!%*?&]/.test(password)],
  ] as const;
  return <>
    <Field label="Contraseña" id="contrasena" error={errors.contrasena?.message ? String(errors.contrasena.message) : undefined}>
      <input id="contrasena" type="password" autoComplete="new-password" {...registerPassword("contrasena")} />
      <ul className={styles.passwordChecklist} aria-label="Requisitos de contraseña">
        {requirements.map(([label, valid]) => <li key={label} className={valid ? styles.requirementMet : styles.requirementMissing}><span aria-hidden="true">{valid ? "✓" : "○"}</span>{label}</li>)}
      </ul>
    </Field>
    <Field label="Confirmar contraseña" id="confirmar_contrasena" error={errors.confirmar_contrasena?.message ? String(errors.confirmar_contrasena.message) : undefined}><input id="confirmar_contrasena" type="password" autoComplete="new-password" {...registerPassword("confirmar_contrasena")} /></Field>
  </>;
}

function VehicleFields({ register, errors }: { register: UseFormRegister<ClienteRegisterSchema>; errors: FieldErrors<ClienteRegisterSchema> }) {
  return <section className={styles.section}><h2>Datos del vehículo <span>(opcional)</span></h2><p className={styles.hint}>Si completas cualquier campo, la placa será obligatoria.</p><div className={styles.grid}>
    <Field label="Placa" id="placa" hint="Formato: ABC123 o ABC12D (moto)" error={errors.placa?.message}><input id="placa" placeholder="ABC123" maxLength={6} autoCapitalize="characters" {...register("placa", { setValueAs: (value) => String(value).replace(/[^a-z0-9]/gi, "").toUpperCase() })} /></Field>
    <SelectField label="Marca" id="marca" options={SUPPORTED_BRANDS} register={register("marca")} error={errors.marca?.message} />
    <SelectField label="Modelo" id="modelo" options={VEHICLE_MODELS} register={register("modelo")} error={errors.modelo?.message} />
    <SelectField label="Color" id="color" options={VEHICLE_COLORS} register={register("color")} error={errors.color?.message} />
    <Field label="Año de fabricación" id="anio_fabricacion" hint={`Entre 1960 y ${new Date().getFullYear() + 1}`} error={errors.anio_fabricacion?.message}><select id="anio_fabricacion" defaultValue="" {...register("anio_fabricacion", { setValueAs: (value) => value === "" ? undefined : Number(value) })}><option value="">Selecciona un año</option>{Array.from({ length: new Date().getFullYear() + 2 - 1960 }, (_, index) => new Date().getFullYear() + 1 - index).map((year) => <option key={year} value={year}>{year}</option>)}</select></Field>
    <SelectField label="Tipo de carrocería" id="tipo_carroceria" options={BODY_TYPES} register={register("tipo_carroceria")} error={errors.tipo_carroceria?.message} />
    <Field label="Detalles de equipamiento" id="detalles_equipamiento" error={errors.detalles_equipamiento?.message}><textarea id="detalles_equipamiento" rows={3} {...register("detalles_equipamiento")} /></Field>
  </div></section>;
}

function SelectField({ label, id, options, register, error }: { label: string; id: string; options: readonly string[]; register: ReturnType<UseFormRegister<ClienteRegisterSchema>>; error?: string }) {
  return <Field label={label} id={id} hint="Selecciona una opción" error={error}>
    <select id={id} defaultValue="" {...register}>
      <option value="">Selecciona una opción</option>
      {options.map((option) => <option key={option} value={option}>{option}</option>)}
    </select>
  </Field>;
}

function formatPhoneChange(event: React.ChangeEvent<HTMLInputElement>) {
  const digits = event.target.value.replace(/\D/g, "").slice(0, 10);
  event.target.value = digits.replace(/^(\d{3})(\d{0,3})(\d{0,4}).*/, (_, first, second, third) => [first, second, third].filter(Boolean).join(" "));
}

function SubmitButton({ isSubmitting, label }: { isSubmitting: boolean; label: string }) {
  return <button type="submit" disabled={isSubmitting} className={styles.submitButton}>{isSubmitting ? "Registrando..." : label}</button>;
}
