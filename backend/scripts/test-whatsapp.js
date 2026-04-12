/**
 * WhatsApp Bot Test Script
 *
 * This script helps you test if your WhatsApp bot is working correctly.
 */

require('dotenv').config();
const axios = require('axios');

const PUBLIC_BACKEND_URL = process.env.PUBLIC_BACKEND_URL || 'http://localhost:4000';

console.log('🧪 WhatsApp Bot Test Script');
console.log('========================\n');

// Test 1: Check bot status
async function testBotStatus() {
    console.log('📊 Test 1: Checking bot status...');
    try {
        const response = await axios.get(`${PUBLIC_BACKEND_URL}/api/bot/status`);
        console.log('✅ Bot Status Response:');
        console.log(JSON.stringify(response.data, null, 2));

        if (response.data.whatsapp?.configured) {
            console.log('\n✅ WhatsApp bot appears to be configured!');
        } else {
            console.log('\n⚠️  WhatsApp bot NOT configured yet.');
            console.log('   Please check your .env file has:');
            console.log('   - WHATSAPP_VERIFY_TOKEN');
            console.log('   - WHATSAPP_ACCESS_TOKEN');
            console.log('   - WHATSAPP_PHONE_ID');
        }
    } catch (err) {
        console.log('❌ Error:', err.message);
    }
    console.log('\n');
}

// Test 2: Instructions for manual testing
function showTestInstructions() {
    console.log('📱 Test 2: Manual Testing Instructions');
    console.log('======================================\n');
    console.log('To test your WhatsApp bot:');
    console.log('');
    console.log('1. Open WhatsApp on your phone');
    console.log('2. Send a message to your WhatsApp Business number:');
    console.log('');
    console.log('   /start');
    console.log('');
    console.log('3. You should receive a help menu');
    console.log('');
    console.log('4. Try other commands:');
    console.log('   /accounts');
    console.log('   post @nature-page https://www.instagram.com/reel/C1234567890/');
    console.log('');
    console.log('5. Check server logs for activity');
    console.log('');
}

// Run tests
async function main() {
    await testBotStatus();
    showTestInstructions();

    console.log('🔧 Troubleshooting Tips:');
    console.log('=========================\n');
    console.log('❌ "Webhook not verified":');
    console.log('   - Check webhook URL in Meta dashboard');
    console.log('   - Verify WHATSAPP_VERIFY_TOKEN matches in .env and Meta dashboard');
    console.log('   - Ensure backend is running');
    console.log('');
    console.log('❌ "No response from bot":');
    console.log('   - Check backend logs for errors');
    console.log('   - Verify webhook is subscribed to "messages" field');
    console.log('   - Make sure phone number is verified');
    console.log('');
    console.log('❌ "Connection failed":');
    console.log('   - Check PUBLIC_BACKEND_URL in .env');
    console.log('   - Ensure webhook URL is accessible from internet');
    console.log('');
}

main();
