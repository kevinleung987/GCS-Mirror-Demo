import { firebaseConfig, sourceUrl } from './firebaseConfig';

export const environment = {
  production: true,
  firebase: { ...firebaseConfig },
  sourceUrl,
};
