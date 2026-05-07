/**
 * Update Base Prices Script
 * 
 * Updates the base price of all players in the source files based on their rank:
 * 5.0 - 5.9: Rs 50
 * 6.0 - 6.9: Rs 100
 * 7.0 - 7.9: Rs 200
 * 8.0 - 8.9: Rs 300
 * 9.0 - 9.9: Rs 400
 */

const fs = require('fs');
const path = require('path');

// File paths and their exported variable names
const files = [
    { name: 'playerdata', path: path.join(__dirname, 'src/auction/playerdata.js'), varName: 'playerdata' },
    { name: 'bowlerdata', path: path.join(__dirname, 'src/auction/bowlerdata.js'), varName: 'bowlerdata' },
    { name: 'wicketdata', path: path.join(__dirname, 'src/auction/wicketdata.js'), varName: 'wicketdata' },
    { name: 'allrounderdata', path: path.join(__dirname, 'src/auction/allrounderdata.js'), varName: 'allrounderdata' }
];

// Helper to determine base price based on rank
function getBasePrice(rank) {
    if (typeof rank !== 'number') return 50;

    if (rank >= 5 && rank <= 5.99) return 50;
    if (rank >= 6 && rank <= 6.99) return 100;
    if (rank >= 7 && rank <= 7.99) return 200;
    if (rank >= 8 && rank <= 8.99) return 300;
    if (rank >= 9 && rank <= 9.99) return 400;

    // Fallbacks
    if (rank < 5) return 30; // Min price
    if (rank >= 10) return 400; // Max price

    return 50;
}

async function updateFiles() {
    console.log('🔄 Starting base price update...');

    for (const file of files) {
        console.log(`📂 Processing ${file.name}...`);

        try {
            // Need to clear cache to ensure we get fresh data if run multiple times
            delete require.cache[require.resolve(file.path)];

            // Require the file to get the data
            let data = require(file.path);

            // Update prices
            let updatedCount = 0;
            data = data.map(player => {
                if (player.rank) {
                    const newBase = getBasePrice(player.rank);
                    // Ensure auction object exists
                    if (!player.auction) player.auction = {};

                    // console.log(`   Player ${player.name} Rank: ${player.rank} -> Base: ${newBase}`);

                    if (player.auction.base !== newBase) {
                        player.auction.base = newBase;
                        updatedCount++;
                    }
                }
                return player;
            });

            console.log(`   Updated ${updatedCount} players in ${file.name}`);

            // Convert back to string and write to file
            const fileContent = `const ${file.varName} = ${JSON.stringify(data, null, 2)};\n\nmodule.exports = ${file.varName};`;

            fs.writeFileSync(file.path, fileContent, 'utf8');
            console.log(`   ✅ Saved ${file.name}`);

        } catch (error) {
            console.error(`   ❌ Error processing ${file.name}:`, error.message);
        }
    }

    console.log('✨ All files processed.');
}

updateFiles();
