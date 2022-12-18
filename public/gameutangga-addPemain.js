import { getAuth, onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.8.4/firebase-auth.js";
import { getDatabase, ref, set, get, query, orderByChild, limitToLast, onDisconnect, onValue, onChildAdded, onChildRemoved, goOffline } from "https://www.gstatic.com/firebasejs/9.8.4/firebase-database.js";

const urlParamString = window.location.search; //mengambil url parameter string dari submit dengan get method
const urlParams = new URLSearchParams(urlParamString); //mengekstrak url parameter string
const namaJoin = urlParams.get('nama'); //mengambil url parameter nama
const room = urlParams.get('room'); //mengambil url parameter kamar
console.log(namaJoin);
console.log(room);

(function() {

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

    //------Connect Database --------
    const DBGame = getDatabase();

    //------ deklarasi variabel global --------
    let idPemain;
    let nama,
        warna,
        urutan,
        jmlPemain;
    
    let kontainerProfil = document.querySelector("#kontainerProfil");
    let txtRoomName = document.querySelector("#roomName");
    let btnKeluar = document.querySelector("#keluar");
    let btnMasuk = document.querySelector("#masuk");
    let playerElements = {};

    //------ deklarasi Ref --------
    let paraPemainRef = ref(DBGame, `room/${room}/paraPemain/`);
    let roomRef = ref(DBGame, `room/${room}`);

    txtRoomName.innerHTML = room;

    
    //------ fungsi tambah data pemain --------
    let tambahData = (paraPemainRef, pemainRef) => {
        const qry = query(paraPemainRef, orderByChild("urutan"), limitToLast(1));
        let urutanAkhir = 0;
        let noUrut = 1 ;
        let warnaIcon;
        get(qry).then((noUrutSnapshot) => {
            noUrutSnapshot.forEach( (childSnapshot) => {
                urutanAkhir = childSnapshot.val().urutan;
            });
            noUrut = urutanAkhir + 1;
            if(noUrut<=4) {
                switch(noUrut) {
                    case 2: warnaIcon = "merah"; break;
                    case 3: warnaIcon = "kuning"; break;
                    case 4: warnaIcon = "hijau"; break;
                }
    
                set(pemainRef, {
                    uid: idPemain,
                    namaPemain: namaJoin,
                    urutan: noUrut,
                    status: "hidden",
                    icon: warnaIcon,
                    posisi: 0
                }).then(() => {
                    //----- Simpan data berhasil -----
                    alert("Simpan Berhasil");
                });
            }
            else {
                alert("Maaf room sudah penuh");
                window.location.assign("./formUlarTangga.html");
            }
            
        });
    }

    ////------ fungsi menampilkan btnMasuk --------
    let on_offBtnMasuk = (jmlPemain) => {
        if(jmlPemain>1) {
            btnMasuk.style.visibility = "visible";
        } 
        else {
            btnMasuk.style.visibility = "hidden";
        }
    }

    //------ fungsi query para pemain --------
    let queryParaPemain = () => {
        const qryKey = query(paraPemainRef, orderByChild('urutan'), limitToLast(1));
        get(qryKey).then((snapshot) => {
            snapshot.forEach((childSnapShot) => {
                jmlPemain = childSnapShot.val().urutan; //mendapatkan berapa banyak pemain yang ikut
            });
            on_offBtnMasuk(jmlPemain);
        });
    }

    onChildAdded(paraPemainRef, (snapshot) => {
        const pemainBaru = snapshot.val();
        nama = pemainBaru['namaPemain'];
        warna = pemainBaru['icon'];
        urutan = pemainBaru['urutan'];

        //menambah div profil
        const profilElement = document.createElement("div"); //div utk profil
        profilElement.classList.add("profil");
        profilElement.innerHTML = (`
            <div class="profilIcon Character_sprite grid-cell ${warna}" id="pemain${urutan}"></div>
            <span id="nama${urutan}">${nama}</span>
        `);
        playerElements[pemainBaru['uid']] = profilElement; //menyimpan profil ke array playerElements utk keperluan remove
        kontainerProfil.appendChild(profilElement); //memasukkan div profil ke kontainer
        //console.log(kontainerProfil);
        queryParaPemain();

    });
    
    onChildRemoved(paraPemainRef, (snapshot) => {
        const removedUid = snapshot.val().uid;
        kontainerProfil.removeChild(playerElements[removedUid]); //menghapus div profil based on data dari playerElements
        delete playerElements[removedUid]; //menghapus div profil dari playerElements
        queryParaPemain();
    });

    onValue(paraPemainRef, () => {
        
    });

    onAuthStateChanged(auth, (pemain) => {
        if(pemain) {
            idPemain = pemain.uid;

            let pemainRef = ref(DBGame, `room/${room}/paraPemain/` + idPemain);
            
            get(ref(DBGame)).then((DBSnapshot) => {                         //-- ambil data root utk periksa apakah sudah ada child (room)
                if(DBSnapshot.exists()) {                                   //-- kalau sudah ada child (room)
                    get(paraPemainRef).then((paraPemainRefSnapshot) => {    //-- ambil data paraPemain dari room yang dipilih 
                        if(paraPemainRefSnapshot.exists()) {                //-- kalau di paraPemain sudah ada data
                            get(pemainRef).then((pemainRefSnapshot) => {
                                if(pemainRefSnapshot.exists()) {            //-- kalau di pemain belum ada di data paraPemain
                                    alert("Anda sudah terdaftar dalam room 1");
                                }
                                else {
                                    tambahData(paraPemainRef, pemainRef);    //panggil fungsi tambahData
                                }
                            } )                             
                             
                        }
                        else { //kalau di paraPemain belum ada data, set data pemain awal (urutan=1)
                            set(pemainRef, {
                                uid: idPemain,
                                namaPemain: namaJoin,
                                urutan: 1,
                                status: "visible",
                                icon: "biru",
                                posisi: 0
                            }).then(() => {
                                //----- Simpan data berhasil -----
                                alert("Simpan data pemain berhasil");
                            });
                        }
                    });
                }
                else {  //-- kalau belum ada child (room), langsung set data pemain baru di room yang dipilih
                    console.log("Data Baru");
                    set(pemainRef, {
                        uid: idPemain,
                        namaPemain: namaJoin,
                        urutan: 1,
                        status: "visible",
                        icon: "biru",
                        posisi: 0
                    }).then(() => {
                        //----- Simpan data berhasil -----
                        alert("Simpan Berhasil");
                    });
                }
            })
            
            //-- kalau disconnect akan remove pemain
            //onDisconnect(pemainRef).remove();

        }
    });
    
    btnKeluar.addEventListener("click", () => {
        onDisconnect(ref(DBGame, `room/${room}/paraPemain/` + idPemain)).remove();
        //goOffline(DBGame);
        window.location.assign("./formUlarTangga.html");
    });

    btnMasuk.addEventListener("click", () => {
        console.log(idPemain);
        window.location.assign(`./gameutangga.html?parRoom=${room}&parIdPemain=${idPemain}`);
    });

})();