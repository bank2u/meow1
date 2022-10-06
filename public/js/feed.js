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
    txtFeeder.value = getCookie('feeder');
}, false);

txtFeeder.addEventListener('keyup', (event) => {
    setCookie('feeder', txtFeeder.value);
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

async function getFeedHistory() {
    const weightRecord = collection(db, "weight-record");
    const divFeedLog = document.getElementById('divFeedLog');
    divFeedLog.innerHTML = '';

    var todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    const q2 = query(weightRecord, where("date", ">", todayDate));

    const querySnapshot = await getDocs(q2);
    var wetSum = 0;
    var drySum = 0;

    querySnapshot.forEach((doc) => {
        let docData = doc.data();

        const date = dayjs(docData.date.toDate()).format("DD/MMM/YYYY HH:mm");
        const feeder = docData.feeder.toString();
        const fType = docData.type.toString();
        const weight = parseFloat(docData.weight);

        if (fType == 'dry')
            drySum += weight;
        else
            wetSum += weight;

        divFeedLog.innerHTML += '<div class="row">' + date + ' | ' + feeder + ' | ' + fType + ' | ' + weight.toString(); + 'g </div>';
    });

    const lblWet = document.getElementById('lblWetResult');
    const lblDry = document.getElementById('lblDryResult');
    lblWet.textContent = wetSum.toString();
    lblDry.textContent = drySum.toString();
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
