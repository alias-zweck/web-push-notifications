importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp();

const messaging = firebase.messaging();

// Utility functions for IndexedDB
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('notification-settings', 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore('settings', { keyPath: 'key' });
    };
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

function saveSetting(key, value) {
  return openDatabase().then(db => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('settings', 'readwrite');
      const store = transaction.objectStore('settings');
      store.put({ key, value });
      transaction.oncomplete = () => {
        resolve();
      };
      transaction.onerror = (event) => {
        reject(event.target.error);
      };
    });
  });
}

function getSetting(key) {
  return openDatabase().then(db => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('settings', 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get(key);
      request.onsuccess = (event) => {
        resolve(event.target.result ? event.target.result.value : null);
      };
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  });
}

// Handle messages to update settings
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'update-notifications-enabled') {
    const notificationsEnabled = event.data.payload;
    console.log('Notifications enabled state updated:', notificationsEnabled);
    saveSetting('notificationsEnabled', notificationsEnabled);
  }
});

messaging.onBackgroundMessage(async function(payload) {
  console.log('Received background message ', payload);
  
  const notificationsEnabled = await getSetting('notificationsEnabled');
  console.log('Current notificationsEnabled state:', notificationsEnabled);
  
  // Customize notification here
  const notificationTitle ='New Notification';
  const notificationOptions = {
    body: payload.data.body,
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

  if (notificationsEnabled) {
    console.log('Showing notification:', notificationTitle);
    return self.registration.showNotification(notificationTitle, notificationOptions);
  } else {
    console.log('Notifications are disabled.');
  }
});