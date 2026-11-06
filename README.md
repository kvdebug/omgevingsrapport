# Omgevingsrapport

Statische Nederlandstalige testwebsite in plain HTML/CSS/JS, zonder backend of buildstap. `index.html` staat in de root. GitHub Pages: deploy from branch `main`, `/ (root)`.

Alle adresresultaten zijn fictieve demo-informatie, geen onderzoek naar het ingevoerde adres. Funda-links worden uitsluitend lokaal uit het URL-pad gelezen; Funda wordt niet opgehaald. Geen betalingen, rapportlevering, e-mails of buurtalerts actief.

E-mail wordt alleen in deze browser opgeslagen onder localStorage-sleutel `omgevingsrapport_email`. Verwijderen kan via de privacyvraag op de homepage. Google Fonts is een externe assetaanvraag.

`track(event, data)` logt naar de console en verzendt een lokaal CustomEvent `omgevingsrapport:track`. Events: `adres_ingevoerd`, `teaser_bekeken`, `koop_klik`, `pakket_gekozen`, `email_achtergelaten`. Er worden geen adressen of e-mailadressen in events opgenomen.

Open `index.html` of serveer deze map met een statische webserver. Alle sitepaden zijn relatief.
