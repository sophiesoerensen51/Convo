# 💬 Convo – En ChatApp bygget med React Native

Convo er en moderne chatapplikation udviklet i **React Native**, hvor brugere kan oprette sig, logge ind og kommunikere i chatrum. Appen benytter **Firebase Authentication** til login (email/password og Google), og **Firebase Firestore** til realtidsbeskeder og billeddeling.

---

## 🚀 Funktioner

- Opret bruger med email og adgangskode.
- Login med email/password eller Google.
- Deltag i chatrum (chatrooms) via Firestore.
- Deltag i chatrum du er blevet tilføjet til.
- Opret dine egne chatrum og tilføj andre brugere.
- Slet dine egne oprettede chatrum og fjern eller tilføj brugere.
- Send beskeder og billeder i realtid.
- Log ud i indstillinger.
- Opdater din adgangskode eller brugernavn.
- Opdater navn og beskrivelse på oprettet chatrum.

---

## 🧱 Teknologier brugt

- [React Native](https://reactnative.dev/)
- [Firebase Authentication](https://firebase.google.com/products/auth)
- [Cloud Firestore](https://firebase.google.com/products/firestore)
- [React Navigation](https://reactnavigation.org/) 

---

## 🛠️ Installation & Opsætning

> Sørg for at have fulgt [React Native miljøopsætningen](https://reactnative.dev/docs/environment-setup), og at du har adgang til Firebase.

### 1. Klon projektet og installer afhængigheder

```sh
git clone https://github.com/sophiesoerensen51/Convo.git
cd Convo
npm install
# eller
yarn install
```

### 2. Start Metro-server

```sh
npm start
eller
yarn start
```

## 3. Kør appen

### Android
```sh
npm run android
# eller
yarn android
```

### IOS
```sh
cd ios
pod install
cd ..
npm run ios
eller
yarn ios
```
---

## 📱 Brug

1. **Opret en bruger:**
   - Vælg “Opret konto”.
   - Indtast email, adgangskode og navn, eller brug Google-login.

2. **Login:**
   - Brug dine loginoplysninger til at logge ind.

3. **Chatrooms:**
   - Du bliver automatisk tilknyttet chatrooms, hvis andre har tilføjet dig.
   - Du kan også oprette dine egne chatrooms.
   - Det chatroom med den seneste aktivitet vises øverst i listen.
   - Inde i et chatroom kan du sende beskeder og billeder.

4. **Send beskeder:**
   - Skriv en besked og tryk “Send”.
   - Du kan vedhæfte et billede fra din enhed.

5. **Chatindstillinger:**
   - Tryk på tandhjulet i chatroomet for at se indstillinger.
   - Som admin kan du tilføje/fjerne brugere og ændre navn/beskrivelse.
   - Kun admin kan slette et chatroom.
   - Ikke-admins kan se deltagerliste og chat-info, men ikke redigere.

6. **Brugerindstillinger:**
   - Tryk på tandhjulet på hjemmeskærmen for at tilgå brugerindstillinger.
   - Her kan du ændre brugernavn og adgangskode.
   - Nederst i denne menu finder du log ud-knappen.


---
## 🙋‍♀️ Udvikler

Dette projekt er udviklet af **Sophie Amalie Karup Sørensen** som en del af 4. semester på Datamatiker-uddannelsen. Projektet er lavet i samarbejde med **Pentia**, og videreudviklet i de to første uger af praktikforløbet hos **Pentia Mobile** i Odense.


