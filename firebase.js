import { initializeApp, initializeServerApp } from 'firebase/app';
import { collection, getDocs, doc } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import * as Auth from 'firebase/auth';
import Express from 'express';
import fs from 'fs';

import Admin from 'firebase-admin';
import { getDownloadURL } from 'firebase-admin/storage';

const firebaseConfig = {
    apiKey: "AIzaSyC_Ncc5_1N87B0mJwot1z48lfQvIIpyB48",
    authDomain: "skelbimuprojektas.firebaseapp.com",
    projectId: "skelbimuprojektas",
    storageBucket: "skelbimuprojektas.firebasestorage.app",
    messagingSenderId: "75838344852",
    appId: "1:75838344852:web:947d7733ab3cf648a92e81"
};

const app = Admin.initializeApp({
    credential: Admin.credential.cert('./skelbimuprojektas-firebase-adminsdk-fbsvc-2ee80aa1ab.json'),
    databaseURL: 'skelbimuprojektas.firebaseapp.com',
});


// const db = getFirestore();
const firestore = Admin.firestore(app);
const storage = Admin.storage(app);


const createUser = async (email, password, displayName) => {
    if (!email || !password || password.length < 8) {
        throw new Error('Trūksta el pašto arba slaptažodžio!');
    }

    return await app.auth().createUser({
        email,
        password,
        displayName,
        emailVerified: true
    });
};

const login = async (email, password) => {
    if (!email || !password || password.length < 8) {
        throw new Error('Trūksta el pašto arba slaptažodžio!');
    }

    const user = await app.auth().getUserByEmail(email).catch(e => null);
    if (!user) {
        throw new Error('Toks vartotojas neegzistuoja');
    }

    return await Auth.signInWithEmailAndPassword(Auth.getAuth(initializeApp(firebaseConfig)), email, password);
};


/**
 * @param {Express.Request} request 
 */
const getAuth = async (request) => {
    const app = initializeServerApp(firebaseConfig, {
        authIdToken: request.get('Authorization') ?? request.cookies['Authorization'],
    });
    const auth = Auth.getAuth(app);

    await auth.authStateReady();

    return auth;
};

/**
 * @param {Express.Request} request 
 */
const newAd = async (request) => {
    const auth = await getAuth(request);
    if (!auth.currentUser) {
        throw new Error('Privaloma prisijungti, norint kurti skelbimus');
    }

    // const bucket = storage.bucket('skelbimuprojektas');
    // // const bucketExists = await bucket.exists();
    // // if (!bucketExists) {
    // //     await bucket.create();
    // // }

    // const file = bucket.file(`${+new Date()}_${request.file.originalname}`, {
    //     uploadType: {resumable: false}
    // });

    // await file.save(request.file.buffer)
    //     .catch((e) => {
    //         console.log({e});
    //         throw new Error('Neimanoma ikelti paveikslelio');
    //     })
    // ;

    // const url = await getDownloadURL(file);

    return await firestore.collection('ads').add({
        name: request.body.name,
        description: request.body.description,
        category: request.body.category,
        priceEur: parseFloat(request.body.price),
        pictureUrl: null,
        likes: 0,
    });
};

/**
 * @param {Express.Request} request 
 */
const editAd = async (request) => {
    const auth = await getAuth(request);
    if (!auth.currentUser) {
        throw new Error('Privaloma prisijungti, norint kurti skelbimus');
    }

    console.log(request.body.id, request.body);

    return await firestore.collection('ads').doc(request.body.id).update({
        name: request.body.name,
        description: request.body.description,
        category: request.body.category,
        priceEur: parseFloat(request.body.price),
    });
};

const getAllAds = async () => {
    const ads = [];
    await firestore.collection('ads')
        .get()
        .then(data => data.forEach(ad => ads.push({ id: ad.id, ...ad.data(), pictureUrl: 'https://www.alleycat.org/wp-content/uploads/2019/03/FELV-cat.jpg' })))
        ;
    return ads;
};

const likeAd = async (adId) => {
    return await firestore.collection('ads').doc(adId).get().then(document => {
        if (document.exists) {
            firestore.collection('ads').doc(adId).update('likes', document.data().likes + 1);
            return document.data().likes + 1;
        } else {
            return 0;
        }
    });
};

const deleteAd = async (adId) => {
    return await firestore.collection('ads').doc(adId).delete();
};

export default {
    createUser,
    getAuth,
    login,
    newAd,
    getAllAds,
    likeAd,
    deleteAd,
    editAd
}