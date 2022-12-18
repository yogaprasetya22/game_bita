import {getAuth, onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.8.4/firebase-auth.js";
import { getDatabase, ref, set, get, query, orderByChild, limitToLast } from "https://www.gstatic.com/firebasejs/9.8.4/firebase-database.js";

const urlParamString = window.location.search; //mengambil url parameter string dari submit dengan get method
const urlParams = new URLSearchParams(urlParamString); //mengekstrak url parameter string
const pertanyaan = urlParams.get('pertanyaan'); //mengambil url parameter pertanyaan 
const jawabanA = urlParams.get('jawabanA'); //mengambil url parameter jawaban A
const jawabanB = urlParams.get('jawabanB'); //mengambil url parameter jawaban B
const jawabanC = urlParams.get('jawabanC'); //mengambil url parameter jawaban C
const jawabanD = urlParams.get('jawabanD'); //mengambil url parameter jawaban D
const jawabanE = urlParams.get('jawabanE'); //mengambil url parameter jawaban E
const kuncijawaban = urlParams.get('kuncijawaban'); //mengambil url parameter kunci jawaban

(function(){
    //------Authentication --------
    const auth = getAuth();

    //------SignIn Anonymously --------
    signInAnonymously(auth)
    .then(() => {
        
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // ...
        console.log(errorCode, errorMessage);
    })

    const DBSoal = getDatabase();

    let tambahData = (soalRef, DBSoal) => {
        const qry = query(soalRef, orderByChild("no"), limitToLast(1));
        let noAkhir = 0;
        let noUrut = 1 ;
        get(qry)
        .then( (noAkhirSnapshot) => {
            noAkhirSnapshot.forEach( (noSnapshot) => {
                noAkhir = noSnapshot.val().no;
            });
            noUrut = noAkhir + 1;
            let node = `pjk${noUrut}`;
            //console.log(noUrut);

            set(ref(DBSoal, `soalPajak/${node}`), {
                no: noUrut,
                pertanyaan: pertanyaan,
                jawabanA : jawabanA,
                jawabanB : jawabanB,
                jawabanC : jawabanC,
                jawabanD : jawabanD,
                jawabanE : jawabanE,
                kuncijawaban : kuncijawaban
            }).then(() => {
                //----- Simpan data berhasil -----
                alert("Simpan Soal Berhasil");
                window.location.assign("./formtambahpertanyaan.html");
            });
        });
    }

    let idSoal;
    onAuthStateChanged(auth, (soal) => {
        if(soal) {
            idSoal = soal.no;

            //------Connect Database --------         
            let soalRef = ref(DBSoal, `soalPajak`)
           
            get(ref(DBSoal)).then((nodeSnapshot) => {           //-- ambil data root utk periksa apakah sudah ada child (soalPajak)
                if(nodeSnapshot.exists()) {                     //-- kalau sudah ada child (soalPajak)
                    get(soalRef).then((soalPajakSnapshot) => { //-- ambil data paraPemain dari room yang dipilih 
                        if(soalPajakSnapshot.exists()) {             //-- kalau di paraPemain sudah ada data
                            tambahData(soalRef, DBSoal); //panggil fungsi tambahData 
                        }
                        else { //kalau di soalPajak belum ada data, set data soal awal (urutan=1)
                            set(ref(DBSoal, 'soalPajak/PJK1'), {
                                no : 1,
                                pertanyaan : pertanyaan,
                                jawabanA : jawabanA,
                                jawabanB : jawabanB,
                                jawabanC : jawabanC,
                                jawabanD : jawabanD,
                                jawabanE : jawabanE,
                                kuncijawaban : kuncijawaban
                            }).then(() => {
                                //----- Simpan data berhasil -----
                                alert("Simpan Soal Berhasil");
                                window.location.assign("./formtambahpertanyaan.html");
                            });
                        }
                    });
                }
                else {  //-- kalau belum ada child (room), langsung set data pemain baru di room yang dipilih
                    console.log("Data Baru");
                    set(ref(DBSoal, 'soalPajak/PJK1'), {
                        no : 1,
                        pertanyaan : pertanyaan,
                        jawabanA : jawabanA,
                        jawabanB : jawabanB,
                        jawabanC : jawabanC,
                        jawabanD : jawabanD,
                        jawabanE : jawabanE,
                        kuncijawaban : kuncijawaban
                    }).then(() => {
                        //----- Simpan data berhasil -----
                        alert("Simpan Soal Berhasil");
                        window.location.assign("./formtambahpertanyaan.html");
                    });
                }
            })
            // set(kartuRef, {
            //     kartu: "hijau1"
            // }) 
 
        }
    });


})();