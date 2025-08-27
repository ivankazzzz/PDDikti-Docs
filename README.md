# PDDikti Universitas Ekasakti Data Scraper

Aplikasi web scraping untuk mengambil data Universitas Ekasakti dan daftar program studinya dari website PDDikti (Pangkalan Data Pendidikan Tinggi) Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi.

## 📋 Fitur

- ✅ Scraping data Universitas Ekasakti dari website PDDikti
- ✅ Ekstraksi daftar program studi beserta informasinya
- ✅ Export data ke format CSV
- ✅ Error handling dan fallback manual data
- ✅ Browser automation dengan Puppeteer

## 🛠️ Instalasi

1. **Clone atau copy files** ke direktori project Anda

2. **Install dependencies**:
   ```bash
   npm install puppeteer cheerio csv-writer axios
   ```

## 🚀 Cara Penggunaan

### Metode 1: Menggunakan Runner Script (Direkomendasikan)
```bash
node run-scraper.js
```

### Metode 2: Menjalankan Scraper Langsung
```bash
node scraper-v2.js
```

### Metode 3: Menggunakan Scraper Versi Pertama
```bash
node scraper.js
```

## 📁 Output

Script akan menghasilkan file CSV dengan nama: `universitas_ekasakti_prodi.csv`

### Format CSV
| Kolom | Deskripsi |
|-------|-----------|
| Nama Universitas | Nama lengkap universitas |
| Status Universitas | Status (Swasta/Negeri) |
| Akreditasi Universitas | Peringkat akreditasi universitas |
| Nama Program Studi | Nama lengkap program studi |
| Jenjang | Tingkat pendidikan (S1, S2, S3, D3, dll) |
| Akreditasi Program Studi | Peringkat akreditasi program studi |
| Status Program Studi | Status operasional program studi |
| Tanggal Scraping | Tanggal pengambilan data |
| Sumber Data | Sumber data (PDDikti Website Scraping) |

## 🔧 Konfigurasi

### Browser Settings
- Script menggunakan Puppeteer dengan mode **non-headless** untuk debugging
- Untuk production, ubah `headless: false` menjadi `headless: true` di file scraper

### Anti-Detection Features
- User-Agent spoofing
- Viewport setting
- Automation detection removal
- Randomized delays

## 📊 Data yang Diambil

### Informasi Universitas:
- Nama: Universitas Ekasakti
- Status: Swasta
- Akreditasi: B (perlu verifikasi)

### Program Studi (Contoh):
1. Teknik Sipil (S1)
2. Teknik Mesin (S1)
3. Teknik Elektro (S1)
4. Arsitektur (S1)
5. Manajemen (S1)
6. Akuntansi (S1)
7. Ilmu Hukum (S1)
8. Sastra Inggris (S1)
9. Psikologi (S1)

*Note: Data program studi akan diperbarui secara real-time dari website PDDikti*

## 🔍 Troubleshooting

### Error "Browser not found"
```bash
npx puppeteer browsers install chrome
```

### Error "Connection timeout"
- Periksa koneksi internet
- Coba jalankan ulang setelah beberapa menit
- Website PDDikti mungkin sedang maintenance

### Error "No data found"
- Script akan otomatis menggunakan fallback manual data
- Data manual berdasarkan informasi yang tersedia

## 🛡️ Catatan Penting

1. **Rate Limiting**: Script menambahkan delay untuk menghindari blocking
2. **Respectful Scraping**: Menggunakan user-agent yang valid dan tidak overload server
3. **Data Accuracy**: Selalu verifikasi data hasil scraping dengan sumber resmi
4. **Legal Compliance**: Pastikan penggunaan sesuai dengan terms of service website

## 📝 Logs dan Debugging

Script akan menampilkan log detail selama proses:
- 🚀 Browser initialization
- 🌐 Navigation steps
- 🔍 Search operations
- 📊 Data extraction
- 💾 CSV export
- 📸 Screenshot untuk debugging (jika diperlukan)

## 🔄 Versi

- **v1.0** (`scraper.js`): Versi awal dengan pendekatan komprehensif
- **v2.0** (`scraper-v2.js`): Versi optimized dengan fallback dan error handling
- **Runner** (`run-scraper.js`): Script wrapper untuk eksekusi mudah

## 📞 Support

Jika mengalami masalah:
1. Periksa koneksi internet
2. Pastikan dependencies terinstall dengan benar
3. Coba jalankan script dengan node version terbaru
4. Periksa apakah website PDDikti dapat diakses

## ⚖️ Disclaimer

Tool ini dibuat untuk tujuan edukasi dan penelitian. Pastikan penggunaan sesuai dengan ketentuan website PDDikti dan peraturan yang berlaku.