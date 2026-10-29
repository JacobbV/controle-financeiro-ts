// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyASgahgC-1NBY-2OnFc3as0026L82QT78U",
  authDomain: "controle-financeiro-ts.firebaseapp.com",
  projectId: "controle-financeiro-ts",
  storageBucket: "controle-financeiro-ts.firebasestorage.app",
  messagingSenderId: "105740799132",
  appId: "1:105740799132:web:4e6299f82db7414947f159"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Lista de e-mails autorizados (Começa só com o seu; se quiser liberar pra alguém no futuro, é só adicionar aqui)
export const EMAILS_AUTORIZADOS = [
  "ramesonjaco@gmail.com"
];