# PLUGINS

create your own `firebase.js`

```
import firebase from 'firebase'

if (!firebase.apps.length) {
    const firebaseConfig = {
        apiKey: "xxx",
        authDomain: "xxx",
        databaseURL: "xxx",
        projectId: "xxx",
        storageBucket: "xxx",
        messagingSenderId: "xxx",
        appId: "xxx",
        measurementId: "xxx"
    };
    firebase.initializeApp(firebaseConfig)
}

export default firebase

```
