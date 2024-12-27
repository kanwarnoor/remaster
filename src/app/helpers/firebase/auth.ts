import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "./config";

// Sign up function
export async function signUp(email: string, password: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Sign in function
export async function signIn(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Sign out function
export async function logout() {
  try {
    await signOut(auth);
    console.log("User signed out");
  } catch (error) {
    console.error(error);
    throw error;
  }
}
