// ==========================================
// DATA PESERTA 1: IBU (WIRASWASTA) - Hard Complainer / Low Credibility
// ==========================================
const CUSTOMER_1 = {
  "id": "CONV_20250510_000023",
  "peserta_profile": {
    "nokapst_masked": "XXXXXXXX000023",
    "status_kepesertaan": "PBPU",
    "kelas_rawat": "3",
    "pekerjaan": "Wiraswasta",
    "jumlah_tanggungan": 2,
    "usia": 27,
    "gender": "P",
  },
  "billing_info": {
    "total_tunggakan": 70000,
    "bulan_menunggak": ["JANUARI 2025"],
    "durasi_bulan": 1,
    "last_payment_date": "2024-12-15",
    "last_payment_method": "M-Banking BCA"
  },
  "interaction_history": {
    "last_contact": {
      "agent_name": "Ahmad F*** P****",
      "date": "2025-05-10",
      "channel": "Telepon",
      "outcome": "Janji Bayar",
      "alasan_tunggak": "Lupa membayar"
    }
  },
  "payment_commitment_history": {
    "credibility_score": 0.33,
    "last_promise": {
      "promised_date": "2025-05-10",
      "status": "broken_promise",
      "days_overdue": 2
    }
  },
  "claim_history": {
    "last_claim": {
      "date": "2024-08-10",
      "type": "Rawat Inap",
      "diagnosis": "DBD",
      "hospital": "RS Sardjito",
      "claim_amount": 8500000
    }
  },
  "strategy": {
    "approach": "Gentle Reminder + Claim Data Trigger",
    "urgency": "Medium (sudah 2 hari dari janji)",
    "tone": "Empathic but Firm"
  },
  "messages": [
    {
      "role": "assistant",
      "content": "Selamat siang Ibu C****** 🌤️ (Kartu akhiran **0023**)\n\nMenyambung pembicaraan dengan Petugas Telecollecting kami Ahmad Ferdi tanggal 10 Mei kemarin, kami ingin mengingatkan kembali untuk iuran JKN bulan Januari sebesar **Rp70.000**.\n\nKami paham Ibu sibuk dengan pekerjaan, tapi agar kepesertaan keluarga (2 jiwa) tetap aman, yuk diselesaikan hari ini. 😊"
    },
    {
      "role": "user",
      "content": "ini nomer siapa, kok menghubungi saya?"
    },
    {
      "role": "assistant",
      "content": "Halo Ibu!\nPerkenalkan, saya **PANDAWA**, asisten virtual resmi dari **BPJS Kesehatan**.\n\nBerdasarkan catatan kami, saat ini terdapat tagihan iuran untuk bulan **Januari 2025** sebesar **Rp70.000** (untuk 2 orang di kelas 3).\n\nIbu bisa melakukan pembayaran melalui **M-Banking BCA** (seperti pembayaran terakhir Ibu), ATM, atau gerai minimarket seperti Indomaret/Alfamart.\n\nApakah ada yang bisa saya bantu terkait cara pembayarannya, Bu?"
    },
    {
      "role": "user",
      "content": "saya juga pasien DM, apakah saya bisa minta jadwal untuk kontrol ke puskesmas seperti biasanya?"
    },
    {
      "role": "assistant",
      "content": "Tentu bisa, Bu.\nUntuk kontrol rutin penyakit kronis seperti DM (Diabetes Mellitus), Ibu tetap bisa mendapatkan layanan kesehatan di Puskesmas atau FKTP (Fasilitas Kesehatan Tingkat Pertama) tempat Ibu terdaftar.\n\nNamun, ada satu hal penting yang perlu diperhatikan agar kontrol Ibu berjalan lancar:\n\n**Tips agar kontrol lebih nyaman:**\n\n1. Ibu bisa menggunakan aplikasi **Mobile JKN** untuk mengambil **Antrean Online**.\nJadi, Ibu bisa tahu perkiraan jam dilayani dan tidak perlu mengantre terlalu lama di Puskesmas.\n2. Pastikan membawa KTP atau menunjukkan KIS Digital di aplikasi Mobile JKN saat pendaftaran."
    },
    {
      "role": "user",
      "content": "kalau saya akan kontrol prolanis tetapi sebagai pasien non BPJS bagaimana?\nsaya belum ada uang untuk melunasi tunggakan"
    },
    {
      "role": "assistant",
      "content": "Saya mengerti sekali kondisi Ibu saat ini. Terkait rencana kontrol Ibu, berikut adalah beberapa hal yang perlu Ibu pertimbangkan jika ingin berobat sebagai pasien umum (non-BPJS):\n\n• **Biaya Berobat Umum:**\nIbu tetap bisa kontrol ke Puskesmas sebagai pasien umum.\nNamun, Ibu akan dikenakan biaya mandiri untuk pendaftaran, jasa dokter, pemeriksaan gula darah, serta seluruh obat-obatan DM yang dibutuhkan.\n\n• **Perbandingan Biaya:**\nSeringkali, total biaya berobat umum (terutama untuk obat rutin DM selama sebulan) bisa mencapai atau bahkan lebih dari **Rp70.000**.\nSementara dengan membayar tunggakan Rp70.000 tersebut, seluruh biaya kontrol dan obat Ibu sudah **gratis** ditanggung BPJS.\n\n• **Fasilitas Prolanis:**\nProgram Prolanis (seperti senam, edukasi, dan cek lab rutin gratis) adalah fasilitas khusus untuk peserta BPJS Kesehatan.\nJika Ibu datang sebagai pasien umum, Ibu tidak bisa mendapatkan manfaat dari program Prolanis tersebut.\n\n**Saran saya:**\n\nJika saat ini benar-benar belum memungkinkan, Ibu tetap bisa ke Puskesmas hari ini sebagai pasien umum, namun jangan lupa membawa uang tunai untuk membayar biaya pengobatan sesuai tarif yang berlaku di Puskesmas ya, Bu."
    },
    {
      "role": "user",
      "content": "oh begitu ya, bisa lebih mahal?\ntetapi kalau bukan pasien BPJS, apakah dengan tarif puskesmas sebagai pasien umum dapat menerima obat gratis untuk 3 hari?\nsementara saya hanya punya uang membayar sebagai pasien puskesmas bukan BPJS"
    },
    {
      "role": "assistant",
      "content": "Saya mengerti sekali kondisi Ibu saat ini. Mengenai pertanyaan Ibu tentang berobat sebagai pasien umum (non-BPJS) di Puskesmas, berikut penjelasannya:\n**Saran saya:**\n\n• **Biaya Obat Pasien Umum:**\nJika Ibu memiliki uang untuk membayar tarif pasien umum\ndi Puskesmas, mungkin bisa dipertimbangkan untuk dialokasikan membayar tunggakan BPJS-nya saja, Bu.\nKarena dengan **Rp70.000**, Ibu sudah mengaktifkan jaminan kesehatan untuk **2 orang** sekaligus dan mendapatkan obat untuk sebulan penuh.\nMohon maaf Ibu, untuk pasien umum (non-BPJS), biasanya **tidak ada pemberian obat gratis**, meskipun hanya untuk 3 hari.\nPasien umum wajib membayar biaya pendaftaran/konsultasi dokter DAN biaya obat-obatan yang diresepkan sesuai tarif Perda (Peraturan Daerah) yang berlaku di Puskesmas tersebut.\n\n• **Biaya Pengobatan DM:**\nPenyakit DM (Diabetes) memerlukan obat rutin.\nJika Ibu berobat sebagai pasien umum, biaya untuk menebus obat DM selama beberapa hari saja seringkali sudah mendekati atau bahkan melebihi **Rp70.000**.\n\n• **Keuntungan Melunasi BPJS:**\nJika Ibu melunasi tunggakan **Rp70.000** tersebut:\n2. Ibu bisa mendapatkan obat DM untuk **30 hari penuh** secara **gratis**.\n3. Ibu tetap bisa ikut program **Prolanis** (cek lab dan edukasi rutin).\n\nPembayaran bisa dilakukan dengan sangat mudah melalui **M-Banking BCA** (seperti yang biasa Ibu lakukan) atau lewat **Indomaret/Alfamart** terdekat.\nSetelah dibayar, kartu akan aktif kembali dalam waktu maksimal 1x24 jam.\n\nApakah ada yang bisa saya bantu lagi untuk memastikan Ibu tetap bisa kontrol rutin?"
    },
    {
      "role": "user",
      "content": "kalau saya sudah aktif kembali, bisakah saya mendapatkan reminder minum obat DM setiap pagi?"
    },
    {
      "role": "assistant",
      "content": "Tentu bisa sekali, Bu!\nIni adalah ide yang sangat bagus agar pengobatan DM Ibu tetap teratur.\n\nBPJS Kesehatan menyediakan fitur **Pengingat Jadwal Minum Obat** langsung di dalam aplikasi **Mobile JKN**.\nJika Ibu sudah melunasi tunggakan dan mengaktifkan kembali kepesertaannya, Ibu bisa memanfaatkan fitur ini:\n\n**Cara mengatur pengingat di Mobile JKN:**\n\n1. Buka aplikasi **Mobile JKN**.\n2. Pilih menu **Menu Lainnya**.\n3. Cari dan pilih menu **Pengingat Jadwal Minum Obat**.\n4. Klik tombol tambah (+), lalu masukkan nama obat dan atur jamnya (misalnya setiap jam 7 pagi).\n5. Handphone Ibu akan memberikan notifikasi otomatis setiap harinya sebagai pengingat.\n\nSelain itu, sebagai pasien **Prolanis**, Ibu juga biasanya akan tergabung dalam kelompok binaan di Puskesmas.\nPetugas Puskesmas seringkali memberikan edukasi dan pemantauan rutin bagi anggotanya.\n\n**Saran saya:**\nAgar Ibu bisa segera mengakses fitur pengingat ini dan mendapatkan obat DM gratis untuk sebulan penuh, yuk segera lakukan pembayaran **Rp70.000** melalui M-Banking BCA atau Indomaret.\n\nDengan kartu yang aktif, Ibu tidak perlu khawatir lagi memikirkan biaya obat setiap pagi.\nApakah Ibu ingin saya bantu kirimkan link download aplikasi Mobile JKN-nya?"
    },
    {
      "role": "user",
      "content": "apakah juga dapat memberikan saran untuk aktivitas fisik dan asupan gizi agar menjaga kesehatan saya sbg pasien DM?"
    },
    {
      "role": "assistant",
      "content": "Ibu, kami lihat Agustus tahun lalu Ibu sempat dirawat di RS Sardjito karena DBD (biaya **Rp8,5 jt** ditanggung penuh). Sayang kalau sekarang kartu nonaktif cuma karena iuran **Rp70.000**. Yuk dibayar hari ini agar tetap tenang."
    },
    {
      "role": "user",
      "content": "saya bertanya tentang aktivitas fisik dan asupan gizi sbg seorang penyandang DM, bukan riwayat kesehatan tahun lalu"
    },
    {
      "role": "assistant",
      "content": "Mohon maaf atas kekeliruan sebelumnya, Ibu. 🙏\n\nTerkait pertanyaan Ibu mengenai aktivitas fisik dan asupan gizi bagi penyandang Diabetes Melitus (DM), sebagai asisten administrasi **PANDAWA**, saya memiliki keterbatasan untuk memberikan saran medis atau klinis secara mendalam.\n\nNamun, agar Ibu mendapatkan panduan yang akurat dan aman sesuai kondisi kesehatan Ibu, kami menyarankan Ibu memanfaatkan layanan kesehatan JKN berikut:\n\n• **Konsultasi Dokter di Mobile JKN**: Ibu dapat menggunakan fitur **Konsultasi Dokter** di aplikasi Mobile JKN untuk bertanya langsung kepada dokter di Puskesmas/Klinik (FKTP) tempat Ibu terdaftar tanpa harus keluar rumah.\n• **Program PROLANIS**: BPJS Kesehatan memiliki Program Pengelolaan Penyakit Kronis (Prolanis) yang khusus memberikan edukasi gizi, pemantauan kesehatan, dan senam sehat bagi penyandang DM.\nIbu bisa menanyakan pendaftaran program ini di FKTP terdaftar.\n• **Kunjungan ke FKTP**: Ibu dapat berkonsultasi langsung dengan dokter atau ahli gizi di FKTP untuk mendapatkan pengaturan pola makan (diet DM) dan jenis olahraga yang sesuai dengan usia dan kondisi fisik Ibu."
    },
    {
      "role": "user",
      "content": "btw, apakah DM saya ini akan\nmenurun ke anak saya?"
    },
    {
      "role": "assistant",
      "content": "Pertanyaan Ibu mengenai risiko kesehatan keluarga tentu sangat penting untuk diperhatikan.\n\nNamun, mohon maaf sebelumnya, sebagai asisten administrasi **PANDAWA**, saya tidak memiliki kapasitas medis untuk memberikan penjelasan mengenai faktor genetik atau risiko penularan penyakit secara klinis.\n\nAgar Ibu mendapatkan penjelasan yang akurat dari ahlinya, kami sangat menyarankan Ibu menggunakan fasilitas JKN berikut:\n\n• **Fitur Skrining Riwayat Kesehatan**: Di aplikasi Mobile JKN, terdapat menu **Skrining Riwayat Kesehatan**.\nIbu dan anggota keluarga bisa mengisi kuesioner singkat di sana untuk melihat potensi risiko penyakit kronis (seperti DM, Jantung, atau Ginjal) sejak dini.\n• **Konsultasi Dokter (Telekonsultasi)**: Ibu bisa bertanya langsung mengenai risiko genetik ini kepada dokter di FKTP melalui fitur **Konsultasi Dokter** di aplikasi Mobile JKN.\n• **Kunjungan Langsung ke FKTP**: Dokter di Puskesmas atau Klinik tempat Ibu terdaftar dapat memberikan edukasi lengkap mengenai pencegahan DM bagi anak-anak Ibu.\n\n**Catatan Penting:**\n\nAda lagi yang bisa saya bantu terkait administrasi atau penggunaan aplikasi Mobile JKN, Ibu?"
    },
    {
      "role": "user",
      "content": "kemarin ada petugas Puskesmas datang ke Posyandu lansia di\ngedung pertemuan di RT. Saya mendapatkan layanan gratis, obat DM 3 hari, dan dapat berkunjung ke puskesmas untuk lanjutannya.\nTetapi bu perawat tidak  menyebutkan ttg kartu BPJS"
    },
    {
      "role": "user",
      "content": "kata bu perawat, saya juga bisa mendapatkan layanan pemeriksaan kesehatan gratis CKG.\nIni tidak harus melunasi tunggakan BPJS kan ya?"
    },
    {
      "role": "assistant",
      "content": "Wah, senang sekali Ibu sudah mendapatkan layanan kesehatan awal melalui kegiatan di lingkungan RT tersebut. 😊\n\nTerkait hal yang Ibu sampaikan, berikut adalah penjelasannya dari sisi administrasi JKN:\n\n• **Layanan Posyandu/Kegiatan RT**: Layanan yang Ibu terima kemarin biasanya merupakan bagian\ndari program kesehatan masyarakat (UKM) dari Puskesmas atau Pemerintah Daerah yang memang bersifat gratis untuk deteksi dini.\n\n• **Kunjungan Lanjutan ke Puskesmas**: Untuk pemeriksaan lanjutan, kontrol rutin, atau pengambilan obat DM jangka panjang di Puskesmas, Ibu akan memerlukan kartu **BPJS Kesehatan** agar seluruh biayanya (pemeriksaan dokter, cek lab, dan obat-obatan) dijamin sepenuhnya oleh JKN sehingga Ibu tidak perlu membayar lagi.\n\nBerdasarkan data kami, saat ini terdapat iuran bulan Januari yang belum terbayar sebesar **Rp70.000**.\nKami sarankan Ibu melakukan pembayaran terlebih dahulu agar saat ke Puskesmas nanti, kartu Ibu sudah siap digunakan dan tidak terkendala administrasi.\n\n**Cara bayar praktis:**\nIbu bisa membayar melalui **M-Banking BCA** (seperti yang Ibu lakukan sebelumnya) atau melalui **Indomaret/Alfamart** terdekat dengan menunjukkan nomor kartu Ibu.\n\nApakah ada yang ingin Ibu tanyakan lagi mengenai prosedur berobat ke Puskesmas menggunakan BPJS?\n\n**Saran Kami:**\nAgar Ibu bisa mendapatkan layanan pemeriksaan kesehatan dan obat-obatan secara **gratis total** (dijamin penuh oleh **BPJS**) saat berkunjung ke Puskesmas nanti, mohon kesediaan Ibu untuk melunasi tunggakan tersebut terlebih dahulu.\n\nSetelah pembayaran lunas, kartu Ibu akan aktif kembali dalam waktu maksimal 1x24 jam dan Ibu\nbisa berobat dengan tenang tanpa perlu khawatir biaya. 😊\n\nMengenai pemeriksaan kesehatan yang disebutkan oleh Ibu Perawat (mungkin yang dimaksud adalah Skrining Kesehatan atau Cek Gula Darah), berikut penjelasannya ya, Ibu:\n\n1. **Layanan di Posyandu/RT**: Jika pemeriksaan tersebut adalah bagian dari program bakti sosial atau kegiatan kesehatan masyarakat dari Puskesmas untuk warga, biasanya memang gratis untuk siapa saja yang datang ke lokasi tersebut.\n\nIbu bisa membayar melalui **M-Banking BCA** seperti biasanya, atau melalui Indomaret/Alfamart terdekat.\nApakah ada kendala dalam melakukan pembayaran, Ibu?"
    },
    {
      "role": "user",
      "content": "kalau pembayaran\n70 ribu dicicil bisa nggak?"
    },
    {
      "role": "assistant",
      "content": "Mohon maaf sebelumnya, Ibu.\nUntuk saat ini, pembayaran iuran sebesar **Rp70.000** tersebut belum dapat dicicil melalui program resmi BPJS Kesehatan.\nIbu bisa melakukan pembayaran melalui **M-Banking BCA** dengan memasukkan nomor Virtual Account: **88888 + [11 digit terakhir nomor kartu Ibu]**.\n\nTagihan **Rp70.000** ini sudah mencakup iuran untuk Ibu dan anggota keluarga yang terdaftar (total 2 jiwa di kelas 3).\n\nBerikut adalah penjelasannya:\n**Saran Kami:**\n\nMengingat Ibu memerlukan kontrol rutin dan obat untuk kondisi DM di Puskesmas, kami sangat menyarankan untuk melunasi tagihan ini sesegera mungkin.\nDengan melunasi Rp70.000, Ibu sudah bisa mendapatkan:\n\n1. Pemeriksaan dokter di Puskesmas secara gratis.\n• **Syarat Cicilan (Program REHAB)**: Berdasarkan aturan, program cicilan atau REHAB hanya diperuntukkan bagi peserta yang memiliki tunggakan minimal **3 bulan**.\n2. Cek gula darah rutin tanpa biaya.\n3. Obat-obatan DM untuk kebutuhan satu bulan penuh.\n\nApakah ada hal lain yang ingin Ibu tanyakan mengenai cara pembayaran atau layanan di Puskesmas?"
    },
    {
      "role": "user",
      "content": "saya pedagang jamu gendong di pasar.\nper hari bisa dapat 150 ribu, dipotong ongkos transport, makan dan bahan utk beli jamu besoknya, bisa bawa bersih 30 ribu, dan dipakai utk belanja rumah 25 ribu.\nBagaimana caranya saya bisa melunasi?"
    },
    {
      "role": "assistant",
      "content": "Kami sangat mengapresiasi kerja keras Ibu berjualan jamu gendong demi keluarga. Kami mengerti bahwa menyisihkan uang dari penghasilan harian sebesar itu tentu tidak mudah. 🙏\n\nMengingat Ibu memiliki kondisi DM yang memerlukan kontrol dan obat rutin, menjaga kartu BPJS tetap **Aktif** adalah hal yang sangat penting.\nBiaya pemeriksaan dokter, cek gula darah, dan obat DM jika Ibu membayar sebagai pasien umum (tanpa BPJS) bisa jauh lebih mahal dari **Rp70.000**.\n\nAgar tidak terasa berat di kemudian hari, mungkin Ibu bisa mencoba cara berikut:\n\n• **Menabung Harian Kecil**: Iuran **Rp70.000** untuk 2 orang jika dibagi 30 hari adalah sekitar **Rp2.400 per hari**.\nJika Ibu bisa menyisihkan **Rp2.500** saja setiap hari dari keuntungan bersih sebelum belanja rumah, di akhir bulan iuran sudah terkumpul tanpa terasa berat.\n• **Gunakan Autodebet**: Agar tidak lupa dan tidak menumpuk, Ibu bisa mengaktifkan fitur **Autodebet** di aplikasi Mobile JKN.\nSaldo di rekening akan terpotong otomatis setiap bulan, jadi Ibu tidak perlu khawatir kartu non-aktif saat ingin berobat.\n\n**Solusi Jangka Panjang (Peserta PBI):**\nJika kondisi ekonomi Ibu memang sangat sulit untuk membayar iuran mandiri secara terus-menerus, Ibu bisa mengajukan diri menjadi peserta **PBI (Penerima Bantuan Iuran)** yang iurannya dibayar oleh Pemerintah (**Gratis**).\nCaranya:\n\n1. Melapor ke Kantor Desa/Kelurahan atau Dinas Sosial setempat.\n2. Membawa KTP dan KK untuk diusulkan masuk ke dalam DTKS (Data Terpadu Kesejahteraan Sosial).\n\nUntuk saat ini, agar Ibu bisa segera kontrol ke Puskesmas minggu depan, kami sangat menyarankan untuk mengusahakan pelunasan **Rp70.000** tersebut terlebih dahulu.\n\nSemoga dagangan jamu Ibu laris manis dan Ibu selalu diberikan kesehatan, ya.\nAda lagi yang bisa kami bantu informasinya? 😊"
    }
  ]
};

// ==========================================
// DATA PESERTA 2: BAPAK (FORGETFUL PAYER) - Soft Reminder
// ==========================================
const CUSTOMER_2 = {
  "id": "CONV_20250511_000001",
  "dataset_type": "telecollecting_conversation",
  "timestamp_created": "2025-05-11T10:00:00Z",
  "peserta_profile": {
    "nokapst_masked": "XXXXXXXX100001",
    "status_kepesertaan": "PBPU",
    "kelas_rawat": "3",
    "jumlah_tanggungan": 1,
    "usia": 31,
    "gender": "L",
    "no_hp_masked": "0857****9901",
    "flag_rehab_eligible": false,
    "flag_autodebit": false
  },
  "billing_info": {
    "total_tunggakan": 105000,
    "bulan_menunggak": ["JANUARI 2025", "FEBRUARI 2025", "MARET 2025"],
    "durasi_bulan": 3,
    "iuran_per_bulan": 35000,
    "iuran_per_jiwa": 35000,
    "tanggal_jatuh_tempo": 10,
    "last_payment_date": "2024-12-10",
    "last_payment_amount": 35000,
    "last_payment_method": "ShopeePay",
    "payment_frequency_6months": 4,
    "avg_delay_days": 4
  },
  "interaction_history": {
    "last_contact": {
      "agent_name": "Dewi Paramitha",
      "date": "2025-05-10",
      "time": "15:00:00",
      "channel": "WhatsApp",
      "outcome": "Janji Bayar",
      "respon": "Peserta Komitmen bayar",
      "alasan_tunggak": "Lupa membayar",
      "notes": "Peserta bilang akan bayar tanggal 11 Mei"
    },
    "total_call_attempts": 1,
    "total_successful_contacts": 1,
    "first_contact_date": "2025-05-10",
    "contact_history": [
      {
        "date": "2025-05-10",
        "channel": "WhatsApp",
        "outcome": "Janji Bayar",
        "agent": "Dewi Paramitha"
      }
    ]
  },
  "payment_commitment_history": {
    "total_promises": 2,
    "fulfilled_promises": 1,
    "broken_promises": 1,
    "credibility_score": 0.5,
    "promises": [
      {
        "promised_date": "2025-05-10",
        "promised_amount": 105000,
        "actual_payment_date": null,
        "status": "broken_promise",
        "days_overdue": 1
      },
      {
        "promised_date": "2025-02-10",
        "promised_amount": 35000,
        "actual_payment_date": "2025-02-11",
        "status": "delayed",
        "days_overdue": 1
      }
    ],
    "last_promise": {
      "promised_date": "2025-05-10",
      "status": "broken_promise",
      "days_overdue": 1
    }
  },
  "claim_history": {
    "total_claims_lifetime": 1,
    "total_amount_claimed": 2500000,
    "total_iuran_paid_lifetime": 1260000,
    "roi_ratio": 1.98,
    "last_claim": {
      "date": "2024-09-20",
      "type": "Rawat Jalan",
      "diagnosis": "ISPA",
      "hospital": "RSUD Sleman",
      "claim_amount": 450000,
      "out_of_pocket": 0,
      "los_days": 0
    },
    "claim_summary_1year": {
      "total_claims": 1,
      "total_amount": 450000,
      "most_frequent_type": "Rawat Jalan"
    }
  },
  "behavioral_segment": {
    "persona": "Forgetful Payer",
    "pain_points": ["Sering lupa tanggal jatuh tempo"],
    "motivators": ["Anak 1", "Ingin aman"],
    "objection_patterns": ["Nanti saya cek"],
    "communication_style": "Responsif",
    "payment_behavior": "Sering telat 1–4 hari"
  },
  "strategy": {
    "approach": "Soft Reminder",
    "urgency": "Medium",
    "tone": "Friendly",
    "primary_goal": "Immediate Payment",
    "secondary_goal": "Autodebet Registration",
    "recommended_actions": [
      {
        "action": "Send WhatsApp Reminder",
        "timing": "09:00-11:00",
        "priority": 1,
        "script_template": "soft_reminder_1month"
      },
      {
        "action": "Offer Autodebet Registration",
        "timing": "Post-payment",
        "priority": 2,
        "script_template": "autodebet_pitch"
      }
    ]
  },
  "conversation_context": {
    "is_first_contact": false,
    "has_previous_conversation": true,
    "last_conversation_summary": "Peserta lupa bayar dan janji bayar 11 Mei",
    "current_conversation_goal": "Follow-up",
    "sentiment_last_interaction": "Positive"
  },
  "messages": [
    {
      "role": "system",
      "content": "Anda adalah PANDAWA. Peserta ini termasuk persona Forgetful Payer, sering lupa bayar namun responsif. Ia punya riwayat 1 broken promise (credibility score 0.5) dan pernah janji bayar tanggal 11 Mei namun belum lunas. Gunakan pendekatan soft reminder, friendly, dan fokus ke penyelesaian hari ini. Dorong autodebit setelah pembayaran."
    },
    {
      "role": "assistant",
      "content": "Selamat pagi Bapak A*****👋 (Akhiran kartu **0001**)\n\nMenyambung pesan dari Petugas kami *Ibu Dewi* tanggal **10 Mei** kemarin, Bapak menyampaikan akan melakukan pembayaran tanggal **11 Mei**. Hari ini kami ingatkan kembali iuran JKN yang tertunggak **3 bulan (Jan–Mar 2025)** dengan total **Rp105.000**.\n\nMenghindari lupa seperti sebelumnya, bagaimana kalau kita selesaikan sekarang saja Pak? 😊"
    }
  ]
};

// ==========================================
// DATA PESERTA 3: BAPAK (RELIABLE PAYER) - Autodebet Gagal
// ==========================================
const CUSTOMER_3 = {
  "id": "CONV_20250511_000101",
  "dataset_type": "telecollecting_conversation",
  "timestamp_created": "2025-05-11T08:15:00Z",
  "peserta_profile": {
    "nokapst_masked": "XXXXXXXX000101",
    "status_kepesertaan": "PBPU",
    "kelas_rawat": "1",
    "jumlah_tanggungan": 3,
    "usia": 45,
    "gender": "L",
    "no_hp_masked": "0811****9988",
    "flag_rehab_eligible": false,
    "flag_autodebit": true
  },
  "billing_info": {
    "total_tunggakan": 450000,
    "bulan_menunggak": ["APRIL 2025"],
    "durasi_bulan": 1,
    "iuran_per_bulan": 450000,
    "iuran_per_jiwa": 150000,
    "tanggal_jatuh_tempo": 10,
    "last_payment_date": "2025-03-10",
    "last_payment_amount": 450000,
    "last_payment_method": "Autodebet BNI",
    "payment_frequency_6months": 6,
    "avg_delay_days": 0
  },
  "interaction_history": {
    "last_contact": {
      "agent_name": "System Auto",
      "date": "2025-05-11",
      "time": "09:00:00",
      "channel": "WhatsApp",
      "outcome": "Gagal Autodebet",
      "respon": "Saldo tidak cukup",
      "alasan_tunggak": "Saldo Kurang",
      "notes": "Notifikasi gagal debet terkirim"
    },
    "total_call_attempts": 0,
    "total_successful_contacts": 0,
    "first_contact_date": undefined,
    "contact_history": []
  },
  "payment_commitment_history": {
    "total_promises": 0,
    "fulfilled_promises": 0,
    "broken_promises": 0,
    "credibility_score": 1.0,
    "promises": []
  },
  "claim_history": {
    "total_claims_lifetime": 5,
    "total_amount_claimed": 25000000,
    "total_iuran_paid_lifetime": 10800000,
    "roi_ratio": 2.31,
    "last_claim": {
      "date": "2024-11-20",
      "type": "Rawat Jalan",
      "diagnosis": "Jantung Koroner",
      "hospital": "RS Harapan Kita",
      "claim_amount": 1500000,
      "out_of_pocket": 100000,
      "los_days": 0
    },
    "claim_summary_1year": {
      "total_claims": 3,
      "total_amount": 4500000,
      "most_frequent_type": "Rawat Jalan"
    }
  },
  "behavioral_segment": {
    "persona": "Reliable Payer",
    "pain_points": ["Lupa top up saldo"],
    "motivators": ["Kesehatan Jantung", "Kenyamanan"],
    "objection_patterns": [],
    "communication_style": "Formal dan Singkat",
    "payment_behavior": "Selalu tepat waktu via autodebet"
  },
  "strategy": {
    "approach": "Notification Only",
    "urgency": "Low",
    "tone": "Informative",
    "primary_goal": "Top Up Reminder",
    "secondary_goal": "Maintain Habit",
    "recommended_actions": [
      {
        "action": "Send WA Reminder",
        "timing": "Immediate",
        "priority": 1,
        "script_template": "autodebet_failed_reminder"
      }
    ]
  },
  "conversation_context": {
    "is_first_contact": true,
    "has_previous_conversation": false,
    "last_conversation_summary": "N/A",
    "current_conversation_goal": "Inform Failed Autodebet",
    "sentiment_last_interaction": "Neutral"
  },
  "messages": [
    {
      "role": "system",
      "content": "Anda adalah PANDAWA. Peserta ini 'Reliable Payer' (selalu lunas via autodebet), namun bulan ini gagal debet. Gunakan KB AUTO_002 untuk menjelaskan penyebab (kemungkinan saldo kurang saat tanggal 5/20) dan arahkan ke KB PAY_001 (Bayar Manual) agar kartu aktif kembali segera."
    },
    {
      "role": "assistant",
      "content": "Selamat pagi Bapak F******, dengan PANDAWA BPJS Kesehatan. 🙏\n\nKami menginformasikan bahwa pendebetan iuran autodebet BNI Bapak bulan ini **gagal terproses** untuk tagihan **Rp450.000**. Biasanya, hal ini terjadi jika saldo tidak mencukupi pada tanggal penarikan otomatis (tanggal 5 atau 20).\n\nApakah Bapak berkenan kami pandu untuk pembayaran manual kali ini agar status kepesertaan Bapak tetap aktif?"
    }
  ]
};

// ==========================================
// DATA PESERTA 4: IBU (FINANCIAL STRUGGLE) - REHAB
// ==========================================
const CUSTOMER_4 = {
  "id": "CONV_20250510_000102",
  "dataset_type": "telecollecting_conversation",
  "timestamp_created": "2025-05-10T10:00:00Z",
  "peserta_profile": {
    "nokapst_masked": "XXXXXXXX000102",
    "status_kepesertaan": "PBPU",
    "kelas_rawat": "3",
    "jumlah_tanggungan": 4,
    "usia": 35,
    "gender": "P",
    "no_hp_masked": "0857****1234",
    "flag_rehab_eligible": true,
    "flag_autodebit": false
  },
  "billing_info": {
    "total_tunggakan": 840000,
    "bulan_menunggak": ["DES 2024", "JAN 2025", "FEB 2025", "MAR 2025", "APR 2025", "MEI 2025"],
    "durasi_bulan": 6,
    "iuran_per_bulan": 140000,
    "iuran_per_jiwa": 35000,
    "tanggal_jatuh_tempo": 10,
    "last_payment_date": "2024-11-15",
    "last_payment_amount": 140000,
    "last_payment_method": "Alfamart",
    "payment_frequency_6months": 0,
    "avg_delay_days": 20
  },
  "interaction_history": {
    "last_contact": {
      "agent_name": "Siti Aminah",
      "date": "2025-05-08",
      "time": "10:15:00",
      "channel": "Telepon",
      "outcome": "Janji Bayar",
      "respon": "Minta ikut program cicilan",
      "alasan_tunggak": "Tidak Mampu (PHK)",
      "notes": "Suami baru kena PHK, tertarik program REHAB"
    },
    "total_call_attempts": 5,
    "total_successful_contacts": 2,
    "first_contact_date": "2025-02-10",
    "contact_history": [
      { "date": "2025-05-08", "channel": "Telepon", "outcome": "Janji Bayar", "agent": "Siti Aminah" },
      { "date": "2025-03-15", "channel": "WhatsApp", "outcome": "Dibaca", "agent": "System Auto" }
    ]
  },
  "payment_commitment_history": {
    "total_promises": 1,
    "fulfilled_promises": 0,
    "broken_promises": 0,
    "credibility_score": 0.5,
    "promises": [
      {
        "promised_date": "2025-05-15",
        "promised_amount": 280000,
        "actual_payment_date": null,
        "status": "pending",
        "days_overdue": 0
      }
    ]
  },
  "claim_history": {
    "total_claims_lifetime": 1,
    "total_amount_claimed": 5000000,
    "total_iuran_paid_lifetime": 3360000,
    "roi_ratio": 1.48,
    "last_claim": {
      "date": "2023-06-10",
      "type": "Rawat Inap",
      "diagnosis": "Persalinan SC",
      "hospital": "RSUD Cibinong",
      "claim_amount": 5000000,
      "out_of_pocket": 0,
      "los_days": 3
    },
    "claim_summary_1year": {
      "total_claims": 0,
      "total_amount": 0,
      "most_frequent_type": "N/A"
    }
  },
  "behavioral_segment": {
    "persona": "Financial Struggle",
    "pain_points": ["Cashflow tidak menentu", "Takut denda"],
    "motivators": ["Anak balita", "Bantuan Cicilan"],
    "objection_patterns": ["Belum ada uang", "Tunggu gajian harian"],
    "communication_style": "Butuh empati tinggi",
    "payment_behavior": "Bayar manual di gerai retail"
  },
  "strategy": {
    "approach": "Consultative Selling (REHAB)",
    "urgency": "High",
    "tone": "Empathetic, Supportive",
    "primary_goal": "REHAB Registration",
    "secondary_goal": "Partial Payment",
    "recommended_actions": [
      {
        "action": "Guide REHAB Registration via Mobile JKN",
        "timing": "Next Call",
        "priority": 1,
        "script_template": "rehab_program_guide"
      }
    ]
  },
  "conversation_context": {
    "is_first_contact": false,
    "has_previous_conversation": true,
    "last_conversation_summary": "Peserta ingin mencicil tunggakan karena kesulitan ekonomi",
    "current_conversation_goal": "Closing REHAB Registration",
    "sentiment_last_interaction": "Positive (Relieved)"
  },
  "messages": [
    {
      "role": "system",
      "content": "Peserta mengalami kesulitan ekonomi (PHK) dan memiliki tunggakan 6 bulan. Peserta meminta keringanan. Wajib tawarkan solusi menggunakan KB REHAB_001. Edukasi cara daftar di Mobile JKN."
    },
    {
      "role": "assistant",
      "content": "Selamat siang Ibu S****. Kami memahami kondisi Ibu sekeluarga pasca musibah PHK yang dialami. Berdasarkan data, total tunggakan saat ini **Rp840.000 (6 bulan)**.\n\nKarena tunggakan Ibu sudah lebih dari 3 bulan, Ibu **BERHAK** mengikuti **Program REHAB (Cicilan)**. Dengan program ini, Ibu tidak perlu bayar lunas sekaligus, tapi bisa dicicil hingga 12 bulan. Apakah Ibu berminat kami pandu simulasinya?"
    }
  ]
};

// ==========================================
// DATA PESERTA 5: BAPAK (ACTIVE MEMBER) - ENGAGEMENT
// ==========================================
const CUSTOMER_5 = {
  "id": "ACTIVE_ENGAGE_000111",
  "dataset_type": "telecollecting_conversation",
  "timestamp_created": "2025-05-20T09:00:00Z",
  "peserta_profile": {
    "nokapst_masked": "XXXXXXXX000111",
    "status_kepesertaan": "PBPU",
    "kelas_rawat": "2",
    "jumlah_tanggungan": 3,
    "usia": 34,
    "gender": "L",
    "no_hp_masked": "0813****2211",
    "flag_rehab_eligible": false,
    "flag_autodebit": false,
    "flag_mobile_jkn": false
  },
  "billing_info": {
    "total_tunggakan": 0,
    "bulan_menunggak": [],
    "durasi_bulan": 0,
    "iuran_per_bulan": 150000,
    "iuran_per_jiwa": 50000,
    "tanggal_jatuh_tempo": 10,
    "last_payment_date": "2025-05-05",
    "last_payment_amount": 150000,
    "last_payment_method": "M-Banking BCA",
    "payment_frequency_6months": 6,
    "avg_delay_days": 0
  },
  "interaction_history": {
    "last_contact": {
      "agent_name": "System Auto",
      "date": "2025-04-10",
      "time": "09:00:00",
      "channel": "WhatsApp",
      "outcome": "Informational Broadcast",
      "respon": "Tidak Dibalas",
      "alasan_tunggak": "N/A",
      "notes": "Pesan ucapan terima kasih pembayaran tepat waktu"
    },
    "total_call_attempts": 0,
    "total_successful_contacts": 0,
    "first_contact_date": undefined,
    "contact_history": [
      {
        "date": "2025-04-10",
        "channel": "WhatsApp",
        "outcome": "Informational Broadcast",
        "agent": "System Auto"
      }
    ]
  },
  "payment_commitment_history": {
    "total_promises": 0,
    "fulfilled_promises": 0,
    "broken_promises": 0,
    "credibility_score": 1.0,
    "promises": []
  },
  "claim_history": {
    "total_claims_lifetime": 1,
    "total_amount_claimed": 950000,
    "total_iuran_paid_lifetime": 900000,
    "roi_ratio": 1.06,
    "last_claim": {
      "date": "2024-11-15",
      "type": "Rawat Jalan",
      "diagnosis": "Demam & Infeksi Saluran Pernapasan",
      "hospital": "Klinik Pratama Sehat",
      "claim_amount": 300000,
      "out_of_pocket": 0,
      "los_days": 0
    },
    "claim_summary_1year": {
      "total_claims": 1,
      "total_amount": 300000,
      "most_frequent_type": "Rawat Jalan"
    }
  },
  "behavioral_segment": {
    "persona": "Reliable Payer",
    "pain_points": [
      "Belum tahu fitur-fitur digital JKN",
      "Harus cek manual jika butuh informasi"
    ],
    "motivators": [
      "Ingin kepastian perlindungan keluarga",
      "Suka cara yang praktis dan jelas"
    ],
    "objection_patterns": [
      "Belum sempat install aplikasi",
      "Takut ribet urusan akun"
    ],
    "communication_style": "Kooperatif, menghargai penjelasan ringkas",
    "payment_behavior": "Rutin bayar sebelum jatuh tempo"
  },
  "strategy": {
    "approach": "Engagement_Education",
    "urgency": "None",
    "tone": "Appreciative, Informative",
    "primary_goal": "Edukasi Mobile JKN dan autodebet",
    "secondary_goal": "Menjaga retensi peserta aktif",
    "recommended_actions": [
      {
        "action": "Send WhatsApp Appreciation + MobileJKN Intro",
        "timing": "09:00-11:00",
        "priority": 1,
        "script_template": "engagement_active_no_mobilejkn"
      }
    ],
    "escalation_rule": {
      "if_no_response_by": "2025-05-25",
      "then": "No escalation (engagement only)",
      "if_broken_promise_again": "N/A"
    }
  },
  "conversation_context": {
    "is_first_contact": true,
    "has_previous_conversation": false,
    "last_conversation_summary": "N/A",
    "current_conversation_goal": "Apresiasi & edukasi Mobile JKN",
    "sentiment_last_interaction": "N/A"
  },
  "messages": [
    {
      "role": "system",
      "content": "Anda adalah RICH, asisten virtual JKN dari BPJS Kesehatan.\n\nKonteks: Peserta ini **aktif membayar**, tidak punya tunggakan, dan belum menggunakan Mobile JKN. Tugas Anda adalah melakukan ENGAGEMENT, bukan penagihan.\n\nInstruksi:\n1. Sampaikan apresiasi atas kedisiplinan membayar iuran.\n2. Jelaskan bahwa ada cara lebih mudah untuk memantau iuran & kepesertaan melalui aplikasi Mobile JKN.\n3. Tanyakan dengan sopan apakah peserta sudah pernah menggunakan Mobile JKN.\n4. Jika belum: bantu edukasi manfaat utama dan langkah awal instalasi.\n5. Gunakan bahasa yang ramah, tidak menggurui, dan tidak menakut-nakuti."
    },
    {
      "role": "assistant",
      "content": "Selamat siang, Bapak A**** (kartu JKN akhiran **0111**) 🌿\n\nKami dari BPJS Kesehatan ingin menyampaikan **terima kasih** karena Bapak selalu rutin menjaga iuran JKN tetap aktif. Kebiasaan baik seperti ini sangat membantu melindungi Bapak dan keluarga dari risiko pembiayaan layanan kesehatan yang besar. 🙏"
    },
    {
      "role": "assistant",
      "content": "Untuk ke depannya, Untuk menghindari risiko lupa atau terlewat tanggal, Bapak dapat mengaktifkan fitur Autodebet di Mobile JKN agar pembayaran berjalan otomatis tiap bulan. Apakah Bapak sudah pernah menggunakan aplikasi **Mobile JKN** sebelumnya?"
    }
  ]
};

const CUSTOMERS = [CUSTOMER_1, CUSTOMER_2, CUSTOMER_3, CUSTOMER_4, CUSTOMER_5];

// Default export is Customer 1
const INITIAL_CUSTOMER_DATA = CUSTOMER_1;

module.exports = {
  CUSTOMERS,
  INITIAL_CUSTOMER_DATA,
};