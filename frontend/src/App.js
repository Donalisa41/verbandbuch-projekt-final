import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import AccidentForm from "./components/AccidentForm";
import AdminDashboard from "./components/AdminDashboard";

import "./styles/global.css";

/* --- Hilfs-Komponenten ----------------------------------------------- */

/** Einheitlicher Header (Logo + Titel + Untertitel) */
function PageHeader({ title, subtitle }) {
  return (
    <header className="app-header">
      <div className="app-header__content">
        <a className="app-header__brand" href="/">
          <img
            src="/ga-ffm_logo.svg"     // liegt in public/
            alt="Gesundheitsamt Frankfurt am Main"
            className="app-header__brand-logo"
          />
          <div className="app-header__titles">
            <h1 className="app-header__title">{title}</h1>
            {subtitle && <p className="app-header__subtitle">{subtitle}</p>}
          </div>
        </a>
      </div>
    </header>
  );
}

/** Impressum-Seite (dein vollständiger Text) */
function ImpressumPage() {
  return (
    <>
      <PageHeader title="Impressum" subtitle="Gesundheitsamt Frankfurt am Main" />
      <main className="container">
        <div className="card" style={{ maxWidth: 900, marginTop: "1.25rem" }}>
          <h2 className="card__title">Impressum</h2>
          <div className="impressum-text">
            <p><strong>Gesamtverantwortung:</strong><br />
              Stadt Frankfurt am Main<br />
              DER MAGISTRAT<br />
              Römerberg 23<br />
              60311 Frankfurt am Main<br />
              Website: www.frankfurt.de
            </p>

            <p><strong>USt-ID:</strong> DE 114 110 388</p>

            <p><strong>Verantwortung für diese Microsite:</strong><br />
              Stadt Frankfurt am Main<br />
              Der Magistrat
            </p>

            <p><strong>Gesundheitsamt Frankfurt am Main</strong><br />
              Abteilung Digitale Zukunft, IT und strategische Planung<br />
              Breite Gasse 28<br />
              60313 Frankfurt am Main<br />
              Microsite: GA-Lotse.de
            </p>

            <p><em>
              GA-Lotse ist ein Kooperationsprojekt des Hessischen Ministeriums für Familie, Senioren, Sport,
              Gesundheit und Pflege mit dem Gesundheitsamt Frankfurt unter der EU-Förderung NextGeneration.
            </em></p>

            <p><strong>Telefonische Auskünfte:</strong><br />
              +49 (0) 800 - 4256873
            </p>

            <p><strong>Kontakt bei Presseanfragen:</strong><br />
              gesundheitsamt_einheitliche-software@stadt-frankfurt.de
            </p>

            <p><strong>Kontakt bei Fragen zur Microsite:</strong><br />
              gesundheitsamt.einheitliche-software@stadt-frankfurt.de
            </p>

            <p>
              Die Abteilung Digitale Zukunft, IT und strategische Planung des Gesundheitsamtes der Stadt Frankfurt am Main
              zeichnet für ihre Inhalte auf www.ga-lotse.de redaktionell verantwortlich.
            </p>

            <p><strong>Verantwortung:</strong><br />
              Stefanie Kaulich, Abteilungsleitung Digitale Zukunft, IT und strategische Planung.
            </p>

            <p><strong>Technische Realisierung:</strong><br />
              Gesundheitsamt der Stadt Frankfurt am Main<br />
              Abteilung Digitale Zukunft, IT und strategische Planung<br />
              Breite Gasse 28<br />
              60313 Frankfurt am Main
            </p>

            <p><strong>Bei Fragen oder Anmerkungen:</strong><br />
              gesundheitsamt.einheitliche-software@stadt-frankfurt.de
            </p>

            <p><strong>Microsites:</strong><br />
              Microsites sind Informationsangebote, die als eigenständige und in sich abgeschlossene Webseiten anmuten.
              Microsites sind innerhalb des Onlineauftrittes von frankfurt.de realisiert und auf Basis der gleichen
              technischen Infrastruktur umgesetzt.
            </p>

            <p><strong>Hinweise zum Datenschutz:</strong><br />
              Informationen zum Datenschutz finden Sie unter{" "}
              <a href="https://frankfurt.de/datenschutz" target="_blank" rel="noreferrer">
                frankfurt.de/datenschutz
              </a>.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

/** Route, die auf frankfurt.de/datenschutz weiterleitet */
function DatenschutzRedirect() {
  useEffect(() => {
    window.location.replace("https://frankfurt.de/datenschutz");
  }, []);
  return null;
}

/* --- App -------------------------------------------------------------- */

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Mitarbeiter-Route */}
          <Route
            path="/"
            element={
              <>
                <PageHeader
                  title="Verbandbuch"
                  subtitle="Gesundheitsamt Frankfurt am Main"
                />
                <main>
                  <section className="container">
                    <AccidentForm />
                  </section>
                </main>
              </>
            }
          />

          {/* Admin-Route */}
          <Route
            path="/admin"
            element={
              <>
                <PageHeader
                  title="Admin – Verbandbuch"
                  subtitle="Gesundheitsamt Frankfurt am Main – Verwaltung"
                />
                <main
                  style={{
                    minHeight: "calc(100vh - 80px)",
                    paddingTop: "2rem",
                    paddingBottom: "2rem",
                  }}
                >
                  <div className="container">
                    <AdminDashboard />
                  </div>
                </main>
              </>
            }
          />

          {/* Impressum */}
          <Route path="/impressum" element={<ImpressumPage />} />

          {/* Datenschutz → externe Seite */}
          <Route path="/datenschutz" element={<DatenschutzRedirect />} />
        </Routes>

        {/* Footer – Impressum & Datenschutz rechts */}
        <footer className="site-footer">
          <div className="footer-content">
            <nav className="footer-links">
              <Link to="/impressum">Impressum</Link>
              <Link to="/datenschutz">Datenschutz</Link>
            </nav>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
