const fs = require('fs');
const path = require('path');

// Define the schema for renumbering
// Batters (playerdata) -> Keep 1..199 (No change needed usually, but could safety check)
// Bowlers -> Keep 201..399
// AllRounders -> Remap to 401..599
// WicketKeepers -> Remap to 601..799

const tasks = [
    {
        filename: '../auction/allrounderdata.js',
        startId: 401
    },
    {
        filename: '../auction/wicketdata.js',
        startId: 601
    }
];

tasks.forEach(task => {
    try {
        const filePath = path.join(__dirname, task.filename);
        if (!fs.existsSync(filePath)) {
            console.error(`File not found: ${filePath}`);
            return;
        }

        let content = fs.readFileSync(filePath, 'utf8');
        let count = 0;

        // Regex to find 'id: <number>'
        // This assumes the standard formatting in the file "id: 1,"
        const newContent = content.replace(/id:\s*(\d+)/g, (match, oldId) => {
            // We renumber sequentially based on appearance order to ensure uniqueness
            // and contiguous ranges.
            const newId = task.startId + count;
            count++;
            return `id: ${newId}`;
        });

        fs.writeFileSync(filePath, newContent);
        console.log(`✅ Updated ${task.filename}: Renumbered ${count} items starting from ${task.startId}.`);

    } catch (err) {
        console.error(`❌ Error processing ${task.filename}:`, err);
    }
});
