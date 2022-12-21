  </html>

  <?php
    include "koneksi.php";
    $query = mysqli_query($DB, "select * from website");
    $row_query = mysqli_fetch_array($query);
    $labelform = "Input Data Berita";
    $editlabel = "Simpan";
    if (isset($_POST['bsimpanberita'])) {
        if ($_GET['halbr'] == "editbr") {
            $labelform = "Edit Form Berita";
            $editlabel = "Edit";
            $edit = mysqli_query($DB, "UPDATE data_berita set judulBerita = '$_POST[judul]', jenisKejadian = '$_POST[kejadian]', tgl_berita = '$_POST[tanggalberita]', keteranganBerita = '$_POST[keterangan]' WHERE idBerita = '$_GET[idbr]'");
            if ($edit) {
                echo "<script>
            alert('Edit Data Sukses!');
            document.location='berita.php';
            </script>";
            } else {
                echo "<script>
            alert('Edit Data Gagal!');
            document.location='berita.php';
            </script>";
            }
        } else {
            $simpan = mysqli_query($DB, "INSERT INTO data_berita (judulBerita, jenisKejadian, tgl_berita, keteranganBerita) values ('$_POST[judul]','$_POST[kejadian]','$_POST[tanggalberita]','$_POST[keterangan]')");
            if ($simpan) {
                echo "<script>
            alert('Simpan Data Sukses!');
            document.location='berita.php';
            </script>";
            } else {
                echo "<script>
            alert('Simpan Data Gagal!');
            document.location='berita.php';
            </script>";
            }
        }
    }
    if (isset($_GET['halbr'])) {
        if ($_GET['halbr'] == "editbr") {
            $tampil = mysqli_query($DB, "SELECT * FROM data_berita WHERE idBerita = '$_GET[idbr]'");
            $data = mysqli_fetch_array($tampil);
            $labelform = "Form Edit Berita";
            $editlabel = "Edit";
            if ($data) {
                $vjudul = $data['judulBerita'];
                $vkejadian = $data['jenisKejadian'];
                $vtglberita = $data['tgl_berita'];
                $vketerangan = $data['keteranganBerita'];
            }
        } else if ($_GET['halbr'] == "hapusbr") {
            $hapus = mysqli_query($DB, "DELETE FROM data_berita WHERE idBerita = $_GET[idbr]'");
            if ($hapus) {
                echo "<script>
            alert('Hapus Data Sukses!');
            document.location='berita.php';
            </script>";
            }
        }
    }
    ?>
  <!DOCTYPE html>
  <html lang="en">

  <head>
      <title>Jakarta Disaster Information</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
      <link rel="stylesheet" href="https://www.w3schools.com/lib/w3-themeblack.css">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/fontawesome/4.7.0/css/font-awesome.min.css">
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-Zenh87qX5JnK2Jl0vWa8Ck2rdkQ2Bzep5IDxbcnCeuOxjzrPF/et3URy9Bv1WTRi" crossorigin="anonymous">
      <style>
          html,
          body,
          h1,
          h2,
          h3,
          h4,
          h5,
          h6 {
              font-family: "Roboto", sans-serif;
          }

          .w3-sidebar {
              z-index: 3;
              width: 225px;
              top: 110px;
              bottom: 110px;
              height: 380px;

          }

          .myFooter {
              color: #4CAF50;
              position: fixed;
              left: 0;
              bottom: 100;
              width: 100%;
              text-align: center;
          }
      </style>
  </head>

  <body>
      <!-- Navbar -->
      <div style="margin: auto;">
          <header>
              <img src="<?php echo $row_query['logoWeb'] ?>" alt="" style="width: 10%;">
              <span><?php echo $row_query['namaWeb'] ?>
                  <?php echo $row_query['keteranganWeb'] ?>
                  <?php echo $row_query['alamat'] ?>
          </header>
      </div>
      <!-- Sidebar -->
      <nav class="w3-sidebar w3-bar-block w3-collapse w3-large w3-theme-l5 w3-animate-left" id="mySidebar">
          <a href="javascript:void(0)" onclick="w3_close()" class="w3-right w3-xlarge w3-padding-large w3-hover-black w3-hide-large" title="Close Menu">
              <i class="fa fa-remove"></i>
          </a>
          <a class="w3-bar-item w3-button w3-hover-black" href="Index.php">Home</a>
          <a class="w3-bar-item w3-button w3-hover-black" href="berita.php">Data Berita</a>
          <a class="w3-bar-item w3-button w3-hover-black" href="bencana.php">Data Bencana</a>
          <a class="w3-bar-item w3-button w3-hover-black" href="logout.php">Logout</a>
      </nav>
      <!-- Overlay effect when opening sidebar on small screens -->
      <div class="w3-overlay w3-hide-large" onclick="w3_close()" style="cursor:pointer" title="close side menu" id="myOverlay"></div>
      <!-- Main content: shift it to the right by 250 pixels when the sidebar is visible -->
      <div class="w3-main" style="margin-left:0px">
          <div class="w3-row w3-padding-64">
              <div class="w3-twothird w3-container">
                  <div class="card-header">
                      <p id="tambah"><?php echo $labelform ?></p>
                  </div>
                  <form method="post" action="">
                      <div class="form-group">
                          <label for="judul">Judul Berita</label>
                          <input type="text" name="judul" class="form-control" placeholder="Masukan Judul Berita..." required id="judul" value="<?= @$vjudul;
                                                                                                                                                ?>">
                      </div>
                      <br>
                      <div class="form-group">
                          <label for="kejadian">jenisKejadian</label>
                          <input type="text" name="kejadian" class="formcontrol" placeholder="Masukan Kejadian..." required id="kejadian" value="<?=
                                                                                                                                                    @$vkejadian; ?>">
                      </div>
                      <br>
                      <div class="form-group">
                          <label for="tanggaleberita">Tanggal Berita</label>
                          <input type="text" name="tanggalberita" class="formcontrol" placeholder="Masukan tanggal berita..." required id="tglberita" value="<?= @$vtglberita; ?>">
                      </div>
                      <br>
                      <div class="form-group">
                          <label for="keterangan">Keterangan Berita</label>
                          <textarea name="keterangan" class="form-control" placeholder="Masukan Keterangan Berita" required id="keterangan"><?=
                                                                                                                                            @$vketerangan; ?></textarea>
                      </div>
                      <br>
                      <button type="submit" class="btn btn-primary" name="bsimpanberita"><?php echo $editlabel; ?></button>
                  </form>
                  <br>
                  <table class="table table-striped table-success">
                      <thead>
                          <tr>
                              <th scope="col">No</th>
                              <th scope="col">ID Berita</th>
                              <th scope="col">Judul Berita</th>
                              <th scope="col">Kejadian</th>
                              <th scope="col">Tanggal Berita</th>
                              <th scope="col">Keterangan Berita</th>
                              <th scope="col">Action</th>
                          </tr>
                      </thead>
                      <?php
                        $tampil = mysqli_query($DB, "SELECT * FROM data_berita order by idBerita desc");
                        $no = 1;
                        while ($data = mysqli_fetch_array($tampil)) :
                        ?>
                          <tbody>
                              <tr>
                                  <td><?= $no++; ?></td>
                                  <td><?= $data['idBerita']; ?></td>
                                  <td><?= $data['judulBerita']; ?></td>
                                  <td><?= $data['jenisKejadian']; ?></td>
                                  <td><?= $data['tgl_berita'] ?></td>
                                  <td><?= $data['keteranganBerita']; ?></td>
                                  <td><a href="berita.php?halbr=editbr&idbr=<?= $data['idBerita']; ?>" class="btn btn-warning text-white" onclick="ubah()">EDIT</a>
                                      <a href="berita.php?halbr=hapusbr&idbr=<?= $data['idBerita']; ?>" onclick="return confirm('Apakah Anda Ingin Menghapus Data Ini?')" class="btn btn-danger">HAPUS</a>
                                  </td>
                              </tr>
                          </tbody>
                      <?php endwhile; ?>
                  </table>
              </div>
          </div>
          <!-- Pagination -->
          <footer id="myFooter">
              <div class="w3-container w3-theme-l2 w3-padding-32">
                  <h6>Twitter : <?php echo $row_query['twitter'] ?></h6>
                  <h6>Facebook : <?php echo $row_query['facebook'] ?></h6>
                  <h6>Instagram : <?php echo $row_query['instagram'] ?></h6>
                  <h6 class="w3-right-align"><?php echo $row_query['namaWeb'] ?></h6>
                  <h6 class="w3-right-align"><?php echo $row_query['keteranganWeb'] ?></h6>
              </div>
          </footer>
          <!-- END MAIN -->
      </div>
      <script>
          // Get the Sidebar
          var mySidebar = document.getElementById("mySidebar");
          // Get the DIV with overlay effect
          var overlayBg = document.getElementById("myOverlay");
          // Toggle between showing and hiding the sidebar, and add overlay
          effect

          function w3_open() {
              if (mySidebar.style.display === 'block') {
                  mySidebar.style.display = 'none';
                  overlayBg.style.display = "none";
              } else {
                  mySidebar.style.display = 'block';
                  overlayBg.style.display = "block";
              }
          }
          // Close the sidebar with the close button
          function w3_close() {
              mySidebar.style.display = "none";
              overlayBg.style.display = "none";
          }

          function ubah() {
              document.getElementById("tambah").innerHTML = "UBAH DATA MAHASISWA ";
              document.getElementById("btntambah").value = "UBAH";
          }
      </script>
  </body>

  </html>