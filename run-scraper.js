#!/usr/bin/env node

const PDDiktiScraper = require('./scraper-v2');

async function runScraper() {
    console.log('='.repeat(60));
    console.log('🎓 PDDikti Universitas Ekasakti Data Scraper');
    console.log('='.repeat(60));
    console.log('');
    
    const scraper = new PDDiktiScraper();
    
    try {
        const result = await scraper.run();
        
        console.log('');
        console.log('='.repeat(60));
        console.log('✅ SCRAPING COMPLETED SUCCESSFULLY!');
        console.log('='.repeat(60));
        console.log('');
        console.log('📊 Summary:');
        console.log(`   📚 University: ${result.data.name}`);
        console.log(`   🏢 Status: ${result.data.status}`);
        console.log(`   🎯 Akreditasi: ${result.data.akreditasi}`);
        console.log(`   📋 Total Program Studi: ${result.data.programs.length}`);
        console.log(`   📁 Output File: ${result.filename}`);
        console.log('');
        console.log('📚 Daftar Program Studi:');
        console.log('-'.repeat(40));
        
        result.data.programs.forEach((program, index) => {
            const jenjang = program.jenjang ? ` (${program.jenjang})` : '';
            const akreditasi = program.akreditasi ? ` - Akreditasi: ${program.akreditasi}` : '';
            console.log(`   ${(index + 1).toString().padStart(2)}. ${program.nama_prodi}${jenjang}${akreditasi}`);
        });
        
        console.log('');
        console.log('🎉 Data berhasil disimpan dalam format CSV!');
        console.log(`📁 Lokasi file: ${result.filename}`);
        console.log('');
        
    } catch (error) {
        console.log('');
        console.log('='.repeat(60));
        console.log('❌ SCRAPING FAILED');
        console.log('='.repeat(60));
        console.log('');
        console.error('Error details:', error.message);
        console.log('');
        console.log('💡 Troubleshooting tips:');
        console.log('   1. Check your internet connection');
        console.log('   2. Ensure the PDDikti website is accessible');
        console.log('   3. Try running the script again in a few minutes');
        console.log('');
        
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\\n\\n🛑 Process interrupted by user');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\\n\\n🛑 Process terminated');
    process.exit(0);
});

// Run the scraper
runScraper();