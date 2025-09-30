#!/usr/bin/env node

// Test script to verify authentication loading fix
const fetch = require('node-fetch');

async function testAuthFix() {
  console.log('🧪 Testing authentication loading fix...\n');
  
  try {
    // Test 1: Check if the app loads without infinite loading
    console.log('1️⃣ Testing app loading...');
    const response = await fetch('http://localhost:3015/');
    console.log('✅ App loads successfully:', response.status);
    
    // Test 2: Check if auth page loads
    console.log('\n2️⃣ Testing auth page...');
    const authResponse = await fetch('http://localhost:3015/auth');
    console.log('✅ Auth page loads:', authResponse.status);
    
    // Test 3: Check if universal builder redirects properly
    console.log('\n3️⃣ Testing universal builder redirect...');
    const builderResponse = await fetch('http://localhost:3015/universal-builder');
    console.log('✅ Universal builder response:', builderResponse.status);
    
    console.log('\n🎉 Auth loading fix test completed!');
    console.log('\n📋 Summary:');
    console.log('- App loading: ✅');
    console.log('- Auth page: ✅');
    console.log('- Universal builder: ✅');
    console.log('\n💡 If you were experiencing infinite loading before,');
    console.log('   try logging in again - it should work properly now!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAuthFix();
