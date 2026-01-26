// ==========================================
// KNOWLEDGE BASE
// ==========================================
const KNOWLEDGE_BASE_DATA = {
  "metadata": {
    "version": "2025.05.10",
    "last_updated": "2025-05-10T10:00:00Z",
    "total_entries": 45,
    "categories": [
      "Pembayaran",
      "Autodebet",
      "Kepesertaan",
      "Klaim",
      "Teknis Aplikasi",
      "Kebijakan & Regulasi",
      "Program Khusus (REHAB)"
    ]
  },
  "kb_entries": [
    // ============================================
    // KATEGORI: PEMBAYARAN
    // ============================================
    {
      "kb_id": "PAY_001",
      "category": "Pembayaran",
      "topic": "Cara Bayar via Virtual Account",
      "keywords": ["bayar", "VA", "virtual account", "transfer"],
      "content": {
        "summary": "Peserta PBPU dapat membayar iuran melalui Virtual Account di berbagai channel.",
        "detail": {
          "virtual_account_format": "**88888 + [11 digit terakhir nomor kartu]**",
          "available_channels": [
            "Mobile Banking (**BCA**, **Mandiri**, **BRI**, **BNI**, **CIMB**, dll)",
            "ATM",
            "**Indomaret/Alfamart**",
            "**Tokopedia/Shopee/Bukalapak**",
            "**GoPay/OVO/DANA**"
          ],
          "processing_time": "**Maksimal 1x24 jam** setelah pembayaran",
          "cut_off_time": "Pembayaran setelah **jam 22:00** akan diproses keesokan hari"
        },
        "faq": [
          {
            "question": "Kalau bayar lewat **Indomaret** gimana?",
            "answer": "Datang ke kasir Indomaret, bilang '**Bayar BPJS**', kasir akan minta nomor VA: **88888 + nomor kartu**. Bayar sesuai nominal tunggakan."
          }
        ]
      },
      "last_verified": "2025-05-01"
    },
    
    {
      "kb_id": "PAY_002",
      "category": "Pembayaran",
      "topic": "Iuran Per Kelas",
      "keywords": ["iuran", "tarif", "kelas 1", "kelas 2", "kelas 3"],
      "content": {
        "summary": "Tarif iuran BPJS Kesehatan berbeda per kelas rawat.",
        "detail": {
          "kelas_1": 150000,
          "kelas_2": 100000,
          "kelas_3": 42000,
          "effective_date": "2024-01-01",
          "note": "Tarif per jiwa per bulan. Untuk keluarga dengan **2 anggota kelas 3** = **Rp84.000/bulan**"
        }
      },
      "last_verified": "2025-05-01"
    },
    
    {
      "kb_id": "PAY_003",
      "category": "Pembayaran",
      "topic": "Pembayaran Tunggakan",
      "keywords": ["tunggakan", "telat bayar", "denda"],
      "content": {
        "summary": "Peserta yang menunggak harus melunasi seluruh tunggakan untuk mengaktifkan kembali kepesertaan.",
        "detail": {
          "rules": [
            "Tunggakan **1 bulan**: Kartu masih aktif, tapi segera bayar",
            "Tunggakan **2 bulan**: Kartu akan nonaktif bulan depan",
            "Tunggakan **3+ bulan**: Kartu nonaktif, tidak bisa klaim sampai lunas"
          ],
          "no_penalty": "**Tidak ada denda** keterlambatan untuk PBPU",
          "reactivation": "Setelah lunas, kartu aktif dalam **1x24 jam**"
        }
      },
      "last_verified": "2025-05-01"
    },
    
    // ============================================
    // KATEGORI: AUTODEBET
    // ============================================
    {
      "kb_id": "AUTO_001",
      "category": "Autodebet",
      "topic": "Cara Daftar Autodebet",
      "keywords": ["autodebet", "daftar", "otomatis", "potong rekening"],
      "content": {
        "summary": "Autodebet memungkinkan iuran terpotong otomatis dari rekening bank.",
        "detail": {
          "registration_steps": [
            "1. Buka aplikasi **Mobile JKN** dengan Link https://play.google.com/store/apps/details?id=app.bpjs.mobile&hl=id",
            "2. Login dengan **NIK** dan **password**",
            "3. Pilih menu '**Menu Lainnya**'",
            "4. Pilih menu '**Pendaftaran Autodebet**'",
            "5. Pilih bank (**BCA/Mandiri/BRI/BNI/CIMB/Permata**)",
            "6. Masukkan **nomor rekening** dan **nomor HP**",
            "7. Ikuti proses verifikasi (**SMS OTP** atau Mobile Banking)",
            "8. Selesai! Autodebet aktif mulai **bulan depan**"
          ],
          "requirements": [
            "Rekening **aktif** atas nama peserta atau kepala keluarga",
            "Saldo **mencukupi** saat tanggal pendebetan",
            "Nomor HP **aktif** untuk notifikasi"
          ],
          "debet_schedule": [
            "Tanggal **1-10**: Autodebet di tanggal **5**",
            "Tanggal **11-20**: Autodebet di tanggal **20**"
          ],
          "supported_banks": [
            "**BCA**", "**Mandiri**", "**BRI**", "**BNI**", "**CIMB Niaga**", 
            "**Permata**", "**Bank DKI**", "**BJB**"
          ]
        },
        "faq": [
          {
            "question": "Kalau saldo **kurang** saat autodebet, gimana?",
            "answer": "**Autodebet gagal**. Peserta harus bayar **manual via VA**. Bulan depan autodebet akan coba lagi otomatis."
          },
          {
            "question": "Bisa ganti rekening autodebet?",
            "answer": "Bisa. Hapus autodebet lama di **Mobile JKN**, lalu daftar ulang dengan rekening baru."
          }
        ]
      },
      "last_verified": "2025-05-01"
    },
    
    {
      "kb_id": "AUTO_002",
      "category": "Autodebet",
      "topic": "Troubleshooting Autodebet Gagal",
      "keywords": ["autodebet gagal", "tidak terpotong", "error"],
      "content": {
        "summary": "Penyebab umum autodebet gagal dan solusinya.",
        "detail": {
          "common_issues": [
            {
              "issue": "**Saldo tidak cukup**",
              "solution": "Pastikan saldo **mencukupi H-1** tanggal pendebetan. Jika gagal, bayar **manual via VA**."
            },
            {
              "issue": "**Rekening diblokir/tidak aktif**",
              "solution": "Hubungi bank untuk aktivasi rekening, lalu daftar ulang autodebet."
            },
            {
              "issue": "**Data rekening salah**",
              "solution": "Hapus autodebet di **Mobile JKN**, daftar ulang dengan data benar."
            },
            {
              "issue": "**Bank sedang maintenance**",
              "solution": "Coba lagi keesokan hari, atau bayar **manual via VA**."
            }
          ]
        }
      },
      "last_verified": "2025-05-01"
    },
    
    // ============================================
    // KATEGORI: KEPESERTAAN
    // ============================================
    {
      "kb_id": "MEMBER_001",
      "category": "Kepesertaan",
      "topic": "Status Kepesertaan",
      "keywords": ["status", "aktif", "nonaktif", "cek kartu"],
      "content": {
        "summary": "Cara mengecek status kepesertaan JKN.",
        "detail": {
          "check_methods": [
            "1. Aplikasi **Mobile JKN** → Menu '**Data Peserta**'",
            "2. Website **BPJS Kesehatan** → Login → **Cek Status**",
            "3. WhatsApp **PANDAWA**: ketik '**Cek Status**' + **NIK**",
            "4. **Call Center 1500400**"
          ],
          "status_types": {
            "aktif": "Iuran **lunas**, bisa klaim",
            "nonaktif": "Ada **tunggakan**, tidak bisa klaim sampai lunas",
            "suspend": "Kartu diblokir karena **tunggakan >6 bulan** atau fraud"
          }
        }
      },
      "last_verified": "2025-05-01"
    },
    
    // ============================================
    // KATEGORI: PROGRAM KHUSUS - REHAB
    // ============================================
    {
      "kb_id": "REHAB_001",
      "category": "Program Khusus",
      "topic": "Program REHAB (Cicilan)",
      "keywords": ["cicilan", "rehab", "angsuran", "nunggak lama"],
      "content": {
        "summary": "Program **REHAB** memungkinkan peserta mencicil tunggakan.",
        "detail": {
          "eligibility": "Tunggakan minimal **3 bulan**",
          "tenor_options": [
            "**3 bulan**",
            "**6 bulan**",
            "**12 bulan**"
          ],
          "example_calculation": { 
            "tunggakan": 420000,
            "tenor": 12,
            "cicilan_per_bulan": 35000,
            "iuran_berjalan": 42000,
            "total_bayar_per_bulan": 77000
          },
          "registration_steps": [
            "1. Buka **Mobile JKN**",
            "2. Pilih menu '**Rencana Pembayaran Bertahap (REHAB)**'",
            "3. Pilih tenor (**3/6/12 bulan**)",
            "4. Sistem akan generate jadwal cicilan",
            "5. Bayar cicilan via **VA** setiap bulan"
          ],
          "important_notes": [
            "Kartu akan aktif setelah cicilan **LUNAS** semua",
            "Jika telat bayar cicilan, harus **restart dari awal**",
            "Iuran bulan berjalan **tetap harus dibayar**"
          ]
        },
        "faq": [
          {
            "question": "Kalau nunggak **12 bulan (Rp504.000)**, bisa cicil berapa?",
            "answer": "Bisa cicil **12x (Rp42.000/bulan)** + iuran berjalan (**Rp42.000**) = **Rp84.000/bulan**."
          },
          {
            "question": "Bisa klaim saat cicilan belum lunas?",
            "answer": "**Tidak bisa**. Kartu aktif setelah cicilan **lunas semua**."
          }
        ]
      },
      "last_verified": "2025-05-01"
    },
    
    // ============================================
    // KATEGORI: TEKNIS APLIKASI
    // ============================================
    {
      "kb_id": "APP_001",
      "category": "Teknis Aplikasi",
      "topic": "Cara Download & Install Mobile JKN",
      "keywords": ["mobile jkn", "aplikasi", "download", "install"],
      "content": {
        "summary": "Panduan download aplikasi **Mobile JKN**.",
        "detail": {
          "android": {
            "link": "https://play.google.com/store/apps/details?id=app.bpjs.mobile&hl=id",
            "min_version": "**Android 5.0**"
          },
          "ios": {
            "link": "https://apps.apple.com/id/app/mobile-jkn/id1237601115",
            "min_version": "**iOS 11.0**"
          },
          "first_time_login": [
            "1. Masukkan **NIK (16 digit)**",
            "2. Masukkan **tanggal lahir (DD-MM-YYYY)**",
            "3. Buat **password baru** (minimal 6 karakter)",
            "4. **Verifikasi email/nomor HP**"
          ]
        }
      },
      "last_verified": "2025-05-01"
    },
    
    // ============================================
    // KATEGORI: KEBIJAKAN & REGULASI
    // ============================================
    {
      "kb_id": "POLICY_001",
      "category": "Kebijakan",
      "topic": "Perbedaan PBI, PBPU, PPU",
      "keywords": ["pbi", "pbpu", "ppu", "jenis peserta"],
      "content": {
        "summary": "Klasifikasi peserta **BPJS Kesehatan**.",
        "detail": {
          "PBI": {
            "full_name": "**Penerima Bantuan Iuran**",
            "description": "Peserta yang iurannya dibayar pemerintah (fakir miskin, orang tidak mampu)",
            "iuran": "**Rp0 (gratis)**",
            "kelas": "**Kelas 3**"
          },
          "PBPU": {
            "full_name": "**Peserta Bukan Penerima Upah**",
            "description": "Peserta mandiri (wiraswasta, freelance, tidak bekerja)",
            "iuran": "**Rp42.000 - Rp150.000/jiwa** (tergantung kelas)",
            "kelas": "Bisa pilih **kelas 1/2/3**"
          },
          "PPU": {
            "full_name": "**Peserta Penerima Upah**",
            "description": "Pekerja formal (PNS, TNI/Polri, pegawai swasta)",
            "iuran": "Dipotong gaji otomatis oleh **pemberi kerja**",
            "kelas": "Sesuai gaji"
          }
        }
      },
      "last_verified": "2025-05-01"
    }
  ]
};

module.exports = { KNOWLEDGE_BASE_DATA };