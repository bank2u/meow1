import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.4/firebase-app.js";
import { getFirestore, collection, doc, getDocs, setDoc, addDoc, query, where, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.9.4/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDB1Eg-cLKhMRvkLcujhd1QyAMxEbubBFQ",
    authDomain: "meow1-fip.firebaseapp.com",
    databaseURL: "https://meow1-fip-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "meow1-fip",
    storageBucket: "meow1-fip.appspot.com",
    messagingSenderId: "286369200157",
    appId: "1:286369200157:web:9def9ef4a7412aab652ef4"
};

//firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const txtWeight = document.getElementById('txtWeight');
const txtFeeder = document.getElementById('txtFeeder');
const btnSaveWeight = document.getElementById('btnSaveWeight');


btnSaveWeight.onclick = async function () {
    const weightRecord = collection(db, "weight-record");
    await addDoc(weightRecord, {
        type: document.getElementById("rbDry").checked ? "dry" : "wet",
        feeder: txtFeeder.value.toString(),
        date: new Date(),
        weight: parseFloat(txtWeight.value)
    });

    getFeedHistory(weightRecord);
};

async function getFeedHistory(weight) {
    const weightRecord = collection(db, "weight-record");
    var todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    // todayDate.setDate(todayDate.getDate() - 1);

    const q1 = query(weightRecord, where("feeder", "==", 'bank'));
    const q2 = query(q1, where("date", ">", todayDate));

    const querySnapshot1 = await getDocs(q1);
    const querySnapshot2 = await getDocs(q2);
    console.log(querySnapshot2.docs[0].data());
}