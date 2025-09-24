import { useState } from "react";
import { accidentService } from "../services/api";

// Helpers für deutsche Datums-/Zeitvalidierung
const DATE_RE = /^(\d{2})\.(\d{2})\.(\d{4})$/; // tt.mm.jjjj
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/; // hh:mm

function parseDateDE(str) {
  const m = DATE_RE.exec(str);
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  // Plausibilitätscheck (z. B. 31.02.x)
  if (
    d.getFullYear() !== Number(yyyy) ||
    d.getMonth() !== Number(mm) - 1 ||
    d.getDate() !== Number(dd)
  )
    return null;
  return d;
}

const isValidTime = (str) => TIME_RE.test(str);

const AccidentForm = () => {
  const [formData, setFormData] = useState({
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (message) setMessage("");
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

    // Pflichtfelder
    requiredFields.forEach((field) => {
      if (!formData[field] || formData[field].trim() === "") {
        newErrors[field] = "Dieses Feld ist erforderlich";
      }
    });

    // Datum/Zeit prüfen (deutsches Format)
    const dUnfall = parseDateDE(formData.unfall_datum);
    if (formData.unfall_datum && !dUnfall) {
      newErrors.unfall_datum = "Bitte im Format tt.mm.jjjj eingeben";
    }
    const dEH = parseDateDE(formData.erstehilfe_datum);
    if (formData.erstehilfe_datum && !dEH) {
      newErrors.erstehilfe_datum = "Bitte im Format tt.mm.jjjj eingeben";
    }

    if (formData.unfall_uhrzeit && !isValidTime(formData.unfall_uhrzeit)) {
      newErrors.unfall_uhrzeit = "Bitte im Format hh:mm (00–23:59) eingeben";
    }
    if (
      formData.erstehilfe_uhrzeit &&
      !isValidTime(formData.erstehilfe_uhrzeit)
    ) {
      newErrors.erstehilfe_uhrzeit =
        "Bitte im Format hh:mm (00–23:59) eingeben";
    }

    // Unfall-Datum nicht in der Zukunft
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

    // Erste Hilfe nicht vor Unfall
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
    if (!validateForm()) {
      setMessage("Bitte alle Felder korrekt ausfüllen");
      return;
    }
    setIsSubmitting(true);
    setMessage("");
    try {
      // Optional: Wenn der Server ISO erwartet, hier konvertieren:
      // const dUnfall = parseDateDE(formData.unfall_datum);
      // const dEH = parseDateDE(formData.erstehilfe_datum);
      // const payload = { ...formData,
      //   unfall_datum: dUnfall ? dUnfall.toISOString().slice(0,10) : formData.unfall_datum,
      //   erstehilfe_datum: dEH ? dEH.toISOString().slice(0,10) : formData.erstehilfe_datum,
      // };

      const response = await accidentService.create(formData);
      if (response.data.success) {
        setMessage(`Unfall erfolgreich gemeldet! ID: ${response.data.data.id}`);
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
      setMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="report-page">
      <div className="container">
        <div className="card">
          <div className="card__header">
            <p className="card__description">
              Unfallmeldung für das Gesundheitsamt Frankfurt am Main
            </p>
          </div>

          {message && (
            <div
              className={`alert ${
                message.includes("erfolgreich")
                  ? "alert--success"
                  : "alert--error"
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* --- Karte: Verletzte Person --- */}
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
                  />
                  {errors.name_verletzte_person && (
                    <div className="form-error">
                      {errors.name_verletzte_person}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* --- Karte: Unfall-Details --- */}
            <div className="card">
              <h2>Unfall-Details</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label
                    htmlFor="unfall_datum"
                    className="form-label form-label--required"
                  >
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
                    className={`form-input ${
                      errors.unfall_datum ? "form-input--error" : ""
                    }`}
                  />
                  {errors.unfall_datum && (
                    <div className="form-error">{errors.unfall_datum}</div>
                  )}
                </div>

                <div className="form-group">
                  <label
                    htmlFor="unfall_uhrzeit"
                    className="form-label form-label--required"
                  >
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
                    className={`form-input ${
                      errors.unfall_uhrzeit ? "form-input--error" : ""
                    }`}
                  />
                  {errors.unfall_uhrzeit && (
                    <div className="form-error">{errors.unfall_uhrzeit}</div>
                  )}
                </div>

                <div className="form-group col-span-2">
                  <label
                    htmlFor="ort"
                    className="form-label form-label--required"
                  >
                    Ort des Unfalls
                  </label>
                  <input
                    type="text"
                    id="ort"
                    name="ort"
                    value={formData.ort}
                    onChange={handleChange}
                    className={`form-input ${
                      errors.ort ? "form-input--error" : ""
                    }`}
                    placeholder="z.B. Büro 204, Gebäude A"
                  />
                  {errors.ort && <div className="form-error">{errors.ort}</div>}
                </div>

                <div className="form-group col-span-2">
                  <label
                    htmlFor="hergang"
                    className="form-label form-label--required"
                  >
                    Hergang des Unfalls
                  </label>
                  <textarea
                    id="hergang"
                    name="hergang"
                    value={formData.hergang}
                    onChange={handleChange}
                    className={`form-textarea ${
                      errors.hergang ? "form-input--error" : ""
                    }`}
                    placeholder="Beschreiben Sie, wie der Unfall passiert ist..."
                    rows="4"
                  />
                  {errors.hergang && (
                    <div className="form-error">{errors.hergang}</div>
                  )}
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
                  />
                  {errors.art_der_verletzung && (
                    <div className="form-error">
                      {errors.art_der_verletzung}
                    </div>
                  )}
                </div>

                <div className="form-group col-span-2">
                  <label
                    htmlFor="zeugen"
                    className="form-label form-label--required"
                  >
                    Name der Zeugen
                  </label>
                  <input
                    type="text"
                    id="zeugen"
                    name="zeugen"
                    value={formData.zeugen}
                    onChange={handleChange}
                    className={`form-input ${
                      errors.zeugen ? "form-input--error" : ""
                    }`}
                    placeholder='Namen der Zeugen oder "keine Zeugen"'
                  />
                  {errors.zeugen && (
                    <div className="form-error">{errors.zeugen}</div>
                  )}
                </div>
              </div>
            </div>

            {/* --- Karte: Erste Hilfe --- */}
            <div className="card">
              <h2>Erste-Hilfe-Leistungen</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label
                    htmlFor="erstehilfe_datum"
                    className="form-label form-label--required"
                  >
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
                    className={`form-input ${
                      errors.erstehilfe_datum ? "form-input--error" : ""
                    }`}
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
                    className={`form-input ${
                      errors.erstehilfe_uhrzeit ? "form-input--error" : ""
                    }`}
                  />
                  {errors.erstehilfe_uhrzeit && (
                    <div className="form-error">
                      {errors.erstehilfe_uhrzeit}
                    </div>
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
                  />
                  {errors.erstehilfe_massnahmen && (
                    <div className="form-error">
                      {errors.erstehilfe_massnahmen}
                    </div>
                  )}
                </div>

                <div className="form-group col-span-2">
                  <label
                    htmlFor="ersthelfer_name"
                    className="form-label form-label--required"
                  >
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
