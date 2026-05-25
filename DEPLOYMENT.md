# Deployment Guide - Veckovis Information

Denna guide visar hur du deployar applikationen till GitHub Pages (gratis hosting).

## 📋 Förutsättningar

- GitHub-konto
- Git installerat på din dator (valfritt, kan göras via GitHub web interface)

## 🚀 Steg-för-steg Deployment

### Steg 1: Skapa GitHub Repository

1. Gå till [GitHub.com](https://github.com) och logga in
2. Klicka på **"+"** i övre högra hörnet
3. Välj **"New repository"**
4. Fyll i:
   - **Repository name:** `veckovis-information` (eller valfritt namn)
   - **Description:** "Veckovis information för teamet"
   - **Public** (måste vara public för gratis GitHub Pages)
   - ✅ Kryssa i **"Add a README file"**
5. Klicka **"Create repository"**

### Steg 2: Ladda upp filer

#### Alternativ A: Via GitHub Web Interface (Enklast)

1. I ditt nya repository, klicka på **"Add file"** → **"Upload files"**
2. Dra och släpp alla filer från `information-sharing-app/` mappen
3. Skriv commit-meddelande: "Initial deployment"
4. Klicka **"Commit changes"**

#### Alternativ B: Via Git Command Line

```bash
# Klona ditt repository
git clone https://github.com/ditt-användarnamn/veckovis-information.git
cd veckovis-information

# Kopiera alla filer från information-sharing-app/
# (Använd din filhanterare eller cp-kommando)

# Lägg till alla filer
git add .

# Commit
git commit -m "Initial deployment"

# Push till GitHub
git push origin main
```

### Steg 3: Aktivera GitHub Pages

1. Gå till ditt repository på GitHub
2. Klicka på **"Settings"** (längst till höger i menyn)
3. Scrolla ner och klicka på **"Pages"** i vänstermenyn
4. Under **"Source"**:
   - Branch: Välj **"main"**
   - Folder: Välj **"/ (root)"**
5. Klicka **"Save"**
6. Vänta 1-2 minuter

### Steg 4: Verifiera Deployment

1. GitHub visar en grön box med din URL: `https://ditt-användarnamn.github.io/veckovis-information/`
2. Klicka på länken för att öppna din sajt
3. Kontrollera att allt fungerar korrekt

## 🔗 Anpassa URL (Valfritt)

### Använd Custom Domain

Om du har en egen domän:

1. Gå till **Settings** → **Pages**
2. Under **"Custom domain"**, skriv in din domän (t.ex. `info.dindomän.se`)
3. Klicka **"Save"**
4. Hos din domänleverantör, lägg till en CNAME-post:
   ```
   Type: CNAME
   Name: info (eller subdomain du vill använda)
   Value: ditt-användarnamn.github.io
   ```
5. Vänta på DNS-propagering (kan ta upp till 24 timmar)

## 📱 Dela med Användare

### Skapa QR-kod

1. Gå till [QR Code Generator](https://www.qr-code-generator.com/)
2. Klistra in din URL
3. Ladda ner QR-koden
4. Skicka via SMS eller email

### SMS-meddelande (Mall)

```
Ny informationstjänst! 📱

Hämta senaste veckoinfo här:
https://ditt-användarnamn.github.io/veckovis-information/

💡 Tips: Lägg till på hemskärmen för snabb åtkomst!

Inga fler SMS-utskick framöver.
```

### Email-meddelande (Mall)

```
Hej!

Vi har lanserat en ny tjänst för veckovis information!

🔗 Länk: https://ditt-användarnamn.github.io/veckovis-information/

Fördelar:
✅ Alltid senaste informationen
✅ Fungerar på mobil och dator
✅ Kan användas offline
✅ Lägg till på hemskärmen som app

Instruktioner:
1. Öppna länken på din mobil
2. Bokmärk sidan eller lägg till på hemskärmen
3. Öppna när du behöver information

Framöver kommer all information att publiceras här istället för via SMS.

Mvh,
[Ditt namn]
```

## 🔄 Uppdatera Innehåll

### Via GitHub Web Interface

1. Gå till ditt repository
2. Navigera till `data/current-week.json`
3. Klicka på pennikonen (Edit)
4. Gör dina ändringar
5. Scrolla ner, skriv commit-meddelande
6. Klicka **"Commit changes"**
7. Vänta 30-60 sekunder - sajten uppdateras automatiskt

### Via Git

```bash
# Gå till din lokala kopia
cd veckovis-information

# Redigera filer
# (Använd VS Code, Notepad++, eller annan editor)

# Commit och push
git add data/current-week.json
git commit -m "Uppdaterad vecka 21"
git push
```

## 📊 Övervaka Deployment

### GitHub Actions

1. Gå till **"Actions"** i ditt repository
2. Se status för varje deployment
3. Klicka på en workflow för att se detaljer
4. Om något går fel, se loggarna här

### Vanliga Problem

#### Sidan visar 404

- Kontrollera att GitHub Pages är aktiverat
- Verifiera att filer ligger i root (inte i undermapp)
- Vänta 2-3 minuter efter första deployment

#### Ändringar syns inte

- Vänta 1-2 minuter efter commit
- Ladda om med Ctrl+F5 (tvinga refresh)
- Rensa webbläsarens cache

#### JSON-fel

- Validera JSON på [JSONLint](https://jsonlint.com/)
- Kontrollera kommatecken och citattecken
- Se GitHub Actions-loggen för felmeddelanden

## 🔒 Säkerhet

### Rekommendationer

- ✅ Använd HTTPS (GitHub Pages har detta automatiskt)
- ✅ Lägg inte känslig information i JSON-filerna
- ✅ Överväg att göra repository private (kräver GitHub Pro för Pages)
- ✅ Använd branch protection rules för main branch

### Branch Protection (Valfritt)

1. Gå till **Settings** → **Branches**
2. Klicka **"Add rule"**
3. Branch name pattern: `main`
4. Aktivera:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
5. Klicka **"Create"**

## 📈 Analytics (Valfritt)

### Google Analytics

1. Skapa Google Analytics-konto
2. Få tracking-kod
3. Lägg till i `index.html` före `</head>`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🔄 Backup

### Automatisk Backup

Git-historiken är din backup! Alla ändringar sparas.

### Manuell Backup

```bash
# Ladda ner hela repository som ZIP
# Gå till repository på GitHub → Code → Download ZIP

# Eller klona lokalt
git clone https://github.com/ditt-användarnamn/veckovis-information.git backup-$(date +%Y%m%d)
```

## 🆘 Återställning

### Återställ till tidigare version

```bash
# Se historik
git log --oneline

# Återställ till specifik commit
git revert COMMIT_HASH

# Eller återställ fil
git checkout COMMIT_HASH -- data/current-week.json
git commit -m "Återställd till tidigare version"
git push
```

### Via GitHub Web Interface

1. Gå till filen på GitHub
2. Klicka **"History"**
3. Hitta rätt version
4. Klicka på commit
5. Klicka på **"..."** → **"View file"**
6. Kopiera innehållet
7. Gå tillbaka och redigera nuvarande fil
8. Klistra in gammalt innehåll
9. Commit

## 📞 Support

### Resurser

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [PWA Documentation](https://web.dev/progressive-web-apps/)

### Felsökning

Om du stöter på problem:

1. Kontrollera GitHub Actions-loggen
2. Validera JSON-filer
3. Testa lokalt först (öppna index.html i webbläsare)
4. Sök på GitHub Community Forum
5. Skapa Issue i ditt repository

## ✅ Checklista för Go-Live

- [ ] Repository skapat på GitHub
- [ ] Alla filer uppladdade
- [ ] GitHub Pages aktiverat
- [ ] Sajt fungerar på live-URL
- [ ] Testat på mobil (iOS och Android)
- [ ] PWA-installation fungerar
- [ ] JSON-data är korrekt
- [ ] Administratörsguide läst
- [ ] QR-kod skapad
- [ ] SMS/Email förberett
- [ ] Backup-rutin etablerad
- [ ] Användare informerade

## 🎉 Grattis!

Din informationsdelningsapp är nu live och redo att användas!

**Nästa steg:**
1. Informera användarna
2. Uppdatera innehållet regelbundet
3. Övervaka användning
4. Samla feedback
5. Förbättra kontinuerligt

---

**Behöver du hjälp?** Se [README.md](README.md) och [admin-guide.html](admin-guide.html)