/**
 * Database Seeding Script (Node.js built-in fetch)
 * 
 * This script pushes the updated player data to Firestore database
 * 
 * Usage: node seedPlayers.js
 */

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const SEED_ENDPOINT = `${BACKEND_URL}/api/admin/seed`;

async function seedDatabase() {
    console.log('🌱 Starting database seeding...');
    console.log(`📍 Backend URL: ${BACKEND_URL}`);
    console.log(`🎯 Endpoint: ${SEED_ENDPOINT}`);
    console.log('');

    try {
        console.log('⏳ Clearing old player data and pushing new data...');
        console.log('   This may take 30-60 seconds...');
        console.log('');

        const response = await fetch(SEED_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ Database seeded successfully!');
            console.log('');
            console.log('📊 Summary:');
            console.log(`   - Total players added: ${data.total || 'N/A'}`);
            console.log(`   - Status: ${data.message || 'Success'}`);
            console.log('');
            console.log('🎉 All player data has been updated in the database!');
            console.log('');
            console.log('Updated categories:');
            console.log('   ✓ Batters');
            console.log('   ✓ Bowlers (including new players)');
            console.log('   ✓ Wicket-keepers');
            console.log('   ✓ All-rounders (including new players)');
        } else {
            console.error('❌ Unexpected response status:', response.status);
            console.error('Response:', data);
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Error seeding database:');
        console.error(`   ${error.message}`);
        console.error('');
        console.error('💡 Troubleshooting:');
        console.error(`   1. Make sure backend is running on ${BACKEND_URL}`);
        console.error('   2. Check if the backend terminal shows any errors');
        console.error('   3. Verify Firebase connection is working');

        process.exit(1);
    }
}

// Run the seeding
seedDatabase();
