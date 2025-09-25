import { useState } from "react";
import { useCreateAccident } from "../hooks/accidents.query";

// =========================
// Helfer für Datums-/Zeit-Masken
// =========================

// "25122024" -> "25.12.2024"
const formatDDMMYYYY = (raw) => {
  const d = String(raw || "").replace(/\D/g, "").slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}.${d.slice(2)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 4)}.${d.slice(4)}`;
};

// "930" -> "09:30", "0930" -> "09:30", "12345" -> "12:34" (Rest ignoriert)
const formatHHMM = (raw) => {
  const t = String(raw || "").replace(/\D/g, "").slice(0, 4);
  if (t.length <= 2) return t; // "0", "09"
  // ab 3 Ziffern: "123" -> "12:3" (nutzer tippt nächste 0 und wir werden "12:30")
  return `${t.slice(0, 2)}:${t.slice(2)}`;
};

// "25.12.2024" -> Date (validiert), sonst null
const parseDateDE = (str) => {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(str || "");
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  if (
    d.getFullYear() !== Number(yyyy) ||
    d.getMonth() !== Number(mm) - 1 ||
    d.getDate() !== Number(dd)
  )
    return null;
  return d;
};

// "25.12.2024" -> "2024-12-25" | "" (wenn leer/ungültig)
const toISODateFromDE = (display) => {
  const d = parseDateDE(display);
  if (!d) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

// "9:3" -> "09:03" | "930" -> "09:30" | "09:30" bleibt
const normalizeTime = (str) => {
  if (!str) return "";
  // Erst Zahlen extrahieren und in HH:MM bringen
  const fm = formatHHMM(str); // z.B. "0930" -> "09:30", "930" -> "09:30"
  const m = /^([01]?\d|2[0-3]):([0-5]\d?)$/.exec(fm);
  if (!m) return fm; // Nutzer ist noch am Tippen; zurückgeben, damit UI nicht nervt
  const hh = m[1].padStart(2, "0");
  const mm = m[2].padStart(2, "0");
  return `${hh}:${mm}`;
};

// Validierung Regex (nach Maskierung)
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

// =========================
// Komponente
// =========================
const AccidentForm = () => {
  // WICHTIG: Für Datum/Uhrzeit speichern wir die UI-Variante (mit Punkt/Colon).
  // Vor dem Absenden wird in ISO (YYYY-MM-DD) / "HH:MM" konvertiert.
  const [formData, setFormData] = useState({
    name_verletzte_person: "",
    unfall_datum: "",           // "tt.mm.jjjj" (UI)
    unfall_uhrzeit: "",         // "hh:mm" (UI)
    ort: "",
    hergang: "",
    art_der_verletzung: "",
    zeugen: "",
    erstehilfe_datum: "",       // "tt.mm.jjjj" (UI)
    erstehilfe_uhrzeit: "",     // "hh:mm" (UI)
    erstehilfe_massnahmen: "",
    ersthelfer_name: "",
  });

  const [errors, setErrors] = useState({});
  const createAccidentMutation = useCreateAccident();

  // Einheitlicher Change-Handler mit Maskierung für Datum/Zeit
  const handleChange = (e) => {
    const { name, value } = e.target;

    let next = value;
    if (name === "unfall_datum" || name === "erstehilfe_datum") {
      next = formatDDMMYYYY(value);
    }
    if (name === "unfall_uhrzeit" || name === "erstehilfe_uhrzeit") {
      next = formatHHMM(value);
    }

    setFormData((prev) => ({ ...prev, [name]: next }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      "name_verletzte_person",
      "unfall_datum",
      "unfall_uhrzeit",
      "ort",
      "hergang",
      "art_der_verletzung",
      "zeugen",
      "erstehilfe_datum",
      "erstehilfe_uhrzeit",
      "erstehilfe_massnahmen",
      "ersthelfer_name",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field] || formData[field].trim() === "") {
        newErrors[field] = "Dieses Feld ist erforderlich";
      }
    });

    // Datum prüfen
    const dUnfall = parseDateDE(formData.unfall_datum);
    if (formData.unfall_datum && !dUnfall) {
      newErrors.unfall_datum = "Bitte im Format tt.mm.jjjj eingeben";
    }
    const dEH = parseDateDE(formData.erstehilfe_datum);
    if (formData.erstehilfe_datum && !dEH) {
      newErrors.erstehilfe_datum = "Bitte im Format tt.mm.jjjj eingeben";
    }

    // Zeit prüfen (nach Maskierung sollte "hh:mm" vorhanden sein)
    const tUnfall = normalizeTime(formData.unfall_uhrzeit);
    if (formData.unfall_uhrzeit && !TIME_RE.test(tUnfall)) {
      newErrors.unfall_uhrzeit = "Bitte im Format hh:mm (00–23:59) eingeben";
    }
    const tEH = normalizeTime(formData.erstehilfe_uhrzeit);
    if (formData.erstehilfe_uhrzeit && !TIME_RE.test(tEH)) {
      newErrors.erstehilfe_uhrzeit =
        "Bitte im Format hh:mm (00–23:59) eingeben";
    }

    // Plausibilitäten
    if (dUnfall) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const onlyDate = new Date(
        dUnfall.getFullYear(),
        dUnfall.getMonth(),
        dUnfall.getDate()
      );
      if (onlyDate > today) {
        newErrors.unfall_datum = "Datum kann nicht in der Zukunft liegen";
      }
    }

    if (dUnfall && dEH) {
      const u = new Date(
        dUnfall.getFullYear(),
        dUnfall.getMonth(),
        dUnfall.getDate()
      );
      const e = new Date(dEH.getFullYear(), dEH.getMonth(), dEH.getDate());
      if (e < u) {
        newErrors.erstehilfe_datum = "Erste-Hilfe kann nicht vor Unfall sein";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Vor dem Absenden UI-Strings in Backend-Formate umwandeln
    const payload = {
      ...formData,
      unfall_datum: toISODateFromDE(formData.unfall_datum),           // "YYYY-MM-DD"
      erstehilfe_datum: toISODateFromDE(formData.erstehilfe_datum),   // "YYYY-MM-DD"
      unfall_uhrzeit: normalizeTime(formData.unfall_uhrzeit),         // "HH:MM"
      erstehilfe_uhrzeit: normalizeTime(formData.erstehilfe_uhrzeit), // "HH:MM"
    };

    try {
      const result = await createAccidentMutation.mutateAsync(payload);

      if (result?.success) {
        setFormData({
          name_verletzte_person: "",
          unfall_datum: "",
          unfall_uhrzeit: "",
          ort: "",
          hergang: "",
          art_der_verletzung: "",
          zeugen: "",
          erstehilfe_datum: "",
          erstehilfe_uhrzeit: "",
          erstehilfe_massnahmen: "",
          ersthelfer_name: "",
        });
        setErrors({});
      }
    } catch (error) {
      console.error("Submit error:", error?.message || error);
    }
  };

  // React-Query Status
  const successMessage =
    createAccidentMutation.isSuccess && createAccidentMutation.data?.success
      ? `Unfall erfolgreich gemeldet! ID: ${createAccidentMutation.data.data?.id ?? "—"}`
      : null;

  const errorMessage = createAccidentMutation.isError
    ? createAccidentMutation.error?.message
    : null;

  const isSubmitting = createAccidentMutation.isLoading;

  // Optional: simple Restriktion, damit im Datum/Zeit nur Nummern/BKSP/DEL/.: getippt werden
  const allowDigitsDot = (e) => {
    const allowed =
      /[0-9.]/.test(e.key) ||
      ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key);
    if (!allowed) e.preventDefault();
  };
  const allowDigitsColon = (e) => {
    const allowed =
      /[0-9:]/.test(e.key) ||
      ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key);
    if (!allowed) e.preventDefault();
  };

  return (
    <div className="report-page">
      <div className="container">
        <div className="card">
          <div className="card__header">
            <p className="card__description">Eintrag hinzufügen</p>
          </div>

          {successMessage && <div className="alert alert--success">{successMessage}</div>}
          {errorMessage && <div className="alert alert--error">{errorMessage}</div>}

          {Object.keys(errors).length > 0 && (
            <div className="alert alert--error">Bitte alle Felder korrekt ausfüllen</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="card">
              <h2>Verletzte Person</h2>
              <div className="form-grid">
                <div className="form-group col-span-2">
                  <label
                    htmlFor="name_verletzte_person"
                    className="form-label form-label--required"
                  >
                    Name der verletzten Person
                  </label>
                  <input
                    type="text"
                    id="name_verletzte_person"
                    name="name_verletzte_person"
                    value={formData.name_verletzte_person}
                    onChange={handleChange}
                    className={`form-input ${
                      errors.name_verletzte_person ? "form-input--error" : ""
                    }`}
                    placeholder="Vor- und Nachname"
                    disabled={isSubmitting}
                  />
                  {errors.name_verletzte_person && (
                    <div className="form-error">{errors.name_verletzte_person}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="card">
              <h2>Unfall-Details</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="unfall_datum" className="form-label form-label--required">
                    Datum des Unfalls
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="tt.mm.jjjj"
                    id="unfall_datum"
                    name="unfall_datum"
                    value={formData.unfall_datum}
                    onChange={handleChange}
                    onKeyDown={allowDigitsDot}
                    className={`form-input ${errors.unfall_datum ? "form-input--error" : ""}`}
                    disabled={isSubmitting}
                  />
                  {errors.unfall_datum && (
                    <div className="form-error">{errors.unfall_datum}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="unfall_uhrzeit" className="form-label form-label--required">
                    Uhrzeit des Unfalls
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="hh:mm"
                    id="unfall_uhrzeit"
                    name="unfall_uhrzeit"
                    value={formData.unfall_uhrzeit}
                    onChange={handleChange}
                    onKeyDown={allowDigitsColon}
                    className={`form-input ${
                      errors.unfall_uhrzeit ? "form-input--error" : ""
                    }`}
                    disabled={isSubmitting}
                  />
                  {errors.unfall_uhrzeit && (
                    <div className="form-error">{errors.unfall_uhrzeit}</div>
                  )}
                </div>

                <div className="form-group col-span-2">
                  <label htmlFor="ort" className="form-label form-label--required">
                    Ort des Unfalls
                  </label>
                  <input
                    type="text"
                    id="ort"
                    name="ort"
                    value={formData.ort}
                    onChange={handleChange}
                    className={`form-input ${errors.ort ? "form-input--error" : ""}`}
                    placeholder="z.B. Büro 204, Gebäude A"
                    disabled={isSubmitting}
                  />
                  {errors.ort && <div className="form-error">{errors.ort}</div>}
                </div>

                <div className="form-group col-span-2">
                  <label htmlFor="hergang" className="form-label form-label--required">
                    Hergang des Unfalls
                  </label>
                  <textarea
                    id="hergang"
                    name="hergang"
                    value={formData.hergang}
                    onChange={handleChange}
                    className={`form-textarea ${errors.hergang ? "form-input--error" : ""}`}
                    placeholder="Beschreiben Sie, wie der Unfall passiert ist..."
                    rows="4"
                    disabled={isSubmitting}
                  />
                  {errors.hergang && <div className="form-error">{errors.hergang}</div>}
                </div>

                <div className="form-group col-span-2">
                  <label
                    htmlFor="art_der_verletzung"
                    className="form-label form-label--required"
                  >
                    Art und Umfang der Verletzung
                  </label>
                  <textarea
                    id="art_der_verletzung"
                    name="art_der_verletzung"
                    value={formData.art_der_verletzung}
                    onChange={handleChange}
                    className={`form-textarea ${
                      errors.art_der_verletzung ? "form-input--error" : ""
                    }`}
                    placeholder="z.B. Prellung am rechten Knie..."
                    rows="3"
                    disabled={isSubmitting}
                  />
                  {errors.art_der_verletzung && (
                    <div className="form-error">{errors.art_der_verletzung}</div>
                  )}
                </div>

                <div className="form-group col-span-2">
                  <label htmlFor="zeugen" className="form-label form-label--required">
                    Name der Zeugen
                  </label>
                  <input
                    type="text"
                    id="zeugen"
                    name="zeugen"
                    value={formData.zeugen}
                    onChange={handleChange}
                    className={`form-input ${errors.zeugen ? "form-input--error" : ""}`}
                    placeholder='Namen der Zeugen oder "keine Zeugen"'
                    disabled={isSubmitting}
                  />
                  {errors.zeugen && <div className="form-error">{errors.zeugen}</div>}
                </div>
              </div>
            </div>

            <div className="card">
              <h2>Erste-Hilfe-Leistungen</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="erstehilfe_datum" className="form-label form-label--required">
                    Datum der Erste-Hilfe-Leistung
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="tt.mm.jjjj"
                    id="erstehilfe_datum"
                    name="erstehilfe_datum"
                    value={formData.erstehilfe_datum}
                    onChange={handleChange}
                    onKeyDown={allowDigitsDot}
                    className={`form-input ${
                      errors.erstehilfe_datum ? "form-input--error" : ""
                    }`}
                    disabled={isSubmitting}
                  />
                  {errors.erstehilfe_datum && (
                    <div className="form-error">{errors.erstehilfe_datum}</div>
                  )}
                </div>

                <div className="form-group">
                  <label
                    htmlFor="erstehilfe_uhrzeit"
                    className="form-label form-label--required"
                  >
                    Uhrzeit der Erste-Hilfe-Leistung
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="hh:mm"
                    id="erstehilfe_uhrzeit"
                    name="erstehilfe_uhrzeit"
                    value={formData.erstehilfe_uhrzeit}
                    onChange={handleChange}
                    onKeyDown={allowDigitsColon}
                    className={`form-input ${
                      errors.erstehilfe_uhrzeit ? "form-input--error" : ""
                    }`}
                    disabled={isSubmitting}
                  />
                  {errors.erstehilfe_uhrzeit && (
                    <div className="form-error">{errors.erstehilfe_uhrzeit}</div>
                  )}
                </div>

                <div className="form-group col-span-2">
                  <label
                    htmlFor="erstehilfe_massnahmen"
                    className="form-label form-label--required"
                  >
                    Art der Erste-Hilfe-Maßnahmen
                  </label>
                  <textarea
                    id="erstehilfe_massnahmen"
                    name="erstehilfe_massnahmen"
                    value={formData.erstehilfe_massnahmen}
                    onChange={handleChange}
                    className={`form-textarea ${
                      errors.erstehilfe_massnahmen ? "form-input--error" : ""
                    }`}
                    placeholder="z.B. Wunde gereinigt, Verband angelegt..."
                    rows="3"
                    disabled={isSubmitting}
                  />
                  {errors.erstehilfe_massnahmen && (
                    <div className="form-error">{errors.erstehilfe_massnahmen}</div>
                  )}
                </div>

                <div className="form-group col-span-2">
                  <label htmlFor="ersthelfer_name" className="form-label form-label--required">
                    Name des Ersthelfers
                  </label>
                  <input
                    type="text"
                    id="ersthelfer_name"
                    name="ersthelfer_name"
                    value={formData.ersthelfer_name}
                    onChange={handleChange}
                    className={`form-input ${
                      errors.ersthelfer_name ? "form-input--error" : ""
                    }`}
                    disabled={isSubmitting}
                  />
                  {errors.ersthelfer_name && (
                    <div className="form-error">{errors.ersthelfer_name}</div>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn--primary btn--large btn--full"
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Wird gespeichert...
                </>
              ) : (
                "In Verbandbuch eintragen"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AccidentForm;
