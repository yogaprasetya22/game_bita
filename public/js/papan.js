import {Canvas2dGraphics} from './canvas-module.js';
import {getAuth, onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.8.4/firebase-auth.js";
import { getDatabase, ref, set, get, query, orderByChild, limitToLast, onDisconnect, onChildAdded, onChildRemoved, onValue, update } from "https://www.gstatic.com/firebasejs/9.8.4/firebase-database.js";
//----------------------------------------------------------------------------
//mengambil url parameter string dari submit dengan get method
const urlParamString = window.location.search;
const urlParams = new URLSearchParams(urlParamString); //mengekstrak url parameter string
const idPemainJoin = urlParams.get('parIdPemain'); //mengambil url parameter id pemain waktu join
const roomJoin = urlParams.get('parRoom'); //mengambil url parameter room waktu join

//------ Authentication & SignIn Anonymously --------
const auth = getAuth();
signInAnonymously(auth).then(() => {
    // ... sign in sukses
})
.catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    // ...
    console.log(errorCode, errorMessage);
})

//------ Connect Database --------
const DBGame = getDatabase();

//------ deklarasi variabel global --------
let paraPemainRef = ref(DBGame, `room/${roomJoin}/paraPemain/`);
let idPemain;
let nama,
    warna,
    urutan,
    jmlPemain = 0, /*utk dadu */
    status
    ;

let kontainerProfil = document.querySelector("#kontainerProfil");
let btnKeluar = document.querySelector("#keluar");
let playerElemets = {};
let kontainerTombol = document.querySelector("#tombol");
let arrKey = []; //array key (uid) utk dadu
let daftarPemain = {}; //obj utk menampung data para pemain
let tombolObj = {};
let arrSoal = [];

//-- Query soal
const qrySoal = query(ref(DBGame, `soalPajak`), orderByChild('no'));
get(qrySoal).then((qrySoalSnapshot) => {
    qrySoalSnapshot.forEach((soal) => {
        arrSoal[soal.val().no] = soal.val();
    });
});

//-- Fungsi ambil soal dari arrSoal
let ambilSoal = () => {
    let noSoal = Math.floor(Math.random()*arrSoal.length-1)+1; // 1 to panjang arrSoal
    if(noSoal==0) {
        noSoal += 1;
    }
    console.log(`no soal: ${noSoal}`);
    let jawaban = prompt(`${arrSoal[noSoal].pertanyaan} \n A. ${arrSoal[noSoal].jawabanA} \n B. ${arrSoal[noSoal].jawabanB} \n C. ${arrSoal[noSoal].jawabanC} \n D. ${arrSoal[noSoal].jawabanD} \n E. ${arrSoal[noSoal].jawabanE} \n `);
    if(jawaban.toUpperCase() === arrSoal[noSoal].kuncijawaban.toUpperCase()) {
        return true;
    } else {
        return false;
    }
}

//----------------------------------------------------------------------------
const canvas = document.getElementById('canvas'),
      _canvasObj = new Canvas2dGraphics(canvas),
      WIDTH = 700,
      HEIGHT = 700,
      numCol = 10,
      numRow = 10,
      boxSize = WIDTH/numCol,
      player1Color="#81d2f9", /*warna player1 #81d2f9: cyan*/
      player2Color='#991a00', /*warna player2 #ffa290: light red, #991a00: dark red */
      player3Color="#ffff00", /*warna player1 #ffec98: light yellow, #ffff00: kuning stabilo */
      player4Color='#a7ff65' /*warna player2 #a7ff65: lime green */ 
      ;

// variabels
var boxArr = [],
    x = 0,
    y = (numRow-1)*boxSize,
    dir=1,
    snake1 = new Image(), /*** membuat object ular 1 */
    snake2 = new Image(),
    snake3 = new Image(),
    snake4 = new Image(),
    snake5 = new Image(),
    ladder1 = new Image(),
    ladder2 = new Image(),
    ladder3 = new Image(),
    ladder4 = new Image(),
    ladder5 = new Image(),
    player1 = new Player(player1Color,1), /*** membuat object player 1 urutan 1 */
    player2 = new Player(player2Color,2),  /*** membuat object player 2 urutan 2 */
    player3 = new Player(player3Color,3), /*** membuat object player 1 urutan 1 */
    player4 = new Player(player4Color,4),  /*** membuat object player 2 urutan 2 */
    /*** mengatur pergantian pemain jalan dengan true/flase */
    isPlayer1Turn = true, /*** player 1 jalan duluan */
    isPlayer2Turn = false,
    isPlayer3Turn = false,
    isPlayer4Turn = false
    ; 

snake1.src = './img/snake4.png';
snake2.src = './img/snake2.png';
snake3.src = './img/snake3.png';
snake4.src = './img/snake1.png';
snake5.src = './img/snake4.png';
ladder1.src = './img/ladder1.png';
ladder2.src = './img/ladder1.png';
ladder3.src = './img/ladder2.png';
ladder4.src = './img/ladder2.png';
ladder5.src = './img/ladder1.png';

canvas.width = WIDTH;
canvas.height = HEIGHT;

//membuat papan permainan
for(let i=0; i<numCol*numRow; i++){
    boxArr.push(new Box(x, y, boxSize,i));
    x = x+boxSize*dir;
    if(x>=WIDTH || x<=-boxSize){
        dir *= -1;
        x += boxSize*dir;
        y -= boxSize;
    }
}

//player constructor function: player(warna, urutanPlayer)
function Player(color, playerNumber) {
    this.position = 0;
    this.color = color;
    this.playerNumber = playerNumber;
    this.isActive = false; //status player

    //draw Player function
    this.drawPlayer = function() {
        /** 
         * boxArr[1].x = 1 langkah x , boxArr[1].y = 1 langkah y, 
         * boxArr[2].x = 2 langkah x , boxArr[2].y = 2 langkah y,  ...dst 
         */
        let currentPos=boxArr[this.position]; 
        switch(this.playerNumber) {
            case 1: _canvasObj.FillCircle(currentPos.x + currentPos.size/4, currentPos.y + currentPos.size/2.5, boxSize/6, 0, 2*Math.PI, false, this.color);
                break;
            case 2: _canvasObj.FillCircle(currentPos.x + currentPos.size/1.6, currentPos.y + currentPos.size/2.5, boxSize/6, 0, 2*Math.PI, false, this.color);
                break;
            case 3: _canvasObj.FillCircle(currentPos.x + currentPos.size/4, currentPos.y + currentPos.size/1.3, boxSize/6, 0, 2*Math.PI, false, this.color);
                break;
            case 4: _canvasObj.FillCircle(currentPos.x + currentPos.size/1.6, currentPos.y + currentPos.size/1.3, boxSize/6, 0, 2*Math.PI, false, this.color);
                break;
        }

        //---- Naik Tangga
        if(this.position==11) { //---- ladder 4 (11 - 27)
            if(this.playerNumber == urutan) { //---- pertanyaan hanya ditampilkan pd browser player ybs
                if(ambilSoal()) { //---- Kalau jawaban benar maka naik tangga
                    this.position=27;
                }
                else {
                    this.position += 1;
                }
            }
            switch(this.playerNumber) {
                case 1: //---------update posisi naik tangga ---------
                        update(ref(DBGame, `room/${roomJoin}/paraPemain/${arrKey[1]}`), {
                            posisi: this.position
                        });
                        break;
                case 2: //---------update posisi naik tangga---------
                        update(ref(DBGame, `room/${roomJoin}/paraPemain/${arrKey[2]}`), {
                            posisi: this.position
                        });
                        break;
                case 3: //---------update posisi naik tangga---------
                        update(ref(DBGame, `room/${roomJoin}/paraPemain/${arrKey[3]}`), {
                            posisi: this.position
                        });
                        break;
                case 4: //---------update posisi naik tangga---------
                        update(ref(DBGame, `room/${roomJoin}/paraPemain/${arrKey[4]}`), {
                            posisi: this.position
                        });
                        break;
            }
        } else if(this.position==14) { //---- ladder 3 (14 - 34)
            if(this.playerNumber == urutan) { //---- pertanyaan hanya ditampilkan pd browser player ybs
                if(ambilSoal()) { //---- Kalau jawaban benar maka naik tangga
                    this.position=34;
                }
                else {
                    this.position += 1;
                }
            }
            switch(this.playerNumber) {
                case 1: //---------update posisi naik tangga 14 ke 34 ---------
                        update(ref(DBGame, `room/${roomJoin}/paraPemain/${arrKey[1]}`), {
                            posisi: this.position
                        });
                        break;
                case 2: //---------update posisi naik tangga---------
                        update(ref(DBGame, `room/${roomJoin}/paraPemain/${arrKey[2]}`), {
                            posisi: this.position
                        });
                        break;
                case 3: //---------update posisi naik tangga---------
                        update(ref(DBGame, `room/${roomJoin}/paraPemain/${arrKey[3]}`), {
                            posisi: this.position
                        });
                        break;
                case 4: //---------update posisi naik tangga---------
                        update(ref(DBGame, `room/${roomJoin}/paraPemain/${arrKey[4]}`), {
                            posisi: this.position
                        });
                        break;
            }
        } else if(this.position==23) { //---- ladder 1 (23 - 55)
            if(this.playerNumber == urutan) { //---- pertanyaan hanya ditampilkan pd browser player ybs
                if(ambilSoal()) { //---- Kalau jawaban benar maka naik tangga
                    this.position=55;
                }
                else {
                    this.position += 1;
                }
            }
            switch(this.playerNumber) {
                case 1: //---------update posisi naik tangga---------
                        update(ref(DBGame, `room/${roomJoin}/paraPemain/${arrKey[1]}`), {
                            posisi: this.position
                        });
                        break;
                case 2: //---------update posisi naik tangga---------
                        update(ref(DBGame, `room/${roomJoin}/paraPemain/${arrKey[2]}`), {
                            posisi: this.position
                        });
                        break;
                case 3: //---------update posisi naik tangga---------
                        update(ref(DBGame, `room/${roomJoin}/paraPemain/${arrKey[3]}`), {
                            posisi: this.position
                        });
                        break;
                case 4: //---------update posisi naik tangga---------
                        update(ref(DBGame, `room/${roomJoin}/paraPemain/${arrKey[4]}`), {
                            posisi: this.position
                        });
                        break;
            }
        } else if(this.position==49) { //---- ladder 2 (49 - 88)
            if(this.playerNumber == urutan) { //---- pertanyaan hanya ditampilkan pd browser player ybs
                if(ambilSoal()) { //---- Kalau jawaban benar maka naik tangga
                    this.position=88;
                }
                else {
                    this.position += 1;
                }
            }
            switch(this.playerNumber) {
                case 1: //---------update posisi naik tangga---------
                        update(ref(DBGame, `room/${roomJoin}/paraPemain/${arrKey[1]}`), {
                            posisi: this.position
                        });
                        break;
                case 2: //---------update posisi naik tangga---------
                        update(ref(DBGame, `room/${roomJoin}/paraPemain/${arrKey[2]}`), {
                            posisi: this.position
                        });
                        break;
                case 3: //---------update posisi naik tangga---------
                        update(ref(DBGame, `room/${roomJoin}/paraPemain/${arrKey[3]}`), {
                            posisi: this.position
                        });
                        break;
                case 4: this.position=88;
                        //---------update posisi naik tangga---------
                        update(ref(DBGame, `room/${roomJoin}/paraPemain/${arrKey[4]}`), {
                            posisi: this.position
                        });
                        break;
            }
        } else if(this.position==58) { //---- ladder 5 (58 - 81)
            if(this.playerNumber == urutan) { //---- pertanyaan hanya ditampilkan pd browser player ybs
                if(ambilSoal()) { //---- Kalau jawaban benar maka naik tangga
                    this.position=81;
                }
                else {
                    this.position += 1;
                }
            }
            switch(this.playerNumber) {
                case 1: //---------update posisi naik tangga---------
                        update(ref(DBGame, `room/${roomJoin}/paraPemain/${arrKey[1]}`), {
                            posisi: this.position
                        });
                        break;
                case 2: //---------update posisi naik tangga---------
                        update(ref(DBGame, `room/${roomJoin}/paraPemain/${arrKey[2]}`), {
                            posisi: this.position
                        });
                        break;
                case 3: //---------update posisi naik tangga---------
                        update(ref(DBGame, `room/${roomJoin}/paraPemain/${arrKey[3]}`), {
                            posisi: this.position
                        });
                        break;
                case 4: //---------update posisi naik tangga---------
                        update(ref(DBGame, `room/${roomJoin}/paraPemain/${arrKey[4]}`), {
                            posisi: this.position
                        });
                        break;
            }
        }

        //---- Turun dipatuk Ular
        if(this.position==45) { //---- snake 5 (kuning hitam) (45 - 17)
            if(this.playerNumber == urutan) { //---- pertanyaan hanya ditampilkan pd browser player ybs
                if(!ambilSoal()) { //---- Kalau jawaban salah maka turun
                    this.position=17;
                }
                else {
                    this.position += 1;
                }
            }
            switch(this.playerNumber) {
                case 1: //---------update posisi naik tangga---------
                        update(ref(DBGame, `room/${roomJoin}/paraPemain/${arrKey[1]}`), {
                            posisi: this.position
                        });
                        break;
                case 2: //---------update posisi naik tangga---------
                        update(ref(DBGame, `room/${roomJoin}/paraPemain/${arrKey[2]}`), {
                            posisi: this.position
                        });
                        break;
                case 3: //---------update posisi naik tangga---------
                        update(ref(DBGame, `room/${roomJoin}/paraPemain/${arrKey[3]}`), {
                            posisi: this.position
                        });
                        break;
                case 4: //---------update posisi naik tangga---------
                        update(ref(DBGame, `room/${roomJoin}/paraPemain/${arrKey[4]}`), {
                            posisi: this.position
                        });
                        break;
            }
        } else if(this.position==63) { //---- snake 1 (kuning hitam) (63 - 20)
            if(this.playerNumber == urutan) { //---- pertanyaan hanya ditampilkan pd browser player ybs
                if(!ambilSoal()) { //---- Kalau jawaban salah maka turun
                    this.position=20;
                }
                else {
                    this.position += 1;
                }
            }
            switch(this.playerNumber) {
                case 1: //---------update posisi naik tangga---------
                        update(ref(DBGame, `room/${roomJoin}/paraPemain/${arrKey[1]}`), {
                            posisi: this.position
                        });
                        break;
                case 2: //---------update posisi naik tangga---------
                        update(ref(DBGame, `room/${roomJoin}/paraPemain/${arrKey[2]}`), {
                            posisi: this.position
                        });
                        break;
                case 3: //---------update posisi naik tangga---------
                        update(ref(DBGame, `room/${roomJoin}/paraPemain/${arrKey[3]}`), {
                            posisi: this.position
                        });
                        break;
                case 4: //---------update posisi naik tangga---------
                        update(ref(DBGame, `room/${roomJoin}/paraPemain/${arrKey[4]}`), {
                            posisi: this.position
                        });
                        break;
            }
        } else if(this.position==84) { //---- snake 3 (merah hitam) (84 - 52)
            if(this.playerNumber == urutan) { //---- pertanyaan hanya ditampilkan pd browser player ybs
                if(!ambilSoal()) { //---- Kalau jawaban salah maka turun
                    this.position=52;
                }
                else {
                    this.position += 1;
                }
            }
            switch(this.playerNumber) {
                case 1: //---------update posisi naik tangga---------
                        update(ref(DBGame, `room/${roomJoin}/paraPemain/${arrKey[1]}`), {
                            posisi: this.position
                        });
                        break;
                case 2: //---------update posisi naik tangga---------
                        update(ref(DBGame, `room/${roomJoin}/paraPemain/${arrKey[2]}`), {
                            posisi: this.position
                        });
                        break;
                case 3: //---------update posisi naik tangga---------
                        update(ref(DBGame, `room/${roomJoin}/paraPemain/${arrKey[3]}`), {
                            posisi: this.position
                        });
                        break;
                case 4: //---------update posisi naik tangga---------
                        update(ref(DBGame, `room/${roomJoin}/paraPemain/${arrKey[4]}`), {
                            posisi: this.position
                        });
                        break;
            }
        } else if(this.position==93) { //---- snake 4 (biru kuning) (93 - 73)
            if(this.playerNumber == urutan) { //---- pertanyaan hanya ditampilkan pd browser player ybs
                if(!ambilSoal()) { //---- Kalau jawaban salah maka turun
                    this.position=73;
                }
                else {
                    this.position += 1;
                }
            }
            switch(this.playerNumber) {
                case 1: //---------update posisi naik tangga---------
                        update(ref(DBGame, `room/${roomJoin}/paraPemain/${arrKey[1]}`), {
                            posisi: this.position
                        });
                        break;
                case 2: //---------update posisi naik tangga---------
                        update(ref(DBGame, `room/${roomJoin}/paraPemain/${arrKey[2]}`), {
                            posisi: this.position
                        });
                        break;
                case 3: //---------update posisi naik tangga---------
                        update(ref(DBGame, `room/${roomJoin}/paraPemain/${arrKey[3]}`), {
                            posisi: this.position
                        });
                        break;
                case 4: //---------update posisi naik tangga---------
                        update(ref(DBGame, `room/${roomJoin}/paraPemain/${arrKey[4]}`), {
                            posisi: this.position
                        });
                        break;
            }
        } else if(this.position==98) { //---- snake 2 (ungu kuning) (98 - 65)
            if(this.playerNumber == urutan) { //---- pertanyaan hanya ditampilkan pd browser player ybs
                if(!ambilSoal()) { //---- Kalau jawaban salah maka turun
                    this.position=65;
                }
                else {
                    this.position += 1;
                }
            }
            switch(this.playerNumber) {
                case 1: //---------update posisi naik tangga---------
                        update(ref(DBGame, `room/${roomJoin}/paraPemain/${arrKey[1]}`), {
                            posisi: this.position
                        });
                        break;
                case 2: //---------update posisi naik tangga---------
                        update(ref(DBGame, `room/${roomJoin}/paraPemain/${arrKey[2]}`), {
                            posisi: this.position
                        });
                        break;
                case 3: //---------update posisi naik tangga---------
                        update(ref(DBGame, `room/${roomJoin}/paraPemain/${arrKey[3]}`), {
                            posisi: this.position
                        });
                        break;
                case 4: //---------update posisi naik tangga---------
                        update(ref(DBGame, `room/${roomJoin}/paraPemain/${arrKey[4]}`), {
                            posisi: this.position
                        });
                        break;
            }
        }
    }
}

//function to draw image of snake and ladder
function loadSnakeAndLadder(){
    //-- DrawImageWH(imageObj, x, y, width, height)
    _canvasObj.DrawImageWH(snake1,boxSize*0.2, boxSize*3.7,251.6, 250); // kotak 64 to 21
    _canvasObj.DrawImageWH(snake2,boxSize*1.5, boxSize*0.4,300,250); // kotak 99 to 66
    _canvasObj.DrawImageWH(snake3,boxSize*4.4,boxSize*1.2,251,250); // kotak 85 to 53
    _canvasObj.DrawImageWH(snake4,boxSize*6.3, boxSize*0.4, 50, 150); // kotak 94 to 74
    _canvasObj.DrawImageWH(snake5,boxSize*2.4, boxSize*5.5,241.6, 240); // kotak 46 to 18
    _canvasObj.Save(); //-- menyimpan settingan posisi object canvas
    _canvasObj.Rotate(0.3); //-- memutar object canvas sebelum di draw
    _canvasObj.DrawImageWH(ladder1,boxSize*5.3, boxSize*3, 30,220); // kotak 24 to 56
    _canvasObj.Restore(); //-- mengembalikan putaran ke sudut default
    _canvasObj.Save();
    _canvasObj.Rotate(-0.15);
    _canvasObj.DrawImageWH(ladder2,boxSize*8.2,boxSize*2.6,30,320); // kotak 49 to 88
    _canvasObj.Restore();
    _canvasObj.Save();
    // _canvasObj.Rotate(-0.2);
    _canvasObj.DrawImageWH(ladder3,boxSize*5.3, boxSize*6.7, 30,120); // kotak 15 to 35
    _canvasObj.DrawImageWH(ladder5,boxSize*1.3, boxSize*1.5, 30,220); // kotak 59 to 82
    // _canvasObj.Restore();
    _canvasObj.Rotate(-0.6);
    _canvasObj.DrawImageWH(ladder4,boxSize*2, boxSize*10.4, 30,120); // kotak 12 to 28
    _canvasObj.Restore();
    _canvasObj.Save();

}

// function box 
function Box(x, y, size, index){
    this.x = x;
    this.y = y;
    this.size = size;
    this.index = index;

    //Pewarnaan kotak (box)
    if(this.index % 4 ==1){
        this.color='#EDE1CF'; //#f00: pink    
    }else if(this.index % 4 ==2){
        this.color='#76A1A7'; //#0f0: hijau (lime green), #00cc00: hijau
    }else if(this.index % 4 ==3){
        this.color='#D9C5BC'; //#00f: biru 
    }else{
        this.color='#B6ADAF'; //#ffd633: kuning, #cca300: cream dark 
    }
}

//Prototype Draw Box
Box.prototype.drawBox=function(){
    _canvasObj.FillRectangle(this.x, this.y, this.size, this.size,this.color);
    _canvasObj.FillText(this.index+1,this.x+this.size/1.3,this.y+this.size/4,'#fff','10px Arial');
}
      
function drawBoard(){
    boxArr.forEach((b)=>{
        b.drawBox();
    });
}

window.onload = function () {  
    // drawBoard();
    // loadSnakeAndLadder();
    // player1.drawPlayer();
    // player2.drawPlayer();
    // player3.drawPlayer();
    // player4.drawPlayer();
}

/**
 * -------------------------------------------------------------------------
 * ini area firebase
 * -------------------------------------------------------------------------
 */

const w=0; //Hanya agar function dibawah dianggap sbg function

 (function() {
    /**
     * Query data semua pemain untuk menampilkan profil dan dadu
     */
    const qryJmlUrutan = query(paraPemainRef, orderByChild('urutan'));
    get(qryJmlUrutan).then((qryJmlUrutanSnapshot) => {
        qryJmlUrutanSnapshot.forEach((hasil) => {
            arrKey[hasil.val().urutan] = hasil.val().uid;
            jmlPemain = jmlPemain + 1; //mendapatkan berapa banyak pemain yang ikut
        });
    });

    const qryParaPemain = query(paraPemainRef, orderByChild('urutan'));
    get(qryParaPemain).then((qryParaPemainSnapshot) => {
        qryParaPemainSnapshot.forEach((childSnapShot) => {
            /**
             * dibawah ini untuk menampilkan icon profil pemain
             */ 
            const profilElement = document.createElement("div"); //div utk profil
            profilElement.classList.add("profil");
            profilElement.innerHTML = (`
                <div class="profilIcon Character_sprite grid-cell ${childSnapShot.val().icon}" id="pemain${childSnapShot.val().urutan}"></div>
                <span id="nama${childSnapShot.val().urutan}">${childSnapShot.val().namaPemain}</span>
            `);
            //menyimpan profil ke array playerElements utk keperluan remove elementnya kl player keluar
            playerElemets[`${childSnapShot.val().uid}`] = profilElement;
            //memasukkan div profil ke kontainer profil
            kontainerProfil.appendChild(profilElement);

            /**
             * dibawah ini untuk dadu, dadu click listener
             */ 
            if(childSnapShot.val().uid === idPemain) {
                tombolObj[idPemain].addEventListener("click", () => {
                    //panggil fungsi random angka dadu
                    let angka = lemparDadu(childSnapShot.val().urutan);
                    let nextUrutan = childSnapShot.val().urutan + 1;
                    if(nextUrutan>jmlPemain) {
                        nextUrutan = 1;
                        refeshUrutan(arrKey, urutan, nextUrutan, paraPemainRef, angka);
                    }
                    else {
                        refeshUrutan(arrKey, urutan, nextUrutan, paraPemainRef, angka);
                    }
                });
            }
        });
    });

    //-- Fungsi untuk mendapatkan angka saat lempar dadu
    let lemparDadu = (noPemain) => {
        let r = Math.floor(Math.random()*6)+1;//1 to 6;
        console.log(`Angka dadu pemain - ${noPemain}: ${r}`);
        return r;
    };

    //-- Fungsi untuk bergiliran pemain dalam lempar dadu
    let refeshUrutan = (arrKey, parUrutan, nextUrutan, paraPemainRef, parAngka) => {  
        console.log(`Player ${parUrutan} - maju ${parAngka} langkah`)      
        const updates = {};
        let jawaban = "";
        switch(parUrutan) {
            case 1: if(!player1.isActive) {
                        if(ambilSoal()) {
                            player1.isActive = true;
                        }
                    }
                    if(parAngka == 1 && !player1.isActive) {
                        player1.isActive = true; //status player diaktifkan
                    }
                    if(parAngka <= (boxArr.length - 1) - player1.position && player1.isActive) {
                        updates[`/${arrKey[parUrutan]}/posisi`] = player1.position + parAngka; //update data posisi
                    }
                    break;
            case 2: if(!player2.isActive) {
                        if(ambilSoal()) {
                            player2.isActive = true;
                        }
                    }
                    if(parAngka == 1 && !player2.isActive) {
                        player2.isActive = true; //status player diaktifkan
                    }
                    if(parAngka <= (boxArr.length - 1) - player2.position && player2.isActive) {
                        updates[`/${arrKey[parUrutan]}/posisi`] = player2.position + parAngka;
                    }
                    break;
            case 3: if(!player3.isActive) {
                        if(ambilSoal()) {
                            player3.isActive = true;
                        }
                    }
                    if(parAngka == 1 && !player3.isActive) {
                        player3.isActive = true; //status player diaktifkan
                    }
                    if(parAngka <= (boxArr.length - 1) - player3.position && player3.isActive) {
                        updates[`/${arrKey[parUrutan]}/posisi`] = player3.position + parAngka;

                    }
                    break;
            case 4: if(!player4.isActive) {
                        if(ambilSoal()) {
                            player4.isActive = true;
                        }
                    }
                    if(parAngka == 1 && !player4.isActive) {
                        player4.isActive = true; //status player diaktifkan
                    }
                    if(parAngka <= (boxArr.length - 1) - player4.position && player4.isActive) {
                        updates[`/${arrKey[parUrutan]}/posisi`] = player4.position + parAngka;

                    }
                    // if(player4.position==boxArr.length-1){
                    //     alert('Player '+player4.playerNumber+'wins!!!\nPlease press enter to restart the game.');
                    // }
                    break;
        }

        updates[`/${arrKey[parUrutan]}/status`] = 'hidden';  //status tombol pemain skrg di hidden
        updates[`/${arrKey[nextUrutan]}/status`] = 'visible'; //status tombol pemain berikutnya di visible
        update(paraPemainRef, updates);
    }

    /**
     * Untuk set posisi dan draw tiap2 player
     */
    let TheWinnner="";
    let bidakJalan = (parBidak) => {
        drawBoard();
        loadSnakeAndLadder();
        parBidak.forEach((angka, idx, arr) => {
            // console.log(`Player: ${arr[idx].urutan}`)
            switch(arr[idx].urutan) {
                case 1: player1.position = arr[idx].posisi;
                        player1.drawPlayer();
                        if((player1.position)==boxArr.length-1){
                            TheWinnner = arr[idx].namaPemain;
                        }
                        break;
                case 2: player2.position = arr[idx].posisi;
                        player2.drawPlayer();
                        if((player2.position)==boxArr.length-1){
                            // update(ref(DBGame, `room/${roomJoin}}`), {winner: nama}); //update data pemenang
                            TheWinnner = arr[idx].namaPemain;
                        }
                        break;
                case 3: player3.position = arr[idx].posisi;
                        player3.drawPlayer();
                        if((player3.position)==boxArr.length-1){
                            // update(ref(DBGame, `room/${roomJoin}}`), {winner: nama}); //update data pemenang
                            TheWinnner = arr[idx].namaPemain;
                        }
                        break;
                case 4: player4.position = arr[idx].posisi;
                        player4.drawPlayer();
                        if((player4.position)==boxArr.length-1){
                            // update(ref(DBGame, `room/${roomJoin}}`), {winner: nama}); //update data pemenang
                            TheWinnner = arr[idx].namaPemain;
                        }
                        break;
            }
        });
    }

    onValue(paraPemainRef, (paraPemainRefSnapshot) => {
        let arrBidak = [];
        daftarPemain = paraPemainRefSnapshot.val() || {};
        Object.keys(daftarPemain).forEach( (key) => {
            /**
             * Untuk set tombolObj (dadu) tiap2 player
             */
            if(daftarPemain[key].uid === idPemain) {
                urutan = daftarPemain[key].urutan;
                nama = daftarPemain[key].namaPemain;
                status = daftarPemain[key].status;
                tombolObj[key].style.visibility = status;
                tombolObj[key].querySelector("#nama").innerText = nama;
            }
            /**
             * Untuk set posisi dan draw tiap2 player
             */
            arrBidak[daftarPemain[key].urutan] = daftarPemain[key];
        });

        //Untuk set posisi dan draw tiap2 player
         bidakJalan(arrBidak)

         //Kalau ada pemenang
         if(TheWinnner !== "") {
            setTimeout(() => {
                alert(`${TheWinnner} Menang"`);
            }, 750); //delay 0.75 detik
            
         };
    });
    
    onChildRemoved(paraPemainRef, (removedDataSnapshot) => {
        const removedUid = removedDataSnapshot.val().uid;
        //menghapus div profil based on data dari playerElements
        kontainerProfil.removeChild(playerElemets[removedUid]);
        //menghapus div profil dari playerElements
        delete playerElemets[removedUid];
    });

    btnKeluar.addEventListener("click", () => {
        onDisconnect(ref(DBGame, `room/${roomJoin}/paraPemain/` + idPemainJoin)).remove();
        //goOffline(DBGame);
        window.location.assign("./formUlarTangga.html");
    });

    onAuthStateChanged(auth, (pemain) => {
        if(pemain) {
            idPemain = pemain.uid;

            //div untuk dadu
            let tombolElement = document.createElement("div"); 
            tombolElement.id = idPemain;
            tombolElement.innerHTML = (`
                <div class='dadu' id='dadu'></div>
                <div id='nama'></div>
            `)
            tombolElement.style.visibility="hidden";
            //-- Mengisi object atau array tombol dadu dgn idPemain sebagai key/index
            tombolObj[idPemain] =  tombolElement;    
            kontainerTombol.appendChild(tombolElement);
    
    //         //-- kalau disconnect akan remove pemain
    //         onDisconnect(pemainRef).remove();
        }
    });


 })();