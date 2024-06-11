# web-push-notifications

## Client

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.

### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

### Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

### Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.





## Firebase Cloud Messaging Backend

This project is a backend service built with Express that allows clients to subscribe and unsubscribe from Firebase Cloud Messaging (FCM) topics, and to send notifications to those topics.

### Features

- **Subscribe to a Topic:** Clients can subscribe to a specific FCM topic.
- **Unsubscribe from a Topic:** Clients can unsubscribe from a specific FCM topic.
- **Publish a Notification:** Send notifications to all subscribers of a specific topic.

### Prerequisites

- Node.js (>= 14.x)
- npm (>= 6.x)
- Firebase Admin SDK credentials

### Setup

1. **Clone the repository:**
    ```sh
    git clone https://github.com/yourusername/fcm-backend.git
    cd fcm-backend
    ```

2. **Install dependencies:**
    ```sh
    npm install
    ```

3. **Firebase Admin SDK:**
    - Obtain your Firebase Admin SDK credentials and save the JSON file in your project directory.
    - Initialize Firebase Admin SDK in a file named `firebaseAdmin.js`:
        ```js
        const admin = require('firebase-admin');
        const serviceAccount = require('./path-to-your-firebase-adminsdk.json');

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });

        module.exports = admin;
        ```

4. **Environment Variables:**
    - Create a `.env` file in the root directory of your project and set the port:
        ```
        PORT=3000
        ```

### Running the Server

To start the server, run:
```sh
npm start
