import {
    getAuth,
    onAuthStateChanged,
    signInAnonymously,
} from "https://www.gstatic.com/firebasejs/9.8.4/firebase-auth.js";
import {
    getDatabase,
    ref,
    set,
    get,
    query,
    orderByChild,
    limitToLast,
    onDisconnect,
    onValue,
    onChildAdded,
    onChildRemoved,
    goOffline,
} from "https://www.gstatic.com/firebasejs/9.8.4/firebase-database.js";

//------Authentication --------
const auth = getAuth();

//------SignIn Anonymously --------
signInAnonymously(auth)
    .then(() => {})
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // ...
        console.log(errorCode, errorMessage);
    });

//------Connect Database --------
const DBGame = getDatabase();

let noSoal, pertanyaanSoal, pilihanJawaban, kunci;
let barisSoalElement;
let tabelSoal = document.querySelector("#tblSoal");

let querySoal = () => {
    const qrySoalKey = query(ref(DBGame, `soalPajak/`), orderByChild("no"));
    get(qrySoalKey).then((dataSoal) => {
        dataSoal.forEach((soal) => {
            noSoal = soal.val().no;
            pertanyaanSoal = soal.val().pertanyaan;
            pilihanJawaban = `A. ${soal.val().jawabanA} <br/>
            B.  ${soal.val().jawabanB} <br/>
            C. ${soal.val().jawabanC} <br/>
            D. ${soal.val().jawabanD} <br/>
            E. ${soal.val().jawabanE} <br/>`;
            kunci = soal.val().kuncijawaban;
            barisSoalElement = document.createElement("tr");
            barisSoalElement.classList.add("barisSoal");
            barisSoalElement.innerHTML = `
                <td>${noSoal}</td>
                <td>${pertanyaanSoal}</td>
                <td>${pilihanJawaban}</td>
                <td>${kunci}</td>
            `;
            tabelSoal.appendChild(barisSoalElement);

            console.log(noSoal);
            console.log(pilihanJawaban);
        });
    });
};

querySoal();

let btnTambahSoal = document.querySelector("#tambahSoal");
btnTambahSoal.addEventListener("click", () => {
    window.location.assign(`./formtambahpertanyaan.html`);
});
