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
const btnTopFeeder = document.getElementById('btnTopFeeder');

document.addEventListener('DOMContentLoaded', function () {
    getTodayFeedHistory();
    getLastWeekFeedHistory();
    txtFeeder.value = getCookie('feeder');
}, false);

txtFeeder.addEventListener('keyup', (event) => {
    setCookie('feeder', txtFeeder.value, 31536000);
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

    getTodayFeedHistory();
};

btnTopFeeder.onclick = async function () {
    getTopFeeder();
};

async function getLastWeekFeedHistory() {

    const divYesterday = document.getElementById('divHistoryFeedLog');
    divYesterday.innerHTML = '';

    var sDate = new Date();
    sDate.setDate(sDate.getDate() - 8);

    var eDate = new Date();
    eDate.setDate(eDate.getDate() - 1);

    var result = await queryFeedHistoryByDateRange(sDate, eDate);
    for (var i = 0; i < 7; i++) {
        var date = sDate;
        date.setDate(date.getDate() + 1);
        var date12am = date.setHours(0, 0, 0, 0);
        var date12pm = date.setHours(23, 59, 59, 999);

        var wet = result.filter(x => x.type == 'wet' && x.date.seconds * 1000 > date12am && x.date.seconds * 1000 < date12pm);
        var dry = result.filter(x => x.type == 'dry' && x.date.seconds * 1000 > date12am && x.date.seconds * 1000 < date12pm);
        var dryWeight = dry.reduce((total, obj) => obj.weight + total, 0);
        var wetWeight = wet.reduce((total, obj) => obj.weight + total, 0);

        dryWeight = dryWeight.toFixed(1);
        wetWeight = wetWeight.toFixed(1);

        divYesterday.innerHTML += dayjs(date).format("DD/MMM/YYYY") + " : Dry= " + dryWeight.toString() + "g. , Wet= " + wetWeight.toString() + "g. <br/>";
    }
}

async function getTopFeeder() {

    const divTopFeeder = document.getElementById('divTopFeeder');
    divTopFeeder.innerHTML = '';

    var sDate = new Date(2022, 7, 22);
    var eDate = new Date();

    var result = await queryFeedHistoryByDateRange(sDate, eDate);
    const feeder = ["Bank", "Fah", "Frong", "Paint", "Fern"];

    feeder.forEach((f) => {
        var wet = result.filter(x => x.type == 'wet' && x.feeder == f);
        var dry = result.filter(x => x.type == 'dry' && x.feeder == f);

        var dryWeight = dry.reduce((total, obj) => obj.weight + total, 0);
        var wetWeight = wet.reduce((total, obj) => obj.weight + total, 0);
    
        dryWeight = dryWeight.toFixed(1);
        wetWeight = wetWeight.toFixed(1);
    
        divTopFeeder.innerHTML += f + " : Dry= " + dryWeight.toString() + "g. , Wet= " + wetWeight.toString() + "g. <br/>";
    });


}

async function getTodayFeedHistory() {
    const divTodayFeedLog = document.getElementById('divTodayFeedLog');
    divTodayFeedLog.innerHTML = '<div class="row">+++ Today +++</div>';

    var todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    var result = await queryFeedHistoryByDate(todayDate);

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

        divTodayFeedLog.innerHTML += '<div class="row">' + date + ' | ' + feeder + ' | ' + fType + ' | ' + weight.toString(); + 'g </div>';
    });

    drySum = drySum.toFixed(1);
    wetSum = wetSum.toFixed(1);

    const lblWet = document.getElementById('lblWetResult');
    const lblDry = document.getElementById('lblDryResult');
    lblWet.textContent = wetSum.toString();
    lblDry.textContent = drySum.toString();
}

async function queryFeedHistoryByDate(date) {
    var endDate = new Date(date.getTime());
    endDate.setHours(23, 59, 59, 999);
    const weightRecord = collection(db, "weight-record");
    const q = query(weightRecord, where("date", ">", date));
    const q2 = query(q, where("date", "<", endDate));

    const querySnapshot = await getDocs(q2);
    return querySnapshot.docs.map(doc => doc.data());
}

async function queryFeedHistoryByDateRange(startDate, endDate) {
    var sDate = new Date(startDate.getTime());
    sDate.setHours(0, 0, 0, 0);
    var eDate = new Date(endDate.getTime());
    eDate.setHours(23, 59, 59, 999);

    const weightRecord = collection(db, "weight-record");
    const q = query(weightRecord, where("date", ">", sDate));
    const q2 = query(q, where("date", "<", eDate));

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
