const puppeteer = require('puppeteer');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');

class PDDiktiScraper {
    constructor() {
        this.browser = null;
        this.page = null;
    }

    async init() {
        console.log('🚀 Initializing browser...');
        this.browser = await puppeteer.launch({
            headless: false, // Set to true for production
            defaultViewport: null,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        this.page = await this.browser.newPage();
        
        // Set user agent to avoid blocking
        await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        console.log('✅ Browser initialized successfully');
    }

    async searchUniversity(universityName) {
        console.log(`🔍 Searching for university: ${universityName}`);
        
        try {
            // Navigate to the main search page
            await this.page.goto('https://pddikti.kemdikti.go.id/', { 
                waitUntil: 'networkidle2',
                timeout: 30000 
            });

            console.log('📄 Loaded main page');

            // Wait for and click the university search option
            await this.page.waitForSelector('a[href="/search/pt"]', { timeout: 10000 });
            await this.page.click('a[href="/search/pt"]');
            
            console.log('🏫 Navigated to university search page');

            // Wait for search input and enter university name
            await this.page.waitForSelector('input[type="text"]', { timeout: 10000 });
            await this.page.type('input[type="text"]', universityName);
            
            // Submit search
            await this.page.keyboard.press('Enter');
            
            console.log('🔎 Search submitted');

            // Wait for search results
            await this.page.waitForSelector('.search-result, .result-item, .university-item', { timeout: 15000 });
            
            return await this.extractUniversityData();
            
        } catch (error) {
            console.error('❌ Error during university search:', error.message);
            throw error;
        }
    }

    async extractUniversityData() {
        console.log('📊 Extracting university data...');
        
        try {
            // Wait a bit for content to load
            await this.page.waitForTimeout(2000);

            // Extract university data from search results
            const universityData = await this.page.evaluate(() => {
                const results = [];
                
                // Try different possible selectors for university results
                const selectors = [
                    '.search-result',
                    '.result-item', 
                    '.university-item',
                    'div[class*="result"]',
                    'div[class*="university"]',
                    '.card',
                    '.list-group-item'
                ];

                let universityElements = [];
                
                for (const selector of selectors) {
                    universityElements = document.querySelectorAll(selector);
                    if (universityElements.length > 0) break;
                }

                universityElements.forEach((element, index) => {
                    const nameElement = element.querySelector('h3, h4, h5, .title, .name, a[href*="pt"]');
                    const linkElement = element.querySelector('a[href*="pt"]') || element.querySelector('a');
                    
                    if (nameElement) {
                        const name = nameElement.textContent.trim();
                        const link = linkElement ? linkElement.href : null;
                        
                        // Look for additional info
                        const infoText = element.textContent;
                        const akreditasi = infoText.match(/akreditasi[:\s]*([A-C])/i)?.[1] || '';
                        const status = infoText.match(/(negeri|swasta)/i)?.[1] || '';
                        
                        results.push({
                            name,
                            link,
                            akreditasi,
                            status,
                            index
                        });
                    }
                });

                return results;
            });

            console.log(`📋 Found ${universityData.length} university results`);
            
            // Find Universitas Ekasakti specifically
            const ekasaktiData = universityData.find(uni => 
                uni.name.toLowerCase().includes('ekasakti') || 
                uni.name.toLowerCase().includes('eka sakti')
            );

            if (!ekasaktiData) {
                console.log('❌ Universitas Ekasakti not found in search results');
                console.log('Available universities:', universityData.map(u => u.name));
                throw new Error('Universitas Ekasakti not found');
            }

            console.log('✅ Found Universitas Ekasakti:', ekasaktiData.name);
            return ekasaktiData;
            
        } catch (error) {
            console.error('❌ Error extracting university data:', error.message);
            throw error;
        }
    }

    async extractStudyPrograms(universityLink) {
        console.log('📚 Extracting study programs...');
        
        try {
            // Navigate to university detail page
            await this.page.goto(universityLink, { 
                waitUntil: 'networkidle2',
                timeout: 30000 
            });

            console.log('📄 Loaded university detail page');

            // Wait for page content to load
            await this.page.waitForTimeout(3000);

            // Look for study programs section or link
            const prodiData = await this.page.evaluate(() => {
                const programs = [];
                
                // Try to find study programs table or list
                const selectors = [
                    'table tr',
                    '.prodi-item',
                    '.program-item',
                    'div[class*="prodi"]',
                    'div[class*="program"]',
                    '.list-group-item'
                ];

                let programElements = [];
                
                for (const selector of selectors) {
                    programElements = document.querySelectorAll(selector);
                    if (programElements.length > 1) break; // More than header row
                }

                programElements.forEach((element, index) => {
                    const text = element.textContent.trim();
                    
                    // Skip empty or header rows
                    if (!text || text.toLowerCase().includes('program studi') || 
                        text.toLowerCase().includes('nama prodi') || index === 0) return;

                    // Extract program name and other details
                    const cells = element.querySelectorAll('td, .cell, .col');
                    
                    if (cells.length > 0) {
                        const programName = cells[0]?.textContent?.trim() || text;
                        const jenjang = cells[1]?.textContent?.trim() || '';
                        const akreditasi = cells[2]?.textContent?.trim() || '';
                        const status = cells[3]?.textContent?.trim() || '';
                        
                        if (programName && programName.length > 3) {
                            programs.push({
                                nama_prodi: programName,
                                jenjang: jenjang,
                                akreditasi: akreditasi,
                                status: status
                            });
                        }
                    } else if (text.length > 3) {
                        // If no table structure, try to parse text
                        programs.push({
                            nama_prodi: text,
                            jenjang: '',
                            akreditasi: '',
                            status: ''
                        });
                    }
                });

                return programs;
            });

            console.log(`📊 Found ${prodiData.length} study programs`);
            return prodiData;
            
        } catch (error) {
            console.error('❌ Error extracting study programs:', error.message);
            
            // Try alternative approach - look for "Prodi" or "Program Studi" links
            try {
                const prodiLinks = await this.page.evaluate(() => {
                    const links = Array.from(document.querySelectorAll('a'));
                    return links
                        .filter(link => 
                            link.textContent.toLowerCase().includes('prodi') ||
                            link.textContent.toLowerCase().includes('program studi')
                        )
                        .map(link => ({ text: link.textContent, href: link.href }));
                });

                if (prodiLinks.length > 0) {
                    console.log('🔗 Found program study links, trying alternative extraction...');
                    // Navigate to first prodi link and extract data
                    await this.page.goto(prodiLinks[0].href, { waitUntil: 'networkidle2' });
                    return await this.extractStudyPrograms(prodiLinks[0].href);
                }
            } catch (altError) {
                console.error('❌ Alternative extraction also failed:', altError.message);
            }
            
            throw error;
        }
    }

    async exportToCSV(universityData, studyPrograms, filename = 'universitas_ekasakti_data.csv') {
        console.log('💾 Exporting data to CSV...');
        
        try {
            const csvData = studyPrograms.map(program => ({
                universitas: universityData.name,
                universitas_status: universityData.status,
                universitas_akreditasi: universityData.akreditasi,
                nama_program_studi: program.nama_prodi,
                jenjang: program.jenjang,
                akreditasi_prodi: program.akreditasi,
                status_prodi: program.status,
                tanggal_scraping: new Date().toISOString().split('T')[0]
            }));

            const csvWriter = createCsvWriter({
                path: filename,
                header: [
                    { id: 'universitas', title: 'Universitas' },
                    { id: 'universitas_status', title: 'Status Universitas' },
                    { id: 'universitas_akreditasi', title: 'Akreditasi Universitas' },
                    { id: 'nama_program_studi', title: 'Nama Program Studi' },
                    { id: 'jenjang', title: 'Jenjang' },
                    { id: 'akreditasi_prodi', title: 'Akreditasi Prodi' },
                    { id: 'status_prodi', title: 'Status Prodi' },
                    { id: 'tanggal_scraping', title: 'Tanggal Scraping' }
                ]
            });

            await csvWriter.writeRecords(csvData);
            console.log(`✅ Data exported to ${filename}`);
            console.log(`📊 Total records: ${csvData.length}`);
            
            return filename;
            
        } catch (error) {
            console.error('❌ Error exporting to CSV:', error.message);
            throw error;
        }
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            console.log('🔒 Browser closed');
        }
    }

    // Main scraping method
    async scrapeUniversitasEkasakti() {
        try {
            await this.init();
            
            // Search for Universitas Ekasakti
            const universityData = await this.searchUniversity('Universitas Ekasakti');
            
            if (!universityData.link) {
                throw new Error('University link not found');
            }
            
            // Extract study programs
            const studyPrograms = await this.extractStudyPrograms(universityData.link);
            
            if (studyPrograms.length === 0) {
                console.log('⚠️ No study programs found, creating sample data...');
                // Create sample data structure for manual verification
                const samplePrograms = [
                    { nama_prodi: 'Data not available - Please verify manually', jenjang: '', akreditasi: '', status: '' }
                ];
                studyPrograms.push(...samplePrograms);
            }
            
            // Export to CSV
            const filename = await this.exportToCSV(universityData, studyPrograms);
            
            console.log('🎉 Scraping completed successfully!');
            return { universityData, studyPrograms, filename };
            
        } catch (error) {
            console.error('💥 Scraping failed:', error.message);
            throw error;
        } finally {
            await this.close();
        }
    }
}

// Run the scraper
async function main() {
    const scraper = new PDDiktiScraper();
    
    try {
        console.log('🎯 Starting PDDikti scraper for Universitas Ekasakti...');
        const result = await scraper.scrapeUniversitasEkasakti();
        
        console.log('\n📋 Scraping Summary:');
        console.log(`University: ${result.universityData.name}`);
        console.log(`Study Programs Found: ${result.studyPrograms.length}`);
        console.log(`CSV File: ${result.filename}`);
        
    } catch (error) {
        console.error('\n💥 Scraping failed with error:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = PDDiktiScraper;