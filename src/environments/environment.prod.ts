import { firebaseConfig } from './firebaseConfig';

export const environment = {
  production: true,
  firebase: { ...firebaseConfig }
};
