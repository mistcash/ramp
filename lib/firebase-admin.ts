import admin, { ServiceAccount } from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

import serviceAccount from "../keys/adminsdk.json";

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount as ServiceAccount)
});

// Get a reference to your Firestore database
export const db = getFirestore();
