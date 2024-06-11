importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({});

const messaging = firebase.messaging();

// messaging.onBackgroundMessage((payload) => {
//     console.log('[firebase-messaging-sw.js] Received background message ', payload);
//     // Customize notification here
//     const notificationTitle = payload.notification.title;
//     const notificationOptions = {
//       body: payload.notification.body,
//       icon: '/firebase-logo.png'
//     };
  
//     return self.registration.showNotification(notificationTitle, notificationOptions);
//   });



// // Handle background message
// messaging.onBackgroundMessage(function(payload) {
//     console.log('[firebase-messaging-sw.js] Received background message ', payload);
//     // Customize notification here
//     const notificationTitle = 'Background Message Title';
//     const notificationOptions = {
//       body: 'Background Message body.',
//       icon: '/firebase-logo.png'
//     };
  
//     return self.registration.showNotification(notificationTitle,
//       notificationOptions);
//   });
  
// By Alias
  // messaging.onBackgroundMessage((payload) => {
  //   console.log('[firebase-messaging-sw.js] Received background message ', payload);
  //   // Customize notification here
  //   const notificationTitle = payload.notification.title;
  //   const notificationOptions = {
  //     body: payload.notification.body,
  //     icon: 'chat-icon.png'
  //   };

  //   self.registration.showNotification(notificationTitle, notificationOptions);
  // });

  // By Aswin

  messaging.onBackgroundMessage(function(payload) {
    console.log('Received background message ', payload);
    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body:  payload.notification.body,
      icon: '/firebase-logo.png'
    };
  
    // Send a message to the client
    self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'background-message',
          payload: payload
        });
      });
    });
  
    return self.registration.showNotification(notificationTitle,
      notificationOptions);
  });





// TODO old code

// const firebase = require('firebase/app');
// require('firebase/messaging');

// firebase.initializeApp();

// const app = firebase.initializeApp(firebaseConfig);
// const messaging = firebase.messaging();

// messaging.onBackgroundMessage((payload) => {
//   console.log('Received background message ', payload);
//   // Handle background message
// });
  