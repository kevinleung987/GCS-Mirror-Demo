import { firebaseConfig } from './firebaseConfig';
import { sourceUrl } from './firebaseConfig.example';

export const environment = {
  production: true,
  firebase: { ...firebaseConfig },
  sourceUrl,
};
