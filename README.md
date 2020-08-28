# GCS Mirror Extension Demo App

Demo app for the Firebase GCS Mirror Extension. Built using Angular 10, Angular Material, and Firebase.

![](demo.jpg?raw=true)

## Features
* File-system like traversal of Cloud Storage bucket.
* Real-time updates for Cloud Storage, newly uploaded files, modifications, and deletions are highlighted and shown in real-time.
* Perform sophisticated queries on Object Metadata, for example, filtering for files of a certain size or type.

## Development
* Ensure that the GCS Mirror Extension is installed in your Firebase project.
* Ensure that your Cloud Storage and Firestore rules are set to public.
* Run `npm install` to install dependencies.
* Create a file at `src/app/environments/firebaseConfig.ts`, an example (`firebaseConfig.example.ts`) is provided. Fill this out with your Firebase Client config and optionally the source code url.
* Run `npm start` to run the project locally.
* Run `npm run build` to build the project bundle.
* Run `ng deploy` to build and deploy to your Firebase project, provided that hosting is configured.

Note: Authentication is not implemented so make sure your Cloud Storage bucket and Firestore database are public.
