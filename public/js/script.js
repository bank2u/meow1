import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.4/firebase-app.js";
import { getFirestore, collection, doc, getDocs, setDoc, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.9.4/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDB1Eg-cLKhMRvkLcujhd1QyAMxEbubBFQ",
    authDomain: "meow1-fip.firebaseapp.com",
    databaseURL: "https://meow1-fip-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "meow1-fip",
    storageBucket: "meow1-fip.appspot.com",
    messagingSenderId: "286369200157",
    appId: "1:286369200157:web:9def9ef4a7412aab652ef4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const injectRecord = collection(db, "inject-record");


var lblPosition = document.getElementById("lblPosition");
var imgPosition = document.getElementById("imgPosition");
var now = new Date();
var start = new Date(now.getFullYear(), 0, 0);
var diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
var oneDay = 1000 * 60 * 60 * 24;
var dayOfYear = Math.floor(diff / oneDay);
var position = (dayOfYear % 6) + 1;
lblPosition.textContent = position;
imgPosition.src = "./img/" + position + ".jpg";

var lblDayOf = document.getElementById("lblDayOf");
var dateStart = dayjs('2022-08-15');
var today = dayjs();
var dayOf = today.diff(dateStart, 'day') + 1;
lblDayOf.textContent = dayOf;

var txtWeight = document.getElementById("txtWeight");
var lblResult = document.getElementById("lblResult");
txtWeight.onkeyup = function (e) {
    if (txtWeight.value.length != 0) {

        var weight = parseFloat(txtWeight.value);
        var doseVolume = weight * 8 / 30;
        lblResult.textContent = doseVolume.toFixed(2);
    }
};

var btnInject = document.getElementById("btnInject");
var lblLastInject = document.getElementById("lblLastInject");
var lblNextInject = document.getElementById("lblNextInject");

btnInject.onclick = async function () {
    if (txtWeight.value.length == 0) {
        alert('ใส่น้ำหนัก ม.เหมียว ก่อนนะ !!!');
    } else {
        if (confirm('Do you want to Log [ Day: ' + dayOf + ', Time: ' + dayjs().format("DD/MMM/YYYY hh:mm") + ' ]')) {
            await setDoc(doc(db, "inject-record", dayOf.toString()), {
                day: dayOf,
                time: new Date(),
                weight: parseFloat(txtWeight.value)
            });

            getLastInject();
        }
    }
};

async function getLastInject() {
    var data;
    const q = query(injectRecord, orderBy("day", "desc"), limit(1));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        data = querySnapshot.docs[0].data()
    }

    lblLastInject.textContent = dayjs(data.time.toDate()).format("DD/MMM/YYYY HH:mm");
    getNextInject(data.time.toDate());
}

async function getNextInject(lastInject) {
    const nextDay = dayjs(lastInject).add(1, 'd');
    const minDateTime = dayjs(nextDay).add(-2, 'h');
    const maxDateTime = dayjs(nextDay).add(2, 'h');

    lblNextInject.textContent = dayjs(minDateTime).format("DD/MMM/YYYY HH:mm")
        + ' - ' + dayjs(maxDateTime).format("HH:mm");

    if (dayjs().isBefore(maxDateTime) && dayjs().isAfter(minDateTime)){
        lblNextInject.classList.add("bg-success");
        lblNextInject.classList.remove("bg-danger");

    } else {
        lblNextInject.classList.add("bg-danger");
        lblNextInject.classList.remove("bg-success");
    }
}

getLastInject();
