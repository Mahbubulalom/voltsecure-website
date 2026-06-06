/* ==========================================================
   VoltSecure - SHARED SITE CONFIG
   Single source of truth for placeholders that still need
   client confirmation before public launch. Change values
   here and the whole site picks them up - no need to edit
   40+ inlined footers.
   ========================================================== */
window.VS_CONFIG = {
  social: {
    // Live VoltSecure social URLs (confirmed by Cai)
    linkedin:  'https://uk.linkedin.com/company/voltsecure',
    instagram: 'https://www.instagram.com/voltsecure?igsh=aWlmdTFjbWRqbXNz',
    facebook:  'https://www.facebook.com/share/1EnC5jBUYE/?mibextid=wwXIfr'
  },
  ga4: {
    // TODO Cai: paste live GA4 measurement ID here (e.g. 'G-XXXXXXXXXX')
    id: ''   // empty = analytics disabled; tag fires only when id is set
  },
  fca: {
    // TODO Cai: confirm FCA accreditation tier wording shown on
    // accreditations.html (e.g. 'Registered' / 'Authorised')
    tier: 'Registered'
  }
};

/* Rewrite the placeholder social links in the footer using the
   config above. Runs once on DOMContentLoaded. */
document.addEventListener('DOMContentLoaded', function(){
  var cfg = (window.VS_CONFIG && window.VS_CONFIG.social) || {};
  var match = {
    'linkedin.com':  cfg.linkedin,
    'instagram.com': cfg.instagram,
    'facebook.com':  cfg.facebook
  };
  document.querySelectorAll('a[href]').forEach(function(a){
    Object.keys(match).forEach(function(host){
      if (a.href.indexOf(host) !== -1 && match[host]) {
        a.href = match[host];
      }
    });
  });
});

/* ==========================================================
   VoltSecure - SHARED I18N ENGINE (English / German)
   Single source of truth for translations. The dictionary covers
   nav, footer, CTAs, common section headings and shared button
   labels - i.e. everything that appears on more than one page.
   Pages with extensive per-page copy (e.g. index.html) extend
   the dictionary at runtime via window.VS_I18N.extend({...}).

   How it works:
   - Selected language is persisted in localStorage as 'volt.lang'
   - On DOMContentLoaded every page calls applyLang(persistedLang)
     so the DE selection sticks across navigation
   - The shared .lang-toggle button (logic further down) fires a
     'voltlangchange' CustomEvent which calls applyLang(newLang)
   - Translation walks text nodes and replaces matches from the
     dictionary - non-matching text stays as-is, so partial
     coverage degrades gracefully
   ========================================================== */
(function(){
  function norm(s){ return (s||'').replace(/ /g,' ').replace(/\s+/g,' ').trim(); }

  // Shared dictionary - English -> German for strings that appear
  // across every page. Page-specific copy lives in per-page extends.
  var DE_MAP = {
    "Home": "Startseite",
    "About": "Über uns",
    "Services": "Leistungen",
    "Projects": "Projekte",
    "Accreditations": "Akkreditierungen",
    "Contact": "Kontakt",
    "Page": "Seite",
    "not found": "nicht gefunden",
    "Back to home →": "Zurück zur Startseite →",
    "The page you were looking for has either moved, been retired, or the link you followed isn't quite right. No drama - here's the way back.": "Die gesuchte Seite wurde verschoben, eingestellt, oder der gefolgte Link ist nicht ganz richtig. Kein Problem - hier geht es zurück.",
    "Couldn't find what you needed?": "Nicht gefunden, was Sie suchten?",
    "Tell us what you were after and we'll point you to the right page - or come back with a quote within one working day.": "Sagen Sie uns, wonach Sie suchten, und wir verweisen Sie an die richtige Seite - oder melden uns innerhalb eines Werktages mit einem Angebot.",
    "Request a quote": "Angebot anfordern",
    "Request a quote →": "Angebot anfordern →",
    "Send enquiry →": "Anfrage senden →",
    "Start a project": "Projekt starten",
    "Start a project →": "Projekt starten →",
    "Start a conversation.": "Beginnen Sie ein Gespräch.",
    "Get in touch": "Kontakt aufnehmen",
    "Contact us": "Kontakt aufnehmen",
    "See recent work": "Aktuelle Projekte ansehen",
    "View all projects →": "Alle Projekte ansehen →",
    "Read case study →": "Fallstudie lesen →",
    "View case study →": "Fallstudie ansehen →",
    "Read more →": "Mehr lesen →",
    "Read example →": "Beispiel ansehen →",
    "Apply by email →": "Per E-Mail bewerben →",
    "Email speculative application →": "Initiativbewerbung per E-Mail →",
    "Email supplier enquiry →": "Lieferantenanfrage per E-Mail →",
    "Email us": "E-Mail an uns",
    "Talk to our team": "Sprechen Sie mit unserem Team",
    "Call 02922 641046": "Anrufen 02922 641046",
    "Discuss a similar brief →": "Ähnlichen Auftrag besprechen →",
    "International": "International",
    "VoltSecure UK": "VoltSecure UK",
    "VoltSecure Deutschland": "VoltSecure Deutschland",
    "VoltSecure Ireland": "VoltSecure Irland",
    "About us": "Über uns",
    "Case studies": "Fallstudien",
    "Case studies & example projects": "Fallstudien und Beispielprojekte",
    "ESG & social value": "ESG und sozialer Wert",
    "VoltSecure & you": "VoltSecure und Sie",
    "Employees": "Mitarbeiter",
    "Jobs & apprenticeships": "Jobs und Ausbildungen",
    "Media enquiries": "Presseanfragen",
    "Suppliers": "Lieferanten",
    "Follow us": "Folgen Sie uns",
    "Accessibility": "Barrierefreiheit",
    "Accessibility statement": "Erklärung zur Barrierefreiheit",
    "Carbon reduction plan": "Klimaschutzplan",
    "Cookie policy": "Cookie-Richtlinie",
    "Modern slavery statement": "Erklärung zu moderner Sklaverei",
    "Modern Slavery statement": "Erklärung zu moderner Sklaverei",
    "Privacy notice": "Datenschutzerklärung",
    "Site terms": "Nutzungsbedingungen",
    "VoltSecure® Ltd · © 2026 · All rights reserved · BAFE 303517": "VoltSecure® Ltd · © 2026 · Alle Rechte vorbehalten · BAFE 303517",
    "Fire, security & electrical engineering for commercial estates across the UK, Ireland and continental Europe.": "Brandschutz-, Sicherheits- und Elektrotechnik für gewerbliche Immobilien in Großbritannien, Irland und Kontinentaleuropa.",
    "8+ core accreditations": "8+ Kernakkreditierungen",
    "19 yrs industry": "19 Jahre Branchenerfahrung",
    "4h": "4 Std.",
    "1 PM": "1 PM",
    "Engineer response · SLA sites": "Ingenieur-Einsatz · SLA-Standorte",
    "Per project - one point of contact": "Pro Projekt - ein Ansprechpartner",
    "Years of commercial delivery": "Jahre kommerzielle Lieferung",
    "Projects completed": "Abgeschlossene Projekte",
    "UK & Europe": "GB und Europa",
    "Operational coverage": "Operative Abdeckung",
    "INSTALLATIONS COMPLETE": "INSTALLATIONEN ABGESCHLOSSEN",
    "SYS · LIVE": "SYS · LIVE",
    "Grid scan": "Rasterscan",
    "Radar sweep": "Radarsuche",
    "Particle flow": "Partikelfluss",
    "Hero animation": "Hero-Animation",
    "◆ About VoltSecure": "◆ Über VoltSecure",
    "◆ BAFE 303517 · NICEIC · SSAIB · ECA": "◆ BAFE 303517 · NICEIC · SSAIB · ECA",
    "◆ BAFE · SSAIB · NICEIC · ECA · SSIP · JIB accredited": "◆ BAFE · SSAIB · NICEIC · ECA · SSIP · JIB akkreditiert",
    "◆ Caerphilly County Borough": "◆ Caerphilly County Borough",
    "◆ Capabilities": "◆ Leistungen",
    "◆ Cardiff City Council": "◆ Cardiff City Council",
    "◆ Case studies": "◆ Fallstudien",
    "◆ Community & sponsorship": "◆ Gemeinschaft und Sponsoring",
    "◆ Compliance as standard": "◆ Compliance als Standard",
    "◆ Compliance · Trust · Standards": "◆ Compliance · Vertrauen · Standards",
    "◆ Contact": "◆ Kontakt",
    "◆ Coverage": "◆ Abdeckung",
    "◆ Engineered in-house": "◆ Im eigenen Haus konstruiert",
    "◆ Error 404 · page not found": "◆ Fehler 404 · Seite nicht gefunden",
    "◆ Explore each accreditation": "◆ Akkreditierungen erkunden",
    "◆ Founded 2021": "◆ Gegründet 2021",
    "◆ Founder": "◆ Gründer",
    "◆ How we deliver": "◆ So liefern wir",
    "◆ How we operate": "◆ So arbeiten wir",
    "◆ Let's build it right": "◆ Lassen Sie es uns richtig bauen",
    "◆ Local roots · UK & Europe reach": "◆ Lokale Wurzeln · Reichweite in GB und Europa",
    "◆ Milestones": "◆ Meilensteine",
    "◆ Request a quote": "◆ Angebot anfordern",
    "◆ Rhondda Cynon Taf": "◆ Rhondda Cynon Taf",
    "◆ Selected work": "◆ Ausgewählte Arbeiten",
    "◆ Start a project": "◆ Projekt starten",
    "◆ Talk to a person": "◆ Mit einer Person sprechen",
    "◆ The wider team": "◆ Das erweiterte Team",
    "◆ Try one of these": "◆ Versuchen Sie eines davon",
    "◆ Tweaks": "◆ Anpassungen",
    "◆ VoltSecure & you · Careers": "◆ VoltSecure und Sie · Karriere",
    "◆ VoltSecure & you · Employees": "◆ VoltSecure und Sie · Mitarbeiter",
    "◆ VoltSecure & you · Suppliers": "◆ VoltSecure und Sie · Lieferanten",
    "◆ What clients say": "◆ Was Kunden sagen",
    "◆ What we do": "◆ Was wir tun",
    "◆ Who we work with": "◆ Mit wem wir arbeiten",
    "◆ Work with us": "◆ Arbeiten Sie mit uns",
    "◉ DE · AT · NL · IE": "◉ DE · AT · NL · IE",
    "◉ Swansea": "◉ Swansea",
    "◉ UK-wide": "◉ Großbritannien-weit",
    "◉ Wales & the West": "◉ Wales und der Westen",
    "★ FINALIST 2024": "★ FINALIST 2024",
    "Electrical": "Elektrik",
    "Maintenance": "Wartung",
    "Fire": "Brandschutz",
    "CCTV": "CCTV",
    "CCTV & Surveillance": "CCTV und Überwachung",
    "Access": "Zutritt",
    "Access control": "Zutrittskontrolle",
    "Access Control": "Zutrittskontrolle",
    "Access control & biometrics": "Zutrittskontrolle und Biometrie",
    "Data": "Daten",
    "Data & Networks": "Daten und Netzwerke",
    "Automation": "Automatisierung",
    "Building Automation": "Gebäudeautomatisierung",
    "Aspirating": "Ansaugend",
    "Aspirating fire detection.": "Ansaugende Brandfrüherkennung.",
    "Intruder": "Einbruchschutz",
    "Intruder design": "Einbruchmeldesysteme-Design",
    "Intruder alarms": "Einbruchmeldeanlagen",
    "Security": "Sicherheit",
    "Battery": "Batterie",
    "Light": "Licht",
    "Biometric": "Biometrisch",
    "Integrated": "Integriert",
    "Industrial": "Industriell",
    "Hospitality": "Gastgewerbe",
    "Education": "Bildung",
    "Logistics": "Logistik",
    "Banking": "Banken",
    "Energy services": "Energiedienstleistungen",
    "Air Aspirating": "Luftansaugung",
    "Solar PV": "Solar PV",
    "Catenary": "Kettenleitung",
    "Lutron": "Lutron",
    "IP CCTV": "IP-CCTV",
    "VMS integration": "VMS-Integration",
    "Net2 access control": "Net2-Zutrittskontrolle",
    "Paxton10 hybrid": "Paxton10 Hybrid",
    "Grade 2": "Grad 2",
    "Grade 3": "Grad 3",
    "Tier 3": "Tier 3",
    "VESDA-E": "VESDA-E",
    "Listed consent": "Denkmalschutz-Zustimmung",
    "Zoned audio": "Zonen-Audio",
    "Cat 6A": "Cat 6A",
    "Cat A fit-out": "Cat A Ausbau",
    "Lighting controls": "Lichtsteuerung",
    "Lighting & power": "Beleuchtung und Strom",
    "Emergency lighting": "Notbeleuchtung",
    "Containment": "Kabeltrassen",
    "Testing": "Prüfung",
    "Testing & inspection": "Prüfung und Inspektion",
    "Testing & certification": "Prüfung und Zertifizierung",
    "Commercial delivery": "Kommerzielle Lieferung",
    "Documentation": "Dokumentation",
    "Procurement": "Beschaffung",
    "Compliance": "Compliance",
    "Sustainability": "Nachhaltigkeit",
    "Programme": "Programm",
    "Reactive": "Reaktiv",
    "Mobile": "Mobil",
    "Rolling": "Rollend",
    "Multi-site": "Mehrere Standorte",
    "Multi-country": "Mehrere Länder",
    "Selected": "Ausgewählt",
    "All": "Alle",
    "Programme-managed": "Programmverwaltet",
    "Audited & assured": "Auditiert und abgesichert",
    "Onboarding": "Einarbeitung",
    "Invoicing": "Rechnungsstellung",
    "Health & safety": "Gesundheit und Sicherheit",
    "Pay & HR": "Vergütung und HR",
    "Pay, leave & benefits": "Vergütung, Urlaub und Leistungen",
    "Holiday.": "Urlaub.",
    "Pension.": "Rente.",
    "Sick pay.": "Krankengeld.",
    "Vehicle.": "Fahrzeug.",
    "Manufacturer training.": "Hersteller-Schulungen.",
    "Tools & PPE.": "Werkzeuge und PSA.",
    "Annual review": "Jährliche Überprüfung",
    "Open roles": "Offene Stellen",
    "How to apply": "So bewerben Sie sich",
    "What we look for": "Wonach wir suchen",
    "What we offer": "Was wir bieten",
    "What we expect, day to day": "Was wir tagtäglich erwarten",
    "What we buy": "Was wir kaufen",
    "What it is": "Was es ist",
    "What this means for clients": "Was dies für Kunden bedeutet",
    "What to expect from the process": "Was Sie vom Prozess erwarten können",
    "What you can expect from us": "Was Sie von uns erwarten können",
    "What each certification means.": "Was jede Zertifizierung bedeutet.",
    "Why VoltSecure.": "Warum VoltSecure.",
    "Quality & competence": "Qualität und Kompetenz",
    "Invested in people": "In Menschen investiert",
    "Wellness support": "Wellness-Unterstützung",
    "EAP scheme": "EAP-Programm",
    "Equal opportunities": "Chancengleichheit",
    "Funded": "Finanziert",
    "Day-release": "Studienurlaub",
    "Full-time": "Vollzeit",
    "Office-based": "Büro-basiert",
    "UK travel": "Reisen in Großbritannien",
    "UK + EU travel": "Reisen in Großbritannien und EU",
    "UK-wide": "Großbritannien-weit",
    "Office hours, Mon-Fri. For urgent issues, leave a message and we'll come back same day.": "Bürozeiten, Mo-Fr. Bei dringenden Anliegen hinterlassen Sie eine Nachricht, wir melden uns am selben Tag.",
    "General enquiries · quotes · maintenance": "Allgemeine Anfragen · Angebote · Wartung",
    "Mon–Fri, 08:00–17:30 · out-of-hours on live contracts": "Mo-Fr, 08:00-17:30 · außerhalb der Geschäftszeiten bei laufenden Verträgen",
    "Phone": "Telefon",
    "Email": "E-Mail",
    "Name": "Name",
    "Company": "Unternehmen",
    "(optional)": "(optional)",
    "Project details": "Projektdetails",
    "Service area": "Servicebereich",
    "Select one…": "Bitte wählen…",
    "Something else": "Etwas Anderes",
    "Maintenance contract": "Wartungsvertrag",
    "Fire detection & alarms (BAFE SP203-1)": "Brandmeldeanlagen (BAFE SP203-1)",
    "Security & CCTV (SSAIB, BS EN 62676)": "Sicherheit und CCTV (SSAIB, BS EN 62676)",
    "Electrical design & install (NICEIC, BS 7671)": "Elektroplanung und -installation (NICEIC, BS 7671)",
    "All fields marked with": "Alle mit gekennzeichneten Felder",
    "are required. We'll never share your details.": "sind erforderlich. Wir geben Ihre Daten niemals weiter.",
    "I agree to VoltSecure contacting me about this enquiry. Details are stored securely and never shared with third parties.": "Ich stimme zu, dass VoltSecure mich bezüglich dieser Anfrage kontaktiert. Daten werden sicher gespeichert und niemals an Dritte weitergegeben.",
    "Reply within 1 working day": "Antwort innerhalb von 1 Werktag",
    "We'll use this to prepare an accurate first response.": "Wir verwenden dies, um eine genaue erste Antwort vorzubereiten.",
    "Recent projects.": "Aktuelle Projekte.",
    "Coverage": "Abdeckung",
    "What clients say": "Was Kunden sagen",
    "Capabilities": "Leistungen",
    "How we operate": "So arbeiten wir",
    "Got a similar brief?": "Ähnlicher Auftrag?",
    "Selected work": "Ausgewählte Arbeiten",
    "Independently certified by": "Unabhängig zertifiziert von",
    "Recognised by leading industry bodies": "Anerkannt von führenden Branchenverbänden",
    "Industry accreditations": "Branchenakkreditierungen",
    "Designed to standards": "Nach Normen entworfen",
    "Engineering as": "Ingenieurwesen als",
    "Compliance as": "Compliance als",
    "craft.": "Handwerk.",
    "standard.": "Standard.",
    "Engineers, not": "Ingenieure, nicht",
    "resellers": "Wiederverkäufer",
    "Engineering that": "Ingenieurleistungen, die",
    "covers": "jedes",
    "every critical system.": "kritische System abdecken.",
    "Compliance is the standard, not the ceiling.": "Compliance ist der Standard, nicht die Obergrenze.",
    "Compliance & delivery standards.": "Compliance- und Lieferstandards.",
    "Not badges on a website.": "Keine Abzeichen auf einer Website.",
    "Operating evidence.": "Betriebsnachweise.",
    "Trusted by the": "Vertrauen von",
    "projects": "Projekten",
    "we make on every job.": "die wir bei jedem Auftrag eingehen.",
    "we work.": "wir arbeiten.",
    "what matters.": "was zählt.",
    "where": "wo",
    "Accreditations that": "Akkreditierungen, die",
    "looks like": "aussieht wie",
    "one of these?": "eines davon?",
    "every installation.": "jede Installation.",
    "Every system.": "Jedes System.",
    "Operating across the continent.": "Auf dem gesamten Kontinent tätig.",
    "Headquartered in South Wales.": "Hauptsitz in Südwales.",
    "Welcome to VoltSecure.": "Willkommen bei VoltSecure.",
    "Got a question?": "Haben Sie eine Frage?",
    "Got a brief that": "Haben Sie einen Auftrag, der",
    "Need a": "Benötigen Sie einen",
    "compliant": "konformen",
    "installation partner?": "Installationspartner?",
    "Can't see the": "Sehen Sie nicht den",
    "exact": "genauen",
    "service?": "Service?",
    "Let's": "Lassen Sie uns",
    "talk": "sprechen",
    "team": "Team",
    "Bring us in": "Holen Sie uns",
    "Bring us in early.": "Holen Sie uns früh dazu.",
    "We'll help avoid delays.": "Wir helfen, Verzögerungen zu vermeiden.",
    "Build a career,": "Bauen Sie eine Karriere auf,",
    "not just a job": "nicht nur einen Job",
    "Trusted partners,": "Vertrauenswürdige Partner,",
    "engineered": "entwickelt",
    "for": "für",
    "Working with": "Arbeiten mit",
    "people.": "Menschen.",
    "Rooted in": "Verwurzelt in",
    "Cai.": "Cai.",
    "A short timeline.": "Eine kurze Chronik.",
    "Modern fleet.": "Moderne Flotte.",
    "Funded apprenticeships.": "Finanzierte Ausbildungen.",
    "Prompt payment.": "Pünktliche Zahlung.",
    "Fair pricing.": "Faire Preise.",
    "Honest feedback.": "Ehrliches Feedback.",
    "Clear scope.": "Klarer Umfang.",
    "Speak up.": "Sprechen Sie es an.",
    "Look after each other.": "Achten Sie aufeinander.",
    "Tidy site, tidy paperwork.": "Saubere Baustelle, ordentliche Unterlagen.",
    "Real career path.": "Echter Karriereweg.",
    "Live retail": "Aktive Einzelhandelsstandorte",
    "Live store": "Aktive Filiale",
    "Live roles refreshed regularly.": "Aktive Stellen regelmäßig aktualisiert.",
    "two locations": "zwei Standorte",
    "every job": "jedem Auftrag",
    "Caerphilly HQ": "Hauptsitz Caerphilly",
    "Pontypridd Service Hub": "Service-Hub Pontypridd",
    "Pontypridd Operations Hub": "Operations-Hub Pontypridd",
    "Head office": "Hauptsitz",
    "Bedwas, Caerphilly · CF83 8DW · UK": "Bedwas, Caerphilly · CF83 8DW · GB",
    "Cilfynydd, Pontypridd · CF37 4NX · UK": "Cilfynydd, Pontypridd · CF37 4NX · GB",
    "Unit A1 Ayjay House, 23 Greenway": "Unit A1 Ayjay House, 23 Greenway",
    "Unit 33 Albion Industrial Estate": "Unit 33 Albion Industrial Estate",
    "Main office · management · project coordination · administration": "Hauptbüro · Management · Projektkoordination · Verwaltung",
    "Stores · logistics · engineer support · service operations": "Lager · Logistik · Ingenieursupport · Servicebetrieb",
    "(main office, management, project coordination and administration) and our": "(Hauptbüro, Management, Projektkoordination und Verwaltung) und unser",
    "(stores, logistics, engineer support and service operations).": "(Lager, Logistik, Ingenieursupport und Servicebetrieb).",
    "VoltSecure designs, installs and maintains mission-critical systems for commercial estates across the UK and Europe - from national retail rollouts to landmark new-builds. Every project delivered to BS 7671, BS 5839 and BS EN 62676 standards.": "VoltSecure plant, installiert und wartet geschäftskritische Systeme für gewerbliche Immobilien in Großbritannien und Europa - von landesweiten Einzelhandels-Rollouts bis hin zu prestigeträchtigen Neubauten. Jedes Projekt wird nach den Standards BS 7671, BS 5839 und BS EN 62676 ausgeführt.",
    "Commercial estates, public-sector frameworks, national retail rollouts and heritage refurbishments - delivered to BAFE, NICEIC and SSAIB standards across the UK and continental Europe.": "Gewerbeimmobilien, öffentliche Rahmenverträge, landesweite Einzelhandels-Rollouts und Sanierungen von Denkmälern - geliefert nach BAFE-, NICEIC- und SSAIB-Standards in Großbritannien und Kontinentaleuropa.",
    "We design, install and maintain integrated life-safety, security and electrical systems under a single accredited roof - eliminating the handoffs, delays and finger-pointing that come with multiple contractors.": "Wir planen, installieren und warten integrierte Lebenssicherheits-, Sicherheits- und Elektrosysteme unter einem akkreditierten Dach - und eliminieren so Übergaben, Verzögerungen und Schuldzuweisungen mehrerer Auftragnehmer.",
    "Founded and run by engineers. Accredited by UK's hardest auditors. Operating across the UK and continental Europe for commercial, public-sector and enterprise clients.": "Gegründet und geführt von Ingenieuren. Akkreditiert von den strengsten Prüfern Großbritanniens. Tätig in Großbritannien und Kontinentaleuropa für Kunden aus Wirtschaft, öffentlichem Sektor und Großunternehmen.",
    "Fire, security, electrical and automation - under one accredited roof, across the UK and Europe.": "Brandschutz, Sicherheit, Elektrik und Automatisierung - unter einem akkreditierten Dach, in Großbritannien und Europa.",
    "Nine disciplines, delivered by our own BAFE, NICEIC, SSAIB and ECA-certified engineers - from single-camera CCTV to multi-site fire detection and campus electrical installations.": "Neun Disziplinen, geliefert von unseren eigenen BAFE-, NICEIC-, SSAIB- und ECA-zertifizierten Ingenieuren - von Einzelkamera-CCTV bis hin zu Brandmeldeanlagen an mehreren Standorten und Campus-Elektroinstallationen.",
    "A sample of commercial, public and residential installations across the UK - delivered on schedule, on budget and signed off by the relevant authority.": "Eine Auswahl gewerblicher, öffentlicher und privater Installationen in ganz Großbritannien - pünktlich, im Budget und von der zuständigen Behörde abgenommen.",
    "Commercial clients and community partners describing what it's actually like to work with us.": "Geschäftskunden und Gemeinschaftspartner beschreiben, wie es tatsächlich ist, mit uns zu arbeiten.",
    "Every accreditation below is audited by an independent, UKAS-accredited body - covering our processes, our engineers, our paperwork and live jobs. It's how insurers, framework buyers and responsible persons know a VoltSecure certificate is worth the paper it's printed on.": "Jede der unten aufgeführten Akkreditierungen wird von einer unabhängigen, UKAS-akkreditierten Stelle geprüft - unsere Prozesse, Ingenieure, Unterlagen und laufenden Aufträge. So wissen Versicherer, Rahmenvertragspartner und Verantwortliche, dass ein VoltSecure-Zertifikat sein Papier wert ist.",
    "Independent certifications held directly by VoltSecure - required by insurers, frameworks and Responsible Persons.": "Unabhängige Zertifizierungen direkt von VoltSecure gehalten - erforderlich von Versicherern, Rahmenverträgen und Verantwortlichen.",
    "Understand what each certification covers and why it matters for your project.": "Verstehen Sie, was jede Zertifizierung abdeckt und warum sie für Ihr Projekt wichtig ist.",
    "We hold recognised third-party accreditations across fire, electrical and security disciplines - helping clients reduce risk, meet compliance requirements, and trust the quality of every project we deliver.": "Wir verfügen über anerkannte Drittakkreditierungen in den Bereichen Brandschutz, Elektrik und Sicherheit - und helfen Kunden, Risiken zu reduzieren, Compliance-Anforderungen zu erfüllen und der Qualität jedes Projekts zu vertrauen.",
    "The short version.": "Die kurze Version.",
    "Why VoltSecure": "Warum VoltSecure",
    "Four commitments": "Vier Verpflichtungen",
    "Cai": "Cai",
    "Founder & Managing Director.": "Gründer und Geschäftsführer.",
    "CTSP Certified": "CTSP-zertifiziert",
    "Certified Technical Security Professional": "Zertifizierter Technischer Sicherheitsexperte",
    "Founder Cai is CTSP-certified - the technical-security industry's individual professional standard.": "Gründer Cai ist CTSP-zertifiziert - der individuelle Berufsstandard der technischen Sicherheitsbranche.",
    "Our managing director holds the certification personally - the same person signing off your project owns the technical standard, not just the company badge.": "Unser Geschäftsführer hält die Zertifizierung persönlich - dieselbe Person, die Ihr Projekt abzeichnet, besitzt den technischen Standard, nicht nur das Firmenabzeichen.",
    "CTSP is the Certified Technical Security Professional standard - an individual-level credential demonstrating engineer-grade competence across electronic security disciplines.": "CTSP ist der Certified Technical Security Professional Standard - eine individuelle Qualifikation, die Ingenieurkompetenz in elektronischen Sicherheitsdisziplinen nachweist.",
    "CTSP-certified (Certified Technical Security Professional), with nineteen years' hands-on experience in the fire & security industry. Started as a South Wales apprentice in 2006; founded VoltSecure in 2021.": "CTSP-zertifiziert (Certified Technical Security Professional), mit neunzehn Jahren praktischer Erfahrung in der Brandschutz- und Sicherheitsbranche. Begann 2006 als Auszubildender in Südwales; gründete 2021 VoltSecure.",
    "We're an engineer-led company. Founded in 2021 by an apprentice who came up through the trade, scaled to a UK-and-Europe operation in five years, and still doing the work properly - to the standards that matter, with the certifications to back it up.": "Wir sind ein ingenieursgeführtes Unternehmen. Gegründet 2021 von einem Auszubildenden, der das Handwerk von Grund auf gelernt hat, in fünf Jahren zu einem Großbritannien- und Europa-Betrieb skaliert und immer noch die Arbeit richtig macht - nach den Standards, die zählen, mit den Zertifizierungen, die es belegen.",
    "The business started on the back end of the pandemic in 2021. Within its first years it had passed NICEIC, SSAIB and Constructionline audits - the hardest three to get through as a new business - and landed a national electrical contract on the strength of that paperwork. ECA and FSA memberships followed in 2023, and a BAFE SP203-1 certification covering all four modules of fire detection and alarm work.": "Das Unternehmen entstand am Ende der Pandemie 2021. Innerhalb der ersten Jahre bestand es die NICEIC-, SSAIB- und Constructionline-Audits - die drei härtesten für ein neues Unternehmen - und landete einen landesweiten Elektrovertrag auf der Stärke dieser Unterlagen. ECA- und FSA-Mitgliedschaften folgten 2023, ebenso wie eine BAFE SP203-1-Zertifizierung für alle vier Module der Brandmelde- und Alarmarbeiten.",
    "Today, staffing levels have more than doubled year on year. We run electrical and FESS apprenticeships, supply integrated security for a well-known high-street retailer across the UK and continental Europe, and have been shortlisted by The Great British Entrepreneur Awards (Start-Up Entrepreneur of the Year, Wales) and the FSM Awards 2026.": "Heute hat sich die Mitarbeiterzahl im Jahresvergleich mehr als verdoppelt. Wir betreiben Elektro- und FESS-Ausbildungen, liefern integrierte Sicherheit für einen bekannten Einzelhändler in Großbritannien und Kontinentaleuropa und wurden für die Great British Entrepreneur Awards (Start-Up Entrepreneur of the Year, Wales) und die FSM Awards 2026 nominiert.",
    "South Wales-born. UK and Europe-operating. Engineer-led from day one.": "In Südwales geboren. In Großbritannien und Europa tätig. Vom ersten Tag an ingenieursgeführt.",
    "From our Caerphilly HQ and Pontypridd Service Hub, VoltSecure supports commercial clients, public-sector sites and local authority projects across South Wales - including work throughout Caerphilly County Borough, Rhondda Cynon Taf and Cardiff City Council - while continuing to deliver UK-wide and European programmes for national clients.": "Von unserem Hauptsitz Caerphilly und unserem Service-Hub Pontypridd aus betreut VoltSecure Geschäftskunden, öffentliche Einrichtungen und kommunale Projekte in ganz Südwales - einschließlich Arbeiten in Caerphilly County Borough, Rhondda Cynon Taf und Cardiff City Council - und führt gleichzeitig landesweite und europäische Programme für nationale Kunden durch.",
    "VoltSecure now operates from": "VoltSecure ist nun tätig von",
    "VoltSecure was founded by": "VoltSecure wurde gegründet von",
    ", a CTSP-certified (Certified Technical Security Professional) engineer who started in the fire & security industry in 2006 as an apprentice in South Wales, and his business partner": ", einem CTSP-zertifizierten (Certified Technical Security Professional) Ingenieur, der 2006 als Auszubildender in Südwales in die Brandschutz- und Sicherheitsbranche einstieg, und seinem Geschäftspartner",
    ". Between them they brought nearly two decades of fire, security, biometric and cyber-security experience into one accredited company.": ". Zusammen brachten sie fast zwei Jahrzehnte Erfahrung in Brandschutz, Sicherheit, Biometrie und Cybersicherheit in ein akkreditiertes Unternehmen ein.",
    "- The VoltSecure Promise": "- Das VoltSecure-Versprechen",
    "The VoltSecure engineering team. South Wales depot.": "Das VoltSecure-Ingenieursteam. Depot in Südwales.",
    "Cai begins apprenticeship - South Wales": "Cai beginnt Ausbildung - Südwales",
    "Starts in the electrical / fire & security industry as an apprentice, gaining experience across major fire & security companies and a national biometric firm.": "Beginnt als Auszubildender in der Elektro- bzw. Brandschutz- und Sicherheitsbranche und sammelt Erfahrungen bei großen Brandschutz- und Sicherheitsunternehmen und einem nationalen Biometrieunternehmen.",
    "VoltSecure founded": "VoltSecure gegründet",
    "Formed with business partner Terry Jones. Chooses to \"hit the ground running\" on the back end of the pandemic.": "Gegründet mit Geschäftspartner Terry Jones. Entscheidet sich, am Ende der Pandemie sofort loszulegen.",
    "First major accreditations": "Erste wichtige Akkreditierungen",
    "Passes NICEIC, SSAIB and Constructionline within year one. Lands first large commercial electrical contract.": "Besteht im ersten Jahr NICEIC, SSAIB und Constructionline. Gewinnt den ersten großen kommerziellen Elektrovertrag.",
    "Cai founds VoltSecure with business partner Terry Jones - hitting the ground running on the back end of the pandemic.": "Cai gründet VoltSecure mit Geschäftspartner Terry Jones - mit Vollgas am Ende der Pandemie gestartet.",
    "ECA & FSA accreditations": "ECA- und FSA-Akkreditierungen",
    "Joins the Electrical Contractors' Association and the Fire & Security Association - among the most recognised electrical and life-safety memberships in the UK industry.": "Tritt der Electrical Contractors' Association und der Fire & Security Association bei - zu den anerkanntesten Mitgliedschaften für Elektrik und Lebenssicherheit in der britischen Branche.",
    "Engineer and premises growth": "Wachstum bei Ingenieuren und Standorten",
    "Engineer headcount expands as demand for integrated fire, security and electrical scopes accelerates. Additional premises secured to support fleet, stores and engineer training.": "Die Anzahl der Ingenieure wächst, da die Nachfrage nach integrierten Brandschutz-, Sicherheits- und Elektroarbeiten zunimmt. Zusätzliche Räumlichkeiten wurden gesichert, um Flotte, Lager und Ingenieur-Schulungen zu unterstützen.",
    "Caerphilly HQ & first major awards": "Hauptsitz Caerphilly und erste große Auszeichnungen",
    "Moves into the Caerphilly HQ at Unit A1 Ayjay House, Bedwas. Further engineer growth. Shortlisted for the Great British Entrepreneur Awards (Wales).": "Bezieht den Hauptsitz Caerphilly in Unit A1 Ayjay House, Bedwas. Weiteres Wachstum bei den Ingenieuren. Nominiert für die Great British Entrepreneur Awards (Wales).",
    "European delivery & platform launch": "Europäische Lieferung und Plattform-Start",
    "European delivery programmes scale across five countries for a national high-street retailer. Launches the in-house client portal for tickets, certificates and compliance records. Shortlisted for the FSM Awards 2026 and Caerphilly Business Club's Export Business of the Year.": "Europäische Lieferprogramme werden für einen nationalen Einzelhändler auf fünf Länder ausgeweitet. Startet das interne Kundenportal für Tickets, Zertifikate und Compliance-Unterlagen. Nominiert für die FSM Awards 2026 und Caerphilly Business Club's Export Business of the Year.",
    "ECA, FSA & JIB": "ECA, FSA und JIB",
    "Joins the ECA, the Fire & Security Association and the Joint Industry Board - among the most recognised electrical memberships in the industry.": "Tritt der ECA, der Fire & Security Association und dem Joint Industry Board bei - zu den anerkanntesten Elektromitgliedschaften der Branche.",
    "European expansion": "Europäische Expansion",
    "Rolls out CCTV installations across the UK and continental Europe for a well-known high-street retail brand.": "Führt CCTV-Installationen in Großbritannien und Kontinentaleuropa für eine bekannte Einzelhandelsmarke durch.",
    "BAFE SP203-1": "BAFE SP203-1",
    "Adds full BAFE SP203-1 certification - design, install, commission & maintain. Shortlisted for the Great British Entrepreneur Awards (Wales).": "Erhält die vollständige BAFE SP203-1-Zertifizierung - Planung, Installation, Inbetriebnahme und Wartung. Nominiert für die Great British Entrepreneur Awards (Wales).",
    "FSM Awards shortlist": "FSM Awards Nominierung",
    "Shortlisted for the Fire & Security Matters Awards 2026. Export Business of the Year finalist, Caerphilly Business Club.": "Nominiert für die Fire & Security Matters Awards 2026. Finalist Export Business of the Year, Caerphilly Business Club.",
    "Recognised by The Great British Entrepreneur Awards, shortlisted for the FSM Awards 2026, and a finalist for Caerphilly Business Club's Export Business of the Year.": "Anerkannt von den Great British Entrepreneur Awards, nominiert für die FSM Awards 2026 und Finalist beim Export Business of the Year des Caerphilly Business Club.",
    "Great British Entrepreneur Awards · Start-Up Entrepreneur of the Year (Wales)": "Great British Entrepreneur Awards · Start-Up Entrepreneur of the Year (Wales)",
    "FSM Awards 2026": "FSM Awards 2026",
    "FSM Awards": "FSM Awards",
    "Export Business Finalist": "Export Business Finalist",
    "Export Business of the Year · Caerphilly": "Export Business of the Year · Caerphilly",
    "GBEA 2025": "GBEA 2025",
    "SHORTLIST 2026": "NOMINIERUNGSLISTE 2026",
    "SHORTLISTED": "NOMINIERT",
    "Shortlisted - Fire & Security Matters industry recognition.": "Nominiert - Anerkennung der Brandschutz- und Sicherheitsbranche.",
    "Caerphilly Business Club - recognition for European-scale delivery.": "Caerphilly Business Club - Anerkennung für Lieferungen auf europäischer Ebene.",
    "Registered": "Registriert",
    "GUARANTEED WORK": "GARANTIERTE ARBEIT",
    "ECS · GRADED": "ECS · BENOTET",
    "SSIP · H&S VERIFIED": "SSIP · H&S VERIFIZIERT",
    "Certificated organisation": "Zertifizierte Organisation",
    "Full commercial installations: containment, switchgear, power distribution, DALI lighting, EV charging and test & inspection - designed and certified to BS 7671.": "Komplette gewerbliche Installationen: Kabeltrassen, Schaltanlagen, Stromverteilung, DALI-Beleuchtung, EV-Ladestationen sowie Prüfung und Inspektion - entworfen und zertifiziert nach BS 7671.",
    "Planned maintenance, compliance visits and reactive support for fire, security, CCTV, access control and electrical systems - delivered by the engineers who installed them.": "Geplante Wartung, Compliance-Besuche und reaktiver Support für Brandschutz-, Sicherheits-, CCTV-, Zutrittskontroll- und Elektrosysteme - durchgeführt von den Ingenieuren, die sie installiert haben.",
    "Planned maintenance, compliance visits and reactive support for fire, security, CCTV, access control and electrical systems - with a single portal for tickets, certificates and compliance records.": "Geplante Wartung, Compliance-Besuche und reaktiver Support für Brandschutz-, Sicherheits-, CCTV-, Zutrittskontroll- und Elektrosysteme - mit einem zentralen Portal für Tickets, Zertifikate und Compliance-Aufzeichnungen.",
    "Addressable fire detection, disabled refuge systems and aspirating detection - BAFE SP203-1 certified across design, installation, commissioning and maintenance.": "Adressierbare Brandmeldeanlagen, Notrufsysteme für Behinderte und Ansaugrauchmelder - BAFE SP203-1 zertifiziert für Planung, Installation, Inbetriebnahme und Wartung.",
    "IP, thermal and AI-analytics systems for national retail, logistics and public realm - engineered and maintained to the BS EN 62676 series.": "IP-, Wärmebild- und KI-Analyse-Systeme für nationalen Einzelhandel, Logistik und öffentlichen Raum - konstruiert und gewartet nach der BS EN 62676-Reihe.",
    "Grade 2 & Grade 3 intruder systems with URN-backed police response, compliant with PD 6662:2017 and BS 8243 confirmed signalling.": "Einbruchmeldesysteme Grad 2 und 3 mit URN-gestützter Polizeireaktion, konform mit PD 6662:2017 und BS 8243 bestätigter Signalisierung.",
    "Card, biometric and mobile-credential access, turnstile integration, visitor management and lift control - to BS EN 60839-11-1.": "Karten-, biometrischer und mobiler Zutritt, Drehkreuz-Integration, Besuchermanagement und Aufzugssteuerung - nach BS EN 60839-11-1.",
    "Structured cabling, fibre backbones, comms cabinets and network infrastructure - tested, certified and documented for handover.": "Strukturierte Verkabelung, Glasfaser-Backbones, Kommunikationsschränke und Netzwerkinfrastruktur - getestet, zertifiziert und für die Übergabe dokumentiert.",
    "Design, installation and maintenance for renewable energy systems - EV charging infrastructure, solar PV, battery storage and associated electrical works.": "Planung, Installation und Wartung erneuerbarer Energiesysteme - EV-Ladeinfrastruktur, Solar-PV, Batteriespeicher und zugehörige Elektroarbeiten.",
    "Gates, barriers, shutters and integrated BMS interfaces - commissioned alongside fire, access and intruder systems for unified control.": "Tore, Schranken, Rolltore und integrierte GLT-Schnittstellen - in Betrieb genommen zusammen mit Brandschutz-, Zutritts- und Einbruchmeldesystemen für einheitliche Steuerung.",
    "Very early warning smoke detection for data centres, heritage and high-value environments - designed to BS 6266 and integrated with the main fire panel.": "Brandfrüherkennung für Rechenzentren, Denkmäler und hochwertige Umgebungen - entworfen nach BS 6266 und in die Hauptbrandmeldezentrale integriert.",
    "Supporting facilities managers, commercial landlords and building operators with planned maintenance, reactive callouts, compliance works and small project delivery.": "Unterstützung von Facility Managern, gewerblichen Vermietern und Gebäudebetreibern mit geplanter Wartung, reaktiven Einsätzen, Compliance-Arbeiten und kleinen Projektlieferungen.",
    "Supporting FM clients, commercial landlords and building operators with planned maintenance, reactive callouts, compliance works and small project delivery across electrical, fire and security systems.": "Unterstützung von FM-Kunden, gewerblichen Vermietern und Gebäudebetreibern mit geplanter Wartung, reaktiven Einsätzen, Compliance-Arbeiten und kleinen Projektlieferungen in den Bereichen Elektrik, Brandschutz und Sicherheit.",
    "Planned Maintenance & Compliance": "Geplante Wartung und Compliance",
    "Facilities Management Support": "Facility Management Support",
    "24/7": "24/7",
    "SLA": "SLA",
    "BS 7671": "BS 7671",
    "Part P": "Part P",
    "BS 7671 · Part P": "BS 7671 · Part P",
    "BS 5839-1 · BS 5839-6": "BS 5839-1 · BS 5839-6",
    "PD 6662 · EN 62676 · EN 60839": "PD 6662 · EN 62676 · EN 60839",
    "PPM": "PPM",
    "EV": "EV",
    "KNX": "KNX",
    "AV": "AV",
    "EV charging": "EV-Laden",
    "AI-analytics": "KI-Analyse",
    "PD 6662": "PD 6662",
    "BS 8243": "BS 8243",
    "Holland & Barrett Treatment Rooms": "Holland & Barrett Behandlungsräume",
    "LongPlay Coffee": "LongPlay Coffee",
    "Islwyn Indoor Bowls Club": "Islwyn Indoor Bowls Club",
    "Llanbradach Bowls Club": "Llanbradach Bowls Club",
    "Lloyds Bank Refurbishment": "Lloyds Bank Sanierung",
    "Lloyds Bank Refurbishment Programme": "Lloyds Bank Sanierungsprogramm",
    "European Retail Security Rollout": "Europäisches Einzelhandels-Sicherheits-Rollout",
    "The Matchworks Building": "Das Matchworks-Gebäude",
    "DWP Assessment Centre, Swansea": "DWP Assessment Centre, Swansea",
    "Multi-Site Fire Alarm Refresh (example)": "Brandmeldeanlagen-Erneuerung an mehreren Standorten (Beispiel)",
    "Heritage Building Refurb (example)": "Sanierung Denkmalgebäude (Beispiel)",
    "Prime Central London Residence (example)": "Erstklassige Residenz in zentralem London (Beispiel)",
    "Private Law Firm Security (example)": "Sicherheit einer privaten Anwaltskanzlei (Beispiel)",
    "Tier 3 Data Centre VESDA (example)": "Tier 3 Rechenzentrum VESDA (Beispiel)",
    "LED Lighting Upgrade": "LED-Beleuchtungsausbau",
    "Full Electrical Installation": "Komplette Elektroinstallation",
    "Full Floor Electrical Refurb": "Etagenweite Elektrosanierung",
    "Commercial electrical install": "Gewerbliche Elektroinstallation",
    "Commercial offices": "Gewerbebüros",
    "Commercial projects": "Gewerbliche Projekte",
    "Commercial refurbishment": "Gewerbliche Sanierung",
    "Multi-Site CCTV Rollouts": "CCTV-Rollouts an mehreren Standorten",
    "Multi-site CCTV rollouts (HikVision / IP analytics) for a national high-street retailer. BS EN 62676 commissioning, structured cabling, data networking. Out-of-hours work supported with TOIL.": "CCTV-Rollouts an mehreren Standorten (HikVision / IP-Analyse) für einen nationalen Einzelhändler. BS EN 62676 Inbetriebnahme, strukturierte Verkabelung, Datenvernetzung. Arbeit außerhalb der Geschäftszeiten mit Freizeitausgleich.",
    "Filter by service below.": "Nach Service unten filtern.",
    "Fire alarm design & install": "Brandmeldeanlagen-Planung und -Installation",
    "Fire alarm, intruder system and fully integrated audio for an independent speciality-coffee roaster - commissioned without interrupting weekday trading.": "Brandmelde-, Einbruchmelde- und vollintegrierte Audiosysteme für einen unabhängigen Spezialitätenkaffeeröster - in Betrieb genommen, ohne den Wochentagsbetrieb zu unterbrechen.",
    "Fire alarm": "Brandmeldeanlage",
    "Fire detection & alarm equipment.": "Brandmelde- und Alarmgeräte.",
    "Fire detection systems": "Brandmeldesysteme",
    "Fire detection & alarm systems - design, install, commission & maintain.": "Brandmelde- und Alarmsysteme - Planung, Installation, Inbetriebnahme und Wartung.",
    "CCTV systems": "CCTV-Systeme",
    "Electrical contracting": "Elektroinstallation",
    "Electrical installation": "Elektroinstallation",
    "Electrotechnical work": "Elektrotechnische Arbeiten",
    "Electrical maintenance": "Elektrische Wartung",
    "Electrical wholesale.": "Elektrogroßhandel.",
    "Pre-qualification for the UK construction industry.": "Präqualifikation für die britische Bauindustrie.",
    "Approved contractor for electrical installation and testing.": "Zugelassener Auftragnehmer für Elektroinstallation und -prüfung.",
    "Approved for design, installation and maintenance of electronic security systems.": "Zugelassen für Planung, Installation und Wartung elektronischer Sicherheitssysteme.",
    "Third-party certified for fire protection services.": "Drittzertifiziert für Brandschutzdienstleistungen.",
    "Electrical Contractors' Association membership.": "Mitgliedschaft im Electrical Contractors' Association.",
    "Manufacturer authorisations and engineer-level certifications.": "Herstellerautorisierungen und Ingenieur-Zertifizierungen.",
    "Manufacturer authorisations or relevant trade registrations - e.g. NICEIC, JIB, FIA, BAFE.": "Herstellerautorisierungen oder relevante Berufsregistrierungen - z. B. NICEIC, JIB, FIA, BAFE.",
    "CCTV vendor partner": "CCTV-Lieferantenpartner",
    "Access control vendor partner": "Zutrittskontrolle-Lieferantenpartner",
    "Vendor & training partners": "Hersteller- und Schulungspartner",
    "NICEIC (National Inspection Council for Electrical Installation Contracting) is the UK's leading voluntary regulatory body for the electrical contracting industry. Approved Contractors are assessed against the current edition of BS 7671.": "NICEIC (National Inspection Council for Electrical Installation Contracting) ist die führende freiwillige Aufsichtsbehörde Großbritanniens für die Elektroinstallationsbranche. Zugelassene Auftragnehmer werden anhand der aktuellen Ausgabe von BS 7671 bewertet.",
    "BAFE (British Approvals for Fire Equipment) is the independent register of quality fire safety service providers in the UK. BAFE-registered companies are assessed by UKAS-accredited certification bodies.": "BAFE (British Approvals for Fire Equipment) ist das unabhängige Register der qualitativ hochwertigen Brandschutz-Dienstleister in Großbritannien. BAFE-registrierte Unternehmen werden von UKAS-akkreditierten Zertifizierungsstellen geprüft.",
    "SSAIB is a leading certification body for organisations providing security systems, fire detection and alarm systems, and telecare services. SSAIB is a UKAS-accredited certification body.": "SSAIB ist eine führende Zertifizierungsstelle für Organisationen, die Sicherheitssysteme, Brandmelde- und Alarmsysteme sowie Telecare-Dienste anbieten. SSAIB ist eine UKAS-akkreditierte Zertifizierungsstelle.",
    "The ECA (Electrical Contractors' Association) is the UK's leading trade association for electrical, electrotechnical and energy services companies. Membership demonstrates technical competence and financial stability.": "Die ECA (Electrical Contractors' Association) ist der führende britische Branchenverband für Elektro-, elektrotechnische und Energiedienstleistungsunternehmen. Die Mitgliedschaft belegt technische Kompetenz und finanzielle Stabilität.",
    "Constructionline is the UK's largest procurement and supply-chain management service. Our membership includes PAS 91 pre-qualification and ongoing assessment of management systems.": "Constructionline ist der größte britische Beschaffungs- und Lieferketten-Verwaltungsdienst. Unsere Mitgliedschaft umfasst die PAS 91-Präqualifikation und die laufende Bewertung von Managementsystemen.",
    "The FCA is the UK regulator for financial services firms. VoltSecure is registered with the FCA where required for our operations - reflecting an additional layer of corporate compliance and oversight.": "Die FCA ist die britische Aufsichtsbehörde für Finanzdienstleister. VoltSecure ist bei der FCA registriert, wo dies für unseren Betrieb erforderlich ist - was eine zusätzliche Ebene der Unternehmens-Compliance und Aufsicht widerspiegelt.",
    "FCA registration adds an additional check on VoltSecure's company governance and gives commercial clients added confidence in working with us.": "Die FCA-Registrierung fügt eine zusätzliche Kontrolle der Unternehmensführung von VoltSecure hinzu und gibt Geschäftskunden zusätzliches Vertrauen in die Zusammenarbeit mit uns.",
    "HikVision is one of the world's leading manufacturers of IP CCTV, VMS and analytics platforms. As a Registered Installer, our engineers are kept current on the latest hardware ranges and commissioning procedures.": "HikVision ist einer der weltweit führenden Hersteller von IP-CCTV-, VMS- und Analyseplattformen. Als Registered Installer halten wir unsere Ingenieure auf dem neuesten Stand der Hardware-Reihen und Inbetriebnahmeverfahren.",
    "Paxton is a UK-designed and -manufactured access control range, widely used across commercial and public-sector estates. As a Registered Installer, our engineers are trained on the current product set, including Net2 and Paxton10.": "Paxton ist eine in Großbritannien entworfene und hergestellte Zutrittskontrolle, die in gewerblichen und öffentlichen Bereichen weit verbreitet ist. Als Registered Installer sind unsere Ingenieure auf die aktuelle Produktpalette, einschließlich Net2 und Paxton10, geschult.",
    "VoltSecure is a HikVision Registered Installer.": "VoltSecure ist ein registrierter HikVision-Installateur.",
    "VoltSecure is a Paxton Registered Installer.": "VoltSecure ist ein registrierter Paxton-Installateur.",
    "VoltSecure can specify, install and maintain Paxton systems with manufacturer-backed support, designed and commissioned by trained engineers.": "VoltSecure kann Paxton-Systeme mit herstellergestütztem Support spezifizieren, installieren und warten, entworfen und in Betrieb genommen von geschulten Ingenieuren.",
    "Clients get installations sized and configured by trained engineers, with manufacturer-backed support and access to the full HikVision product range when scoping new and replacement projects.": "Kunden erhalten Installationen, die von geschulten Ingenieuren dimensioniert und konfiguriert werden, mit herstellergestütztem Support und Zugriff auf die gesamte HikVision-Produktpalette bei der Planung neuer und Ersatzprojekte.",
    "Adherence to our": "Einhaltung unserer",
    ", fair labour practices and any client-specific framework requirements.": ", faire Arbeitspraktiken und alle kundenspezifischen Rahmenanforderungen.",
    "Becoming a supplier - the process": "Lieferant werden - der Prozess",
    "Information for material suppliers, manufacturer partners and specialist subcontractors": "Informationen für Materiallieferanten, Herstellerpartner und Spezialsubunternehmer",
    "Our installations are only as good as the kit, materials and specialist trades that go into them. We work with a small, stable supply chain - we'd rather pay fairly and pay on time than chase the cheapest quote and create rework downstream.": "Unsere Installationen sind nur so gut wie die Geräte, Materialien und Spezialgewerke, die darin verbaut sind. Wir arbeiten mit einer kleinen, stabilen Lieferkette - wir zahlen lieber fair und pünktlich, als das billigste Angebot zu jagen und im Nachhinein Nacharbeiten zu verursachen.",
    "How we work with our supply chain.": "Wie wir mit unserer Lieferkette arbeiten.",
    "Send a short introduction and your accreditations to start the pre-qual process.": "Senden Sie eine kurze Vorstellung und Ihre Akkreditierungen, um den Präqualifikationsprozess zu starten.",
    "We'll send a short pre-qualification pack - insurances, accreditations, key policies, two trade references.": "Wir senden Ihnen ein kurzes Präqualifikationspaket - Versicherungen, Akkreditierungen, wichtige Richtlinien, zwei Handelsreferenzen.",
    "Once approved, we set you up on our system, agree payment terms and add you to the active panel for relevant work packages.": "Nach Genehmigung richten wir Sie in unserem System ein, vereinbaren Zahlungsbedingungen und nehmen Sie in das aktive Gremium für relevante Arbeitspakete auf.",
    "We re-check insurances and accreditations annually, plus an open conversation on what's working and what isn't.": "Wir prüfen Versicherungen und Akkreditierungen jährlich neu, plus ein offenes Gespräch darüber, was funktioniert und was nicht.",
    "A brief introduction of your business, accreditations and the products / trades you'd like to supply.": "Eine kurze Vorstellung Ihres Unternehmens, Ihrer Akkreditierungen und der Produkte/Gewerke, die Sie liefern möchten.",
    "Pre-qual pack": "Präqualifikationspaket",
    "Confirmation that your supply chain is reviewed against the Modern Slavery Act 2015.": "Bestätigung, dass Ihre Lieferkette gegen das Modern Slavery Act 2015 geprüft wird.",
    "Compliance with the relevant British / European Standard for the discipline (BS 7671, BS 5839, BS EN 62676, PD 6662, BS EN 60839 etc.).": "Einhaltung der einschlägigen britischen/europäischen Norm für die Disziplin (BS 7671, BS 5839, BS EN 62676, PD 6662, BS EN 60839 usw.).",
    "Public & Employers' Liability cover at the limits required by the framework or end-client.": "Betriebs- und Arbeitgeberhaftpflichtversicherung in der vom Rahmen oder Endkunden geforderten Höhe.",
    "O&M-grade paperwork, batch & serial traceability, RAMS supplied before mobilisation.": "Betriebs- und Wartungs-Unterlagen, Chargen- und Seriennummern-Rückverfolgbarkeit, RAMS vor Mobilisierung bereitgestellt.",
    "Sites are left as we found them or better; documentation is uploaded the same day, not at month-end.": "Baustellen werden so verlassen, wie wir sie vorgefunden haben oder besser; die Dokumentation wird am selben Tag hochgeladen, nicht am Monatsende.",
    "Drawings, specifications and method statements supplied before you quote, not after.": "Zeichnungen, Spezifikationen und Methodenbeschreibungen vor dem Angebot, nicht danach.",
    "A named project coordinator handles every order so you're not chasing different people.": "Ein benannter Projektkoordinator bearbeitet jede Bestellung, sodass Sie nicht verschiedene Personen verfolgen müssen.",
    "30 days end-of-month as standard. Faster terms negotiable for SMEs and apprenticeship-led suppliers. We are signatories of the Prompt Payment Code in spirit and reviewing formal sign-up.": "30 Tage zum Monatsende als Standard. Schnellere Konditionen verhandelbar für KMU und auf Ausbildung ausgerichtete Lieferanten. Wir unterzeichnen den Prompt Payment Code im Geist und prüfen die formelle Anmeldung.",
    "We don't beat suppliers down on margin - we'd rather have stable partners.": "Wir drücken Lieferanten nicht in der Marge - wir haben lieber stabile Partner.",
    ". Invoices without a valid PO will be held for query.": ". Rechnungen ohne gültige Bestellnummer werden zur Klärung zurückgehalten.",
    "Invoices should reference the purchase order number issued by VoltSecure and be sent to": "Rechnungen sollten die von VoltSecure ausgestellte Bestellnummer referenzieren und gesendet werden an",
    "Specialist subcontract trades.": "Spezialisierte Subunternehmer-Gewerke.",
    "Civils, builders work, structured cabling, scaffold & access where the scope sits outside our in-house disciplines.": "Tiefbau, Maurerarbeiten, strukturierte Verkabelung, Gerüst- und Zugangsbau, wo der Umfang außerhalb unserer hauseigenen Disziplinen liegt.",
    "Specialist VESDA / Aspirating Smoke Detection product and consumables.": "Spezialisierte VESDA-/Ansaugrauchmelder-Produkte und Verbrauchsmaterialien.",
    "HikVision, Paxton, Texecom, Honeywell, Avigilon - and accredited distribution partners.": "HikVision, Paxton, Texecom, Honeywell, Avigilon - und akkreditierte Vertriebspartner.",
    "Advanced, Hochiki, Apollo, Hyfire and similar BS 5839-compliant manufacturers.": "Advanced, Hochiki, Apollo, Hyfire und ähnliche BS 5839-konforme Hersteller.",
    "Cable, containment, accessories and switchgear from established UK wholesalers.": "Kabel, Kabeltrassen, Zubehör und Schaltanlagen von etablierten britischen Großhändlern.",
    "Willingness to align with our carbon-reduction plan over time - UK-first sourcing, EV-friendly logistics.": "Bereitschaft, sich im Laufe der Zeit an unserem Klimaschutzplan zu orientieren - britische Beschaffung zuerst, EV-freundliche Logistik.",
    "Ready to register?": "Bereit zur Registrierung?",
    "Final supplier code, payment terms and registration form to be confirmed by Cai before launch. Send updates or questions to": "Endgültiger Lieferantencode, Zahlungsbedingungen und Registrierungsformular sind vor dem Start von Cai zu bestätigen. Senden Sie Aktualisierungen oder Fragen an",
    "Listings below are placeholders pending confirmation by Cai. To register interest in a role not listed, send your CV to": "Die folgenden Einträge sind Platzhalter, die noch von Cai bestätigt werden müssen. Um Interesse an einer nicht aufgeführten Stelle zu bekunden, senden Sie Ihren Lebenslauf an",
    "Placeholder content for the employee hub. Final benefits, links and contacts to be confirmed by Cai before launch. Send updates to": "Platzhalterinhalt für den Mitarbeiterbereich. Endgültige Leistungen, Links und Kontakte sind vor dem Start von Cai zu bestätigen. Senden Sie Aktualisierungen an",
    "Send your CV and a short note about which role to": "Senden Sie Ihren Lebenslauf und eine kurze Notiz zu welcher Rolle an",
    "Don't see the right role?": "Sehen Sie nicht die passende Stelle?",
    "We're growing - the next opening might not be advertised yet. Send your CV and we'll keep it on file.": "Wir wachsen - die nächste Stelle ist vielleicht noch nicht ausgeschrieben. Senden Sie Ihren Lebenslauf, und wir behalten ihn in unseren Unterlagen.",
    "Apprentice → engineer → senior engineer → project manager. We're growing - the headroom is genuine, not a slogan.": "Auszubildender → Ingenieur → Senior Ingenieur → Projektmanager. Wir wachsen - der Spielraum ist echt, kein Slogan.",
    "Apprentices learn from engineers, engineers learn from each other. Mentoring is part of the job, not a side task.": "Auszubildende lernen von Ingenieuren, Ingenieure lernen voneinander. Mentoring ist Teil des Jobs, keine Nebenaufgabe.",
    "JIB-graded pay scale.": "JIB-bewertete Vergütungsskala.",
    "JIB-graded pay.": "JIB-bewertete Vergütung.",
    "Every role mapped to the Joint Industry Board grade for fair, transparent rates.": "Jede Rolle ist dem Joint Industry Board-Grad zugeordnet für faire, transparente Vergütungen.",
    "Transparent rates aligned to the Joint Industry Board scale.": "Transparente Vergütungen entsprechend der Joint Industry Board-Skala.",
    "Wales & the West": "Wales und der Westen",
    "Multi-site retail CCTV across the UK and four EU countries - every store commissioned to BS EN 62676 with a clean paper trail. Their out-of-hours mobilisation meant zero trading disruption. Genuinely rare to find this quality at this scale.": "CCTV im Einzelhandel an mehreren Standorten in Großbritannien und vier EU-Ländern - jeder Laden nach BS EN 62676 in Betrieb genommen mit sauberer Aktenlage. Ihre Mobilisierung außerhalb der Geschäftszeiten bedeutete null Handelsstörungen. Wirklich selten, diese Qualität in diesem Umfang zu finden.",
    "VoltSecure has truly set the bar high in the security industry. Their pricing is fair, reliability evident, and deadlines consistently exceeded. They handled our full electrical fit-out and have managed everything since - a company you can trust for all your security and electrical needs.": "VoltSecure hat in der Sicherheitsbranche wirklich die Messlatte hoch gelegt. Ihre Preise sind fair, ihre Zuverlässigkeit ist offensichtlich, und Termine werden konsequent übertroffen. Sie haben unseren kompletten Elektroausbau übernommen und seitdem alles verwaltet - ein Unternehmen, dem Sie für alle Sicherheits- und Elektrobedürfnisse vertrauen können.",
    "Professional from first enquiry to final sign-off. Their BAFE SP203-1 commissioning documentation is the best we've seen from a sub-contractor - we re-tendered our framework partners and VoltSecure went straight to the top of the list.": "Professionell vom ersten Kontakt bis zur endgültigen Abnahme. Ihre BAFE SP203-1-Inbetriebnahmedokumentation ist die beste, die wir je von einem Subunternehmer gesehen haben - wir haben unsere Rahmenpartner neu ausgeschrieben und VoltSecure landete direkt an der Spitze der Liste.",
    "A rare thing: a fire & security contractor who actually engages with the design early, catches issues before first fix, and hands over a paper pack that satisfies our insurers first time. We now use them as a framework partner.": "Eine Seltenheit: ein Brandschutz- und Sicherheitsunternehmen, das sich frühzeitig in die Planung einbringt, Probleme vor dem ersten Einsatz erkennt und ein Aktenpaket übergibt, das unsere Versicherer beim ersten Mal zufriedenstellt. Wir nutzen sie jetzt als Rahmenpartner.",
    "VoltSecure were our single electrical contractor on a 48-unit modular scheme - communal first and second fix, inspection & test of every apartment, external and street lighting, and EV charging. Handed over on programme with a full compliance pack.": "VoltSecure war unser alleiniger Elektrounternehmer für ein 48-Wohneinheiten-Modulprojekt - Erst- und Zweitmontage im Gemeinschaftsbereich, Prüfung aller Wohnungen, Außen- und Straßenbeleuchtung sowie Ladeinfrastruktur. Termin- und compliance-gerecht übergeben.",
    "Cai at VoltSecure replied immediately with enthusiasm and genuine interest in helping. Their director committed fully - staying in contact, even designing the kit himself. A great example of community engagement and dedication, on top of owning an outstanding electrical company.": "Cai von VoltSecure antwortete sofort mit Begeisterung und echtem Interesse zu helfen. Ihr Direktor engagierte sich voll - blieb in Kontakt und entwarf sogar das Kit selbst. Ein großartiges Beispiel für Gemeinschaftsengagement und Hingabe, zusätzlich zum Besitz eines herausragenden Elektrounternehmens.",
    "Volt Secure has recently stepped into our local community spotlight by sponsoring the youth football club, Cwmaman FC under-15s. Cai committed himself fully, always staying in contact, even designing the kit himself. A great example of community engagement, sponsorship and youth development.": "Volt Secure ist kürzlich in unser lokales Gemeinschaftsrampenlicht getreten, indem sie den Jugendfußballclub Cwmaman FC U15 sponsern. Cai engagierte sich voll, blieb stets in Kontakt und entwarf sogar das Kit selbst. Ein großartiges Beispiel für Gemeinschaftsengagement, Sponsoring und Jugendförderung.",
    "VoltSecure's support over two years has been nothing short of fantastic - kits, medals for our summer tournament, and appearance support from an ex-Wales Women's player. They've played an important role in helping us provide for our players and community.": "VoltSecures Unterstützung über zwei Jahre war nichts weniger als fantastisch - Trikots, Medaillen für unser Sommerturnier und Auftrittsunterstützung von einer ehemaligen Wales-Frauen-Spielerin. Sie haben eine wichtige Rolle dabei gespielt, uns bei der Versorgung unserer Spieler und Gemeinschaft zu helfen.",
    "\"Our accreditations and memberships are not simply badges for a website - they underpin everything we do. They shape how we design, install and maintain systems, how we train our people, and how we give clients confidence that compliance and quality are guaranteed.\"": "\"Unsere Akkreditierungen und Mitgliedschaften sind nicht nur Abzeichen für eine Website - sie liegen allem zugrunde, was wir tun. Sie prägen, wie wir Systeme planen, installieren und warten, wie wir unsere Mitarbeiter schulen und wie wir Kunden die Gewissheit geben, dass Compliance und Qualität garantiert sind.\"",
    "Tell us a bit about the site, the scope or the timeline and we'll come back within one working day. If it's a live issue on an existing maintenance contract, please call the number below - we prioritise those.": "Erzählen Sie uns etwas über den Standort, den Umfang oder den Zeitplan, und wir melden uns innerhalb eines Werktages. Wenn es sich um ein aktuelles Problem in einem bestehenden Wartungsvertrag handelt, rufen Sie bitte die untenstehende Nummer an - wir priorisieren diese.",
    "We handle bespoke, multi-discipline scopes every week. Tell us the site and the brief - we'll come back within one working day.": "Wir bearbeiten jede Woche maßgeschneiderte, mehrere Disziplinen umfassende Projekte. Erzählen Sie uns den Standort und den Auftrag - wir melden uns innerhalb eines Werktages.",
    "Tell us the site, the scope and the timeline - we'll come back within one working day.": "Erzählen Sie uns den Standort, den Umfang und den Zeitplan - wir melden uns innerhalb eines Werktages.",
    "From fire and security to electrical and commercial maintenance - VoltSecure delivers work backed by recognised industry standards.": "Von Brandschutz und Sicherheit bis hin zu Elektrik und gewerblicher Wartung - VoltSecure liefert Arbeit, die von anerkannten Branchenstandards gestützt wird.",
    "Quick contacts": "Schnellkontakte",
    "Useful links": "Nützliche Links",
    "If something isn't covered here, ring the office on": "Wenn etwas hier nicht abgedeckt ist, rufen Sie das Büro an unter",
    " or email": " oder per E-Mail",
    ". We'd rather you ask early than carry the question around all week.": ". Wir möchten lieber, dass Sie früh fragen, als die Frage die ganze Woche mit sich herumzutragen.",
    ". We read every application and reply within five working days. No agencies, please.": ". Wir lesen jede Bewerbung und antworten innerhalb von fünf Werktagen. Bitte keine Personalvermittlungen.",
    "Whether you're spec'ing a new fit-out, tendering a framework or replacing an ageing system, we're happy to sit down with your design team and work the detail out properly - before the walls go up.": "Egal, ob Sie einen Neuausbau spezifizieren, einen Rahmenvertrag ausschreiben oder ein alterndes System ersetzen - wir setzen uns gerne mit Ihrem Designteam zusammen und arbeiten die Details richtig aus - bevor die Wände stehen.",
    "Whether you're a first-week apprentice or a senior engineer, this page brings together the things you need most often - certifications, benefits, training and who to ask when something comes up.": "Ob Sie ein Auszubildender in der ersten Woche oder ein Senior Ingenieur sind, diese Seite bringt die Dinge zusammen, die Sie am häufigsten brauchen - Zertifizierungen, Leistungen, Schulungen und an wen Sie sich wenden können, wenn etwas auftaucht.",
    "About VoltSecure": "Über VoltSecure",
    "Our services - fire, security & electrical": "Unsere Leistungen - Brandschutz, Sicherheit und Elektrik",
    "Accreditations & memberships": "Akkreditierungen und Mitgliedschaften",
    "JIB Registered": "JIB-registriert",
    "NICEIC Approved": "NICEIC-zugelassen",
    "SSAIB Certificated": "SSAIB-zertifiziert",
    "ECA & FSA Member": "ECA- und FSA-Mitglied",
    "Backed by the ECA Guarantee of Work for rectification assurance.": "Gestützt durch die ECA-Arbeitsgarantie für die Mängelbeseitigung.",
    "UK's leading electrical certification body. Platinum Promise backed.": "Führende britische Zertifizierungsstelle für Elektrik. Mit Platinum-Promise abgesichert.",
    "Intruder, CCTV & access control - UKAS-accredited, police URN eligible.": "Einbruchmelde-, CCTV- und Zutrittskontrolle - UKAS-akkreditiert, polizeiliche URN-berechtigt.",
    "Intruder, CCTV & access control.": "Einbruchmelde-, CCTV- und Zutrittskontrolle.",
    "ECS-carded workforce, graded to national electrotechnical standards.": "ECS-zertifizierte Belegschaft, bewertet nach nationalen elektrotechnischen Standards.",
    "Pre-vetted for finances, insurance, references & SSIP health & safety.": "Vorab geprüft für Finanzen, Versicherung, Referenzen und SSIP-Gesundheit und Sicherheit.",
    "Simplifies your procurement process - Constructionline membership confirms VoltSecure meets the standards required for public and private-sector contracts.": "Vereinfacht Ihren Beschaffungsprozess - die Constructionline-Mitgliedschaft bestätigt, dass VoltSecure die Standards für öffentliche und private Verträge erfüllt.",
    "Guarantees that your fire alarm and detection systems are designed, installed and maintained by a company meeting the highest fire-safety standards. Essential for insurance compliance and regulatory sign-off.": "Garantiert, dass Ihre Brandmelde- und Erkennungsanlagen von einem Unternehmen entworfen, installiert und gewartet werden, das die höchsten Brandschutzstandards erfüllt. Wesentlich für die Versicherungs-Compliance und regulatorische Abnahme.",
    "Your electrical installations are carried out by qualified engineers who are regularly reassessed. All work is covered by NICEIC's complaints process and insurance-backed guarantee.": "Ihre Elektroinstallationen werden von qualifizierten Ingenieuren durchgeführt, die regelmäßig neu bewertet werden. Alle Arbeiten sind durch das NICEIC-Beschwerdeverfahren und eine versicherungsgestützte Garantie abgedeckt.",
    "Assurance that security and fire systems are designed, installed, commissioned and maintained to the relevant European and British Standards. Required by many insurers and local authorities.": "Gewissheit, dass Sicherheits- und Brandschutzsysteme nach den relevanten europäischen und britischen Normen entworfen, installiert, in Betrieb genommen und gewartet werden. Erforderlich von vielen Versicherern und Behörden.",
    "ECA members are regularly assessed and must demonstrate ongoing competence. ECA membership also provides access to dispute resolution and an insurance-backed warranty scheme.": "ECA-Mitglieder werden regelmäßig bewertet und müssen fortlaufende Kompetenz nachweisen. Die ECA-Mitgliedschaft bietet auch Zugang zu Streitbeilegung und einem versicherungsgestützten Garantiesystem.",
    "Every project delivered against the relevant British or European Standard - BS 7671, BS 5839, BS EN 62676, PD 6662, BS EN 60839. No shortcuts, no exceptions.": "Jedes Projekt wird gegen die relevante britische oder europäische Norm geliefert - BS 7671, BS 5839, BS EN 62676, PD 6662, BS EN 60839. Keine Abkürzungen, keine Ausnahmen.",
    "Every job delivered to the relevant British / European Standard, every certificate signed off properly.": "Jeder Auftrag wird nach der relevanten britischen/europäischen Norm geliefert, jedes Zertifikat ordnungsgemäß unterzeichnet.",
    "Every project is delivered by competent engineers working under VoltSecure's audited company accreditations, procedures and quality systems.": "Jedes Projekt wird von kompetenten Ingenieuren geliefert, die unter VoltSecures geprüften Firmenakkreditierungen, Verfahren und Qualitätssystemen arbeiten.",
    "One contractor.": "Ein Auftragnehmer.",
    "One point of contact.": "Ein Ansprechpartner.",
    "Independent UKAS-accredited bodies audit our technical work, our documentation and our live jobs on an ongoing surveillance basis. Our certificates mean something.": "Unabhängige UKAS-akkreditierte Stellen prüfen unsere technische Arbeit, unsere Dokumentation und unsere laufenden Aufträge auf einer fortlaufenden Überwachungsbasis. Unsere Zertifikate haben Bedeutung.",
    "Health, safety & site": "Gesundheit, Sicherheit und Baustelle",
    "Regulated operations": "Regulierte Tätigkeiten",
    "Manufacturer training (HikVision, Paxton, Texecom, Advanced, etc.) - booked through your project manager": "Herstellerschulungen (HikVision, Paxton, Texecom, Advanced usw.) - gebucht über Ihren Projektmanager",
    "HikVision, Paxton, Texecom, Advanced and more - paid for by the company, sat for in working hours.": "HikVision, Paxton, Texecom, Advanced und mehr - vom Unternehmen bezahlt, in Arbeitszeit absolviert.",
    "Training & certifications": "Schulungen und Zertifizierungen",
    "VoltSecure is registered for funded apprenticeships in electrical installation and FESS (Fire, Emergency & Security Systems). All engineers hold or are working toward the certifications below:": "VoltSecure ist für finanzierte Ausbildungen in Elektroinstallation und FESS (Fire, Emergency & Security Systems) registriert. Alle Ingenieure besitzen die folgenden Zertifizierungen oder arbeiten daran:",
    "ECS Gold or relevant grade card": "ECS Gold oder relevante Bewertungskarte",
    "BS 7671 (18th Edition) qualification, where applicable": "BS 7671 (18. Auflage) Qualifikation, wo zutreffend",
    "BAFE SP203-1 modules for fire-system roles": "BAFE SP203-1-Module für Brandschutzsystem-Rollen",
    "BAFE SP203-1 (all modules)": "BAFE SP203-1 (alle Module)",
    "FIA / Skills for Security CPD on rolling cycle": "FIA / Skills for Security CPD im rollierenden Zyklus",
    "Renewal reminders go out automatically 90 days before any certification expires. Don't wait for the email - flag it to the office as soon as you know.": "Erinnerungen zur Erneuerung werden automatisch 90 Tage vor Ablauf einer Zertifizierung verschickt. Warten Sie nicht auf die E-Mail - melden Sie es dem Büro, sobald Sie es wissen.",
    "A two-week induction with a senior engineer mentor before you're issued your van and tools.": "Eine zweiwöchige Einarbeitung mit einem Senior-Ingenieur als Mentor, bevor Sie Ihren Lieferwagen und Werkzeuge erhalten.",
    "An informal phone call with a member of the team to talk through experience and what you're after.": "Ein informelles Telefonat mit einem Teammitglied, um Erfahrung und Wünsche zu besprechen.",
    "A site or office visit so you can see how we operate - and ask anything we haven't covered.": "Ein Standort- oder Büro-Besuch, damit Sie sehen können, wie wir arbeiten - und alles fragen können, was wir nicht abgedeckt haben.",
    "A formal offer including grade, pay, holiday and pension.": "Ein formelles Angebot einschließlich Stufe, Gehalt, Urlaub und Rente.",
    "Employer contribution from day one - rate confirmed in your offer letter.": "Arbeitgeberbeitrag ab dem ersten Tag - Satz im Angebotsschreiben bestätigt.",
    "Confirmed in your offer.": "Im Angebot bestätigt.",
    "Company sick-pay scheme above SSP, subject to length of service.": "Krankengeldsystem über dem gesetzlichen SSP, abhängig von der Betriebszugehörigkeit.",
    "Company-issued PPE, branded workwear and full personal tool kit. Replacements through your project manager.": "Firmen-PSA, gebrandete Arbeitskleidung und vollständiges persönliches Werkzeugset. Ersatz über Ihren Projektmanager.",
    "Marked company vans for engineers; EV transition in progress where charging makes operational sense.": "Beschriftete Firmenfahrzeuge für Ingenieure; EV-Umstieg im Gange, wo Laden betrieblich sinnvoll ist.",
    "Marked company vans, EV transition under way, full tool kit issued.": "Beschriftete Firmenfahrzeuge, EV-Umstieg im Gange, vollständiges Werkzeugset ausgegeben.",
    "Confidential employee assistance line - mental health, financial advice, family support.": "Vertrauliche Mitarbeiter-Hotline - psychische Gesundheit, Finanzberatung, Familienunterstützung.",
    "Statutory minimum plus extra service-based days - see your contract.": "Gesetzliches Minimum plus zusätzliche dienstbasierte Tage - siehe Ihren Vertrag.",
    "We hire on the basis of skill, attitude and fit - nothing else. VoltSecure is committed to providing an inclusive workplace and welcomes applications from underrepresented groups in the trades. Our recruitment, pay and progression decisions are reviewed against this commitment annually.": "Wir stellen auf Basis von Fähigkeiten, Einstellung und Passung ein - nichts anderes. VoltSecure verpflichtet sich, einen inklusiven Arbeitsplatz zu bieten und begrüßt Bewerbungen von unterrepräsentierten Gruppen im Handwerk. Unsere Rekrutierungs-, Vergütungs- und Aufstiegsentscheidungen werden jährlich gegen diese Verpflichtung geprüft.",
    "JIB-graded workforce, ECS-carded operatives, funded apprenticeships and structured CPD. Fair pay, welfare benefits and pension cover as the baseline.": "JIB-bewertete Belegschaft, ECS-zertifizierte Mitarbeiter, finanzierte Ausbildungen und strukturierte CPD. Faire Vergütung, Sozialleistungen und Rentenversicherung als Basis.",
    "JIB-graded · ECS-carded · Funded apprenticeships · South Wales-based, UK-deploying": "JIB-bewertet · ECS-zertifiziert · Finanzierte Ausbildungen · In Südwales ansässig, in Großbritannien tätig",
    "If you want to learn fire and security from the people designing and commissioning the systems - rather than reselling someone else's - this is the place.": "Wenn Sie Brandschutz und Sicherheit von den Leuten lernen möchten, die die Systeme entwerfen und in Betrieb nehmen - statt sie nur weiterzuverkaufen - sind Sie hier richtig.",
    "If you're delivering on a VoltSecure project you carry our standards onto the site. That means:": "Wenn Sie an einem VoltSecure-Projekt arbeiten, tragen Sie unsere Standards auf die Baustelle. Das bedeutet:",
    "If something on site looks wrong, off-spec, or unsafe - stop work and call your PM. We'd rather lose an hour than create a defect.": "Wenn auf der Baustelle etwas falsch, abweichend oder unsicher aussieht - stoppen Sie die Arbeit und rufen Sie Ihren PM an. Wir verlieren lieber eine Stunde, als einen Defekt zu erzeugen.",
    "Full RAMS (risk assessment & method statement) submitted and reviewed before mobilisation.": "Vollständige RAMS (Risikobewertung und Methodenbeschreibung) eingereicht und vor Mobilisierung geprüft.",
    "Report any near-miss or concern to your project manager - or call the office and we'll log it.": "Melden Sie Beinaheunfälle oder Bedenken Ihrem Projektmanager - oder rufen Sie das Büro an, und wir werden es protokollieren.",
    "If something didn't go right, we'll say so directly - and we'd ask the same of you.": "Wenn etwas nicht gut gelaufen ist, sagen wir es direkt - und wir würden das Gleiche von Ihnen verlangen.",
    "Tidy site, clean handover, photos and certificates uploaded the same day - not at month-end.": "Saubere Baustelle, saubere Übergabe, Fotos und Zertifikate am selben Tag hochgeladen - nicht zum Monatsende.",
    "Public-sector contracts": "Verträge des öffentlichen Sektors",
    "Public sector": "Öffentlicher Sektor",
    "Public sector · On programme": "Öffentlicher Sektor · Im Programm",
    "Public-sector electrical, fire and security delivery across the valleys - including a long-standing presence at our Pontypridd Service Hub.": "Elektro-, Brandschutz- und Sicherheitslieferungen im öffentlichen Sektor in den Tälern - einschließlich einer langjährigen Präsenz in unserem Pontypridd Service-Hub.",
    "Local-authority and commercial work across our home borough - from heritage sites and community facilities to public-sector framework projects.": "Kommunale und gewerbliche Arbeiten in unserem Heimatbezirk - von Denkmälern und Gemeinschaftseinrichtungen bis hin zu öffentlich-sektoralen Rahmenprojekten.",
    "Commercial, hospitality and public-sector projects across the capital - electrical fit-outs, integrated security and ongoing maintenance.": "Gewerbe-, Gastgewerbe- und öffentlich-sektorale Projekte in der Hauptstadt - Elektroausbauten, integrierte Sicherheit und laufende Wartung.",
    "Operating from our Caerphilly HQ and Pontypridd Service Hub, we mobilise engineer teams across South Wales, the UK, Ireland and continental Europe. Our national-retail security programme alone covers more than forty live sites in five countries - all managed from a single coordination desk.": "Von unserem Hauptsitz in Caerphilly und unserem Service-Hub in Pontypridd aus mobilisieren wir Ingenieurteams in Südwales, Großbritannien, Irland und Kontinentaleuropa. Allein unser nationales Sicherheitsprogramm für den Einzelhandel umfasst mehr als vierzig aktive Standorte in fünf Ländern - alle von einem einzigen Koordinationsbüro verwaltet.",
    "Full electrical installation for a live commercial refurbishment in a busy public-sector environment - delivered to programme, ready for testing, commissioning and handover.": "Komplette Elektroinstallation für eine laufende gewerbliche Sanierung in einer geschäftigen öffentlich-sektoralen Umgebung - terminkonform geliefert, bereit für Prüfung, Inbetriebnahme und Übergabe.",
    "Full electrical installation for a live commercial refurbishment in a busy public-sector environment - delivered to programme, with the compliance trail demanded by Cabinet Office frameworks.": "Komplette Elektroinstallation für eine laufende gewerbliche Sanierung in einer geschäftigen öffentlich-sektoralen Umgebung - terminkonform geliefert, mit dem von Cabinet Office-Rahmenverträgen geforderten Compliance-Nachweis.",
    "Full electrical rewire, KNX scene lighting, Lutron shading, AV distribution and EV charging for a prime residential gut-refurb - every accessory coordinated to the architect's drawing set.": "Komplette Elektro-Neuverkabelung, KNX-Szenenbeleuchtung, Lutron-Verschattung, AV-Verteilung und EV-Laden für eine erstklassige Wohnsanierung - jedes Zubehör nach dem Zeichnungssatz des Architekten koordiniert.",
    "Full-floor electrical refurbishment within one of Liverpool's landmark commercial buildings - containment, distribution, lighting, power, testing and handover as a complete package.": "Etagenweite Elektrosanierung in einem der Wahrzeichen-Geschäftsgebäude Liverpools - Kabeltrassen, Verteilung, Beleuchtung, Strom, Prüfung und Übergabe als komplettes Paket.",
    "Specialist CCTV and video-surveillance installations across stores in Germany, Austria, the Netherlands and Ireland - consistent standards across countries, minimal disruption to live retail trading.": "Spezialisierte CCTV- und Videoüberwachungsinstallationen in Filialen in Deutschland, Österreich, den Niederlanden und Irland - konsistente Standards in allen Ländern, minimale Störung des laufenden Einzelhandels.",
    "Specialist CCTV and video-surveillance works delivered across stores in Germany, Austria, the Netherlands and Ireland - consistent standards, minimal disruption to live retail operations.": "Spezialisierte CCTV- und Videoüberwachungsarbeiten in Filialen in Deutschland, Österreich, den Niederlanden und Irland - konsistente Standards, minimale Störung des laufenden Einzelhandelsbetriebs.",
    "A rolling BAFE SP203-1 fire detection refresh programme across a well-known high-street retailer's UK estate - standardised, remotely monitored, zero trading hours lost.": "Ein rollendes BAFE SP203-1-Brandmeldeerneuerungsprogramm in den britischen Standorten eines bekannten Einzelhändlers - standardisiert, fernüberwacht, null verlorene Handelsstunden.",
    "Energy-efficient LED upgrade for a community sports facility - approximately 168 fittings replaced with safe access methods around restricted roof purlins.": "Energieeffizienter LED-Ausbau für eine Gemeinschaftssporteinrichtung - etwa 168 Leuchten ersetzt mit sicheren Zugangsmethoden um eingeschränkte Dachpfetten.",
    "Electrical refurbishment works across multiple Lloyds Bank sites in Wales and the West - power, containment, lighting and small power delivered to consistent standards.": "Elektrosanierungsarbeiten an mehreren Lloyds Bank-Standorten in Wales und im Westen - Strom, Kabeltrassen, Beleuchtung und Kleinstrom nach konsistenten Standards geliefert.",
    "Multi-site electrical refurbishment across Lloyds Bank sites in Wales and the West - consistent standards, sensitive commercial premises, programme-managed throughout.": "Elektrosanierung an mehreren Lloyds Bank-Standorten in Wales und im Westen - konsistente Standards, sensible Geschäftsräume, durchgehend programmverwaltet.",
    "Listed-building refurbishment with addressable fire detection, discreet aspirating sampling and full electrical re-fit - compliant without compromising the fabric.": "Sanierung eines denkmalgeschützten Gebäudes mit adressierbarer Brandmeldung, dezenter Ansaugprobennahme und kompletter Elektro-Neuinstallation - konform, ohne die Bausubstanz zu beeinträchtigen.",
    "Grade 3 intruder with URN-backed police response, biometric access on strongroom and file areas, and GDPR-compliant IP CCTV for a central London private law firm.": "Grad-3-Einbruchmeldeanlage mit URN-gestützter Polizeireaktion, biometrischem Zutritt zu Tresor- und Aktenräumen sowie DSGVO-konformer IP-CCTV für eine private Anwaltskanzlei im Zentrum Londons.",
    "Very early warning aspirating smoke detection across cold aisles, UPS hall and plant for a Tier 3 colocation data centre - BS 6266 Class A, integrated to main panel and BMS.": "Sehr frühe Warnung mittels Ansaugrauchmeldern in Kaltgängen, USV-Halle und Technikbereich für ein Tier-3-Colocation-Rechenzentrum - BS 6266 Klasse A, integriert in Hauptzentrale und GLT.",
    "National rollout creating treatment rooms in live H&B stores. Full electrical package - power, lighting, emergency lighting, data and fire alarm alterations - delivered without disrupting trading.": "Landesweites Rollout zur Schaffung von Behandlungsräumen in aktiven H&B-Filialen. Komplettes Elektropaket - Strom, Beleuchtung, Notbeleuchtung, Daten und Brandmelde-Änderungen - ohne Störung des Handels geliefert.",
    "National rollout creating treatment rooms within live H&B stores - electrical, emergency lighting, data and fire alarm works delivered without interrupting trading.": "Landesweites Rollout zur Schaffung von Behandlungsräumen in aktiven H&B-Filialen - Elektro-, Notbeleuchtungs-, Daten- und Brandmeldearbeiten ohne Unterbrechung des Handels geliefert.",
    "National retail rollout": "Landesweites Einzelhandels-Rollout",
    "National High-Street Retailer": "Nationaler Einzelhändler",
    "National rollout · Live stores": "Landesweites Rollout · Aktive Filialen",
    "Flagship · International": "Flaggschiff · International",
    "Banking · Regional programme": "Banken · Regionales Programm",
    "Fire · Intruder · Audio": "Brandschutz · Einbruch · Audio",
    "Fire · Electrical · Data": "Brandschutz · Elektrik · Daten",
    "Fire · Electrical · Security · Compliance": "Brandschutz · Elektrik · Sicherheit · Compliance",
    "CCTV · Security · Multi-site": "CCTV · Sicherheit · Mehrere Standorte",
    "Electrical · Lighting · Data · Fire": "Elektrik · Beleuchtung · Daten · Brandschutz",
    "Community · Sports": "Gemeinschaft · Sport",
    "Modular housing": "Modularer Wohnungsbau",
    "Retail estates": "Einzelhandelsstandorte",
    "Data centres": "Rechenzentren",
    "Corporate compliance": "Unternehmens-Compliance",
    "Financial conduct": "Finanzaufsicht",
    "Insurance": "Versicherung",
    "Commercial & public-sector ready": "Bereit für Gewerbe und öffentlichen Sektor",
    "SSIP-aligned": "SSIP-ausgerichtet",
    "SSIP-recognised accreditation for site-attending trades.": "SSIP-anerkannte Akkreditierung für vor Ort tätige Gewerke.",
    "Liverpool": "Liverpool",
    "London": "London",
    "Cardiff, UK": "Cardiff, GB",
    "Cardiff City FC": "Cardiff City FC",
    "Cwmaman FC (Youth) & Maesycwmmer FC": "Cwmaman FC (Jugend) und Maesycwmmer FC",
    "Ystrad Mynach U10 Football Team": "Ystrad Mynach U10 Fußballmannschaft",
    "Islwyn, South Wales": "Islwyn, Südwales",
    "Midlands": "Midlands",
    "Centre, Swansea": "Zentrum, Swansea",
    "England, Wales, Scotland · Northern Ireland": "England, Wales, Schottland · Nordirland",
    "Ireland, France, Netherlands, Germany, Austria": "Irland, Frankreich, Niederlande, Deutschland, Österreich",
    "DE · AT · NL · IE": "DE · AT · NL · IE",
    "Club Secretary · Caerphilly Ladies": "Vereinssekretär · Caerphilly Ladies",
    "Club sponsor": "Vereinssponsor",
    "Club sponsor · 2023–24 season": "Vereinssponsor · Saison 2023-24",
    "Full kit sponsor": "Komplett-Trikotsponsor",
    "Manager & match sponsor · 2023/24": "Manager und Spielsponsor · 2023/24",
    "Team Coach · Cwmaman FC": "Trainer · Cwmaman FC",
    "Gregory Manning · Team Coach, Cwmaman FC": "Gregory Manning · Trainer, Cwmaman FC",
    "Bethan Bushen": "Bethan Bushen",
    "Gareth Vassay-Jones": "Gareth Vassay-Jones",
    "Owner · LongPlay Coffee": "Inhaber · LongPlay Coffee",
    "Project Manager · Modular Housing Developer": "Projektmanager · Modulbauentwickler",
    "Compliance Director · National FM": "Compliance-Direktor · Nationales FM",
    "Loss Prevention Lead": "Leiter Verlustprävention",
    "Head of Estates · Public Sector Framework": "Leiter Immobilien · Öffentlich-sektoraler Rahmenvertrag",
    "Privately owned club with a 100+ year heritage in the Caerphilly borough - VoltSecure has been a principal club sponsor.": "Privatgeführter Club mit über 100 Jahren Tradition im Bezirk Caerphilly - VoltSecure ist Hauptsponsor des Clubs.",
    "Proud manager and match-day sponsor of our nation's capital-city club for the 2023/24 season.": "Stolzer Manager und Spielsponsor des Hauptstadtclubs unseres Landes für die Saison 2023/24.",
    "Two-year support of junior football in Caerphilly - including full kit and medal sponsorship for annual tournaments.": "Zweijährige Unterstützung des Jugendfußballs in Caerphilly - einschließlich Komplett-Trikots und Medaillen-Sponsoring für Jahresturniere.",
    "Supplied full team & training kit for two youth football clubs in the South Wales Valleys - ensuring financial barriers never stop kids from playing.": "Komplette Team- und Trainingsausstattung für zwei Jugendfußballclubs in den South Wales Valleys geliefert - damit finanzielle Hürden niemals Kinder vom Spielen abhalten.",
    "Alongside commercial projects, we actively support the Welsh communities we live and work in - sponsoring youth football, grassroots sports and local clubs across South Wales.": "Neben kommerziellen Projekten unterstützen wir aktiv die walisischen Gemeinschaften, in denen wir leben und arbeiten - durch Sponsoring von Jugendfußball, Breitensport und lokalen Vereinen in ganz Südwales.",
    "UK supply chain, EV fleet, community sponsorships and local employment. Social value baked in - not bolted on to tick a box.": "Britische Lieferkette, EV-Flotte, Gemeinschaftssponsoring und lokale Beschäftigung. Sozialer Wert eingebaut - nicht angeschraubt, um ein Häkchen zu setzen.",
    "Socially engaged": "Sozial engagiert",
    "Giving back": "Etwas zurückgeben",
    "CCTV & Networking Engineer": "CCTV- und Netzwerkingenieur",
    "Fire & Security Engineer": "Brandschutz- und Sicherheitsingenieur",
    "FESS Apprentice": "FESS-Auszubildender",
    "Fire, Emergency & Security Systems apprenticeship - learn fire alarm, intruder, access control and CCTV alongside accredited engineers. BAFE / SSAIB pathway from year one.": "Ausbildung in Brandschutz-, Notfall- und Sicherheitssystemen - lernen Sie Brandmeldeanlagen, Einbruchmeldung, Zutrittskontrolle und CCTV neben akkreditierten Ingenieuren. BAFE/SSAIB-Pfad vom ersten Jahr an.",
    "Commercial first & second fix, distribution and inspection & test. BS 7671 (18th Ed.), AM2 advantageous, willingness to travel for framework projects. NICEIC-graded portfolio.": "Gewerbliche Erst- und Zweitmontage, Verteilung und Inspektion und Prüfung. BS 7671 (18. Aufl.), AM2 vorteilhaft, Reisebereitschaft für Rahmenprojekte. NICEIC-bewertetes Portfolio.",
    "Install, commission and maintain BAFE SP203-1 fire systems and SSAIB-graded intruder & access systems on commercial sites across the UK. ECS Gold or working toward it. BAFE module sign-off supported.": "Installation, Inbetriebnahme und Wartung von BAFE SP203-1-Brandschutzsystemen und SSAIB-bewerteten Einbruchmelde- und Zutrittssystemen an Gewerbestandorten in ganz Großbritannien. ECS Gold oder daran arbeitend. BAFE-Modulabnahme unterstützt.",
    "Coordinate engineer schedules, supplier orders and compliance documentation across live framework jobs. Background in construction, FM, or fire/security desirable. Strong organisation, calm under pressure.": "Koordination von Ingenieursplänen, Lieferantenbestellungen und Compliance-Dokumentation für laufende Rahmenaufträge. Hintergrund in Bau, FM oder Brandschutz/Sicherheit wünschenswert. Starke Organisation, ruhig unter Druck.",
    "Level 3 electrotechnical apprenticeship, fully funded, day-release at a partner college. Paid from day one. No prior trade experience needed - attitude and willingness to learn matter most.": "Stufe-3-elektrotechnische Ausbildung, vollständig finanziert, Studienurlaub an einer Partnerhochschule. Bezahlt vom ersten Tag an. Keine Vorkenntnisse erforderlich - Einstellung und Lernbereitschaft zählen am meisten.",
    "Electrical installation and FESS pathways, fully funded with day-release at a partner college.": "Elektroinstallations- und FESS-Pfade, vollständig finanziert mit Studienurlaub an einer Partnerhochschule.",
    ": our": ": unser",
    "For our": "Für unseren",
    "~168 fittings": "~168 Leuchten",
    "15:18:31 BST": "15:18:31 BST",
    "51.58°N · 3.21°W": "51,58°N · 3,21°W",
    " & electrical": " und Elektrik",
    "& electrical": "und Elektrik",
    "Fire, security": "Brandschutz, Sicherheit",
    "right": "richtig",
    "back": "zurück",
    "on and off site.": "auf und außerhalb der Baustelle.",
    "Dark (default)": "Dunkel (Standard)",
    "Accent hue": "Akzentfarbe",
    "Palette": "Palette",
    "Draft - pending review.": "Entwurf - prüfung ausstehend.",
    "Draft - pending sign-off.": "Entwurf - Abnahme ausstehend.",
    "Internal information & resources · VoltSecure® Ltd · BAFE 303517": "Interne Informationen und Ressourcen · VoltSecure® Ltd · BAFE 303517",
    "Framework agreements": "Rahmenverträge",
    "For": "Für",
    "A rolling BAFE SP203-1 fire detection refresh programme across a well-known high-street retailer’s UK estate - standardised, remotely monitored, zero trading hours lost.": "Ein rollendes BAFE SP203-1-Brandmelde-Erneuerungsprogramm in den britischen Standorten eines bekannten Einzelhändlers - standardisiert, fernüberwacht, null verlorene Handelsstunden.",
    "BS EN 12453": "BS EN 12453",
    "BS EN 62676": "BS EN 62676",
    "Example project type": "Beispiel-Projekttyp",
    "Example · Data centre": "Beispiel · Rechenzentrum",
    "Example · Heritage": "Beispiel · Denkmalschutz",
    "Example · Legal": "Beispiel · Rechtswesen",
    "Example · National retail": "Beispiel · Nationaler Einzelhandel",
    "Example · Prime residential": "Beispiel · Erstklassige Wohnimmobilie",
    "Full as-built drawings, test certificates and O&M manuals delivered on handover.": "Vollständige As-Built-Zeichnungen, Prüfzertifikate und Betriebs- und Wartungshandbücher bei der Übergabe geliefert.",
    "Full electrical rewire, KNX scene lighting, Lutron shading, AV distribution and EV charging for a prime residential gut-refurb - every accessory coordinated to the architect’s drawing set.": "Komplette Elektro-Neuverkabelung, KNX-Szenenbeleuchtung, Lutron-Verschattung, AV-Verteilung und EV-Laden für eine erstklassige Wohnsanierung - jedes Zubehör nach dem Zeichnungssatz des Architekten koordiniert.",
    "Great British Entrepreneur Awards": "Great British Entrepreneur Awards",
    "Independent testing and certification to BS and EN standards - BS 7671, BS 5839, BS EN 62676.": "Unabhängige Prüfung und Zertifizierung nach BS- und EN-Normen - BS 7671, BS 5839, BS EN 62676.",
    "Our standards apply to your work too": "Unsere Standards gelten auch für Ihre Arbeit",
    "Pension & sick pay above statutory.": "Rente und Krankengeld über dem gesetzlichen Standard.",
    "Project management, scheduling and handover to programme - no surprises, no slip.": "Projektmanagement, Terminplanung und Übergabe im Zeitplan - keine Überraschungen, keine Verzögerungen.",
    "Registered with the Financial Conduct Authority for relevant regulated activity.": "Bei der Financial Conduct Authority für relevante regulierte Tätigkeiten registriert.",
    "Risk assessments and method statements for every project, before first tool on site.": "Risikobewertungen und Methodenbeschreibungen für jedes Projekt, vor dem ersten Werkzeug auf der Baustelle.",
    "Services covered": "Abgedeckte Leistungen",
    "This page covers what we look for, what to expect from us, and how to register interest.": "Diese Seite behandelt, wonach wir suchen, was Sie von uns erwarten können und wie Sie Interesse anmelden.",
    "Trusted by commercial clients, public sector organisations, national retailers and local businesses across South Wales, the UK and Europe. Our work is built on long-term client relationships, repeat business and trusted delivery across electrical, fire and security projects.": "Vertrauen von Geschäftskunden, öffentlichen Einrichtungen, nationalen Einzelhändlern und lokalen Unternehmen in ganz Südwales, Großbritannien und Europa. Unsere Arbeit basiert auf langfristigen Kundenbeziehungen, wiederkehrenden Aufträgen und vertrauensvoller Lieferung in den Bereichen Elektrik, Brandschutz und Sicherheit.",
    "VoltSecure accreditations & standards": "VoltSecure-Akkreditierungen und -Standards",
    "early": "früh",
    "or email": "oder E-Mail"
};


  window.VS_I18N = {
    de: DE_MAP,
    // English-by-default current language
    currentLang: 'en',
    extend: function(more){
      Object.keys(more || {}).forEach(function(k){ DE_MAP[k] = more[k]; });
      // Re-apply if we're already in DE so the new keys take effect
      if (window.VS_I18N.currentLang === 'de') applyLang('de');
    }
  };

  // Build reverse lookup once - English (normalised) -> German
  function buildIdx(){
    var en2de = {}, de2en = {};
    Object.keys(DE_MAP).forEach(function(en){
      en2de[norm(en)] = DE_MAP[en];
      de2en[norm(DE_MAP[en])] = en;
    });
    return { en2de: en2de, de2en: de2en };
  }

  function walkText(root, fn){
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function(n){
        // Skip script/style/noscript
        var p = n.parentNode;
        if (!p) return NodeFilter.FILTER_REJECT;
        var t = (p.tagName || '').toUpperCase();
        if (t==='SCRIPT'||t==='STYLE'||t==='NOSCRIPT') return NodeFilter.FILTER_REJECT;
        if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var n;
    while ((n = w.nextNode())) fn(n);
  }

  function applyLang(lang){
    if (!lang) lang = 'en';
    // Going to EN: the safest way to fully restore the original
    // markup (no many-to-one reverse-mapping ambiguity) is to set
    // the preference and reload. The autoApply on the next load
    // sees 'en' and does nothing, so the markup stays original.
    if (lang === 'en') {
      try { localStorage.setItem('volt.lang', 'en'); } catch(e){}
      // Only reload if we actually were in DE (avoid infinite loops)
      if (window.VS_I18N.currentLang === 'de') {
        location.reload();
        return;
      }
      window.VS_I18N.currentLang = 'en';
      document.documentElement.lang = 'en';
      updateToggleLabels('en');
      return;
    }
    // Going to DE: walk text nodes and substitute
    var idx = buildIdx();
    walkText(document.body, function(node){
      var key = norm(node.nodeValue);
      if (idx.en2de[key]){
        var m = node.nodeValue.match(/^(\s*)([\s\S]*?)(\s*)$/);
        node.nodeValue = (m?m[1]:'') + idx.en2de[key] + (m?m[3]:'');
      }
    });
    window.VS_I18N.currentLang = 'de';
    document.documentElement.lang = 'de';
    try { localStorage.setItem('volt.lang', 'de'); } catch(e){}
    updateToggleLabels('de');
  }

  function updateToggleLabels(lang){
    var other = lang === 'en' ? 'de' : 'en';
    document.querySelectorAll('.lang-toggle').forEach(function(btn){
      var lab = btn.querySelector('.lt-label');
      if (lab) lab.textContent = other.toUpperCase();
    });
  }
  window.applyLang = applyLang; // expose so per-page scripts can call it

  // Apply persisted language. Runs immediately if DOM already parsed
  // (handles late-loaded site.js / cache-bust reinjections), otherwise
  // waits for DOMContentLoaded.
  function autoApply(){
    var lang = 'en';
    try { lang = localStorage.getItem('volt.lang') || 'en'; } catch(e){}
    if (lang !== 'en') applyLang(lang);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoApply);
  } else {
    autoApply();
  }

  // Bridge: any lang-toggle click -> flip language site-wide
  // (capture phase so we run before the legacy bubble-phase handler).
  // We do NOT dispatch voltlangchange here - the legacy handler below
  // dispatches it once, which the index.html page-specific applyLang
  // listens for. Dispatching twice would translate then untranslate.
  document.addEventListener('click', function(e){
    var btn = e.target.closest && e.target.closest('.lang-toggle');
    if (!btn) return;
    e.preventDefault();
    var next = window.VS_I18N.currentLang === 'en' ? 'de' : 'en';
    applyLang(next);
  }, true);
})();

/* VoltSecure - shared site scripts: mobile menu + lang toggle */
(function(){
  const burger = document.querySelector('.burger');
  const links  = document.querySelector('.nav-links');
  let menuOpen = false;
  function setMenu(open){
    menuOpen = open;
    if(!links) return;
    links.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if(!burger) return;
    burger.innerHTML = open
      ? '<span style="transform:rotate(45deg) translate(3px,3px)"></span><span style="opacity:0"></span><span style="transform:rotate(-45deg) translate(3px,-3px)"></span>'
      : '<span></span><span></span><span></span>';
  }
  if(burger && links){
    burger.addEventListener('click', () => setMenu(!menuOpen));
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  }

  /* language toggle - remembers preference, updates flag/label */
  function flagSVG(lang){
    if(lang==='de'){
      return '<svg viewBox="0 0 24 16" width="22" height="14"><rect width="24" height="5.33" y="0" fill="#000"/><rect width="24" height="5.33" y="5.33" fill="#DD0000"/><rect width="24" height="5.33" y="10.66" fill="#FFCE00"/></svg>';
    }
    return '<svg viewBox="0 0 24 16" width="22" height="14"><rect width="24" height="16" fill="#012169"/><path d="M0,0 L24,16 M24,0 L0,16" stroke="#fff" stroke-width="2.4"/><path d="M0,0 L24,16 M24,0 L0,16" stroke="#C8102E" stroke-width="1.2"/><path d="M12,0 V16 M0,8 H24" stroke="#fff" stroke-width="4"/><path d="M12,0 V16 M0,8 H24" stroke="#C8102E" stroke-width="2.4"/></svg>';
  }

  let currentLang = 'en';
  try { currentLang = localStorage.getItem('volt.lang') || 'en'; } catch(e){}

  function renderToggles(){
    const other = currentLang === 'en' ? 'de' : 'en';
    document.querySelectorAll('.lang-toggle').forEach(btn => {
      btn.innerHTML = flagSVG(other) + ' <span class="lt-label">' + other.toUpperCase() + '</span>';
    });
  }
  renderToggles();

  // Keep this listener for the SVG flag re-render only. The actual translation
  // is handled by the shared VS_I18N engine higher up which preventDefaults the
  // click in its capture-phase handler; this listener just makes sure the flag
  // icon flips immediately to show the opposite language.
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.lang-toggle');
    if(!btn) return;
    // VS_I18N has already toggled currentLang via its capture-phase handler.
    // Sync our local copy from localStorage and re-render the flag.
    try { currentLang = localStorage.getItem('volt.lang') || 'en'; } catch(e){}
    renderToggles();
    // Old per-page bridge event - kept for back-compat with the legacy
    // applyLang() in index.html that listens for voltlangchange.
    document.dispatchEvent(new CustomEvent('voltlangchange', { detail: { lang: currentLang } }));
  });
  /* projects.html - service-type filter */
  (function(){
    const grid = document.querySelector('.proj-grid');
    const buttons = document.querySelectorAll('.pf-btn');
    if(!grid || !buttons.length) return;
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const f = btn.dataset.filter;
        buttons.forEach(b => b.classList.toggle('is-active', b===btn));
        grid.querySelectorAll('.pcard').forEach(card => {
          const services = (card.dataset.services || '').split(/\s+/);
          const show = (f === 'all') || services.includes(f);
          card.style.display = show ? '' : 'none';
        });
        if(typeof gtag === 'function') gtag('event','filter_projects',{filter:f});
      });
    });
  })();

  /* contact form - fire GA4 lead event on submit */
  (function(){
    const form = document.getElementById('contactForm');
    if(!form) return;
    form.addEventListener('submit', () => {
      if(typeof gtag === 'function'){
        gtag('event','generate_lead',{
          form: 'contact',
          service: (form.querySelector('[name=service]') || {}).value || '(unspecified)'
        });
      }
    });
  })();
})();
