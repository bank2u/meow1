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

document.addEventListener('DOMContentLoaded', function () {
    getFeedHistory();
    getYesterdayTotal();
    txtFeeder.value = getCookie('feeder');
}, false);

txtFeeder.addEventListener('keyup', (event) => {
    setCookie('feeder', txtFeeder.value, 31536000 );
});

btnSaveWeight.onclick = async function () {
    const weightRecord = collection(db, "weight-record");
    await addDoc(weightRecord, {
        type: document.getElementById("rbDry").checked ? "dry" : "wet",
        feeder: txtFeeder.value.toString(),
        date: new Date(),
        weight: parseFloat(txtWeight.value)
    });
    txtWeight.value = 0;

    getFeedHistory();
};

async function getYesterdayTotal() {
    var date = new Date();
    date.setDate(date.getDate() - 1);
    date.setHours(0, 0, 0, 0); // yesterday


    var result = await queryFeedHistory(date);
    var wet = result.filter(x => x.type == 'wet');
    var dry = result.filter(x => x.type == 'dry');
    var dryWeight = dry.reduce((total, obj) => obj.weight + total, 0);
    var wetWeight = wet.reduce((total, obj) => obj.weight + total, 0);

    dryWeight = dryWeight.toFixed(1);
    wetWeight = wetWeight.toFixed(1);

    const divYesterday = document.getElementById('divYesterday');
    divYesterday.innerHTML = "Yesterday : Dry= " + dryWeight.toString() + "g. , Wet= " + wetWeight.toString() + "g.";
}

async function getFeedHistory() {
    const divFeedLog = document.getElementById('divFeedLog');
    divFeedLog.innerHTML = '<div class="row">+++ Today +++</div>';

    var todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    var result = await queryFeedHistory(todayDate);

    var wetSum = 0;
    var drySum = 0;

    result.forEach((doc) => {
        const date = dayjs(doc.date.toDate()).format("DD/MMM/YYYY HH:mm");
        const feeder = doc.feeder.toString();
        const fType = doc.type.toString();
        const weight = parseFloat(doc.weight);

        if (fType == 'dry')
            drySum += weight;
        else
            wetSum += weight;

        divFeedLog.innerHTML += '<div class="row">' + date + ' | ' + feeder + ' | ' + fType + ' | ' + weight.toString(); + 'g </div>';
    });

    drySum = drySum.toFixed(1);
    wetSum = wetSum.toFixed(1);

    const lblWet = document.getElementById('lblWetResult');
    const lblDry = document.getElementById('lblDryResult');
    lblWet.textContent = wetSum.toString();
    lblDry.textContent = drySum.toString();
}

async function queryFeedHistory(date) {
    var dateEnd = new Date(date.getTime());
    dateEnd.setHours(23, 59, 59, 999);
    const weightRecord = collection(db, "weight-record");
    const q = query(weightRecord, where("date", ">", date));
    const q2 = query(q, where("date", "<", dateEnd));

    const querySnapshot = await getDocs(q2);
    return querySnapshot.docs.map(doc => doc.data());
}


// ++++++++++ Cookie Section ++++++++++ 
function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function eraseCookie(name) {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

// ++++++++++ END Cookie Section ++++++++++ 
