# 💬 Convo – En ChatApp bygget med React Native

Convo er en moderne chatapplikation udviklet i **React Native**, hvor brugere kan oprette sig, logge ind og kommunikere i chatrum. Appen benytter **Firebase Authentication** til login (email/password og Google), og **Firebase Firestore** til realtidsbeskeder og billeddeling.

---

## 🚀 Funktioner

- ✅ Opret bruger med email og adgangskode
- 🔐 Login med email/password eller Google
- 💬 Deltag i chatrum (chatrooms) via Firestore
- 🖼 Send beskeder og billeder i realtid
- 🚪 Log ud når som helst

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

Når appen er installeret og kører, kan du bruge den som følger:

1. **Opret en bruger:**
   - Vælg “Opret konto”
   - Indtast email, adgangskode og navn eller brug Google-login

2. **Login:**
   - Brug dine login-oplysninger til at logge ind

3. **Chatrooms:**
   - Du bliver tilknyttet et eller flere chatrooms
   - Åbn et chatroom og begynd at skrive
   - Det chatroom med senest aktivitet ligger øverst i listen

4. **Send besked:**
   - Indtast tekst i beskedfeltet og tryk “Send”
   - Du kan vedhæfte et billede fra din enhed og sende med din besked

5. **Log ud:**
   - Tryk på “Log ud” hvis du ønsker at forlade appen og komme tilbage til opret/login skærmen
  
---

## 🔮 Fremtidige planer

- Brugere kan oprette egne chatrooms med navn og beskrivelse
- Push-notifikationer, så man får besked ved nye beskeder
- Dark/Light mode med mulighed for at skifte i indstillinger

---
## 🙋‍♀️ Udviklet af

Dette projekt er udviklet af Sophie Amalie Karup Sørensen som en del af et projekt i samarbejde med Pentia på 4. semester af Datamatiker uddannelsen. 

