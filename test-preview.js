#!/usr/bin/env node

// Test script to verify preview URL generation
const fetch = require('node-fetch');

async function testPreviewUrl() {
  console.log('🧪 Testing preview URL generation...\n');
  
  try {
    // Test 1: List workspaces
    console.log('1️⃣ Testing workspace listing...');
    const workspacesResponse = await fetch('http://localhost:3014/api/daytona/workspaces');
    const workspaces = await workspacesResponse.json();
    console.log('✅ Workspaces:', workspaces.length, 'found');
    
    if (workspaces.length > 0) {
      const workspace = workspaces[0];
      console.log('📋 First workspace:', {
        id: workspace.id,
        name: workspace.name,
        status: workspace.status
      });
      
      // Test 2: Get workspace details
      console.log('\n2️⃣ Testing workspace details...');
      const detailsResponse = await fetch(`http://localhost:3014/api/daytona/workspaces/${workspace.id}`);
      const details = await detailsResponse.json();
      console.log('✅ Workspace details:', {
        id: details.id,
        status: details.status,
        ideUrl: details.ide?.url
      });
      
      // Test 3: Get preview URL
      console.log('\n3️⃣ Testing preview URL generation...');
      const previewResponse = await fetch(`http://localhost:3014/api/daytona/workspaces/${workspace.id}/preview?port=3000`);
      const previewData = await previewResponse.json();
      console.log('✅ Preview URL:', previewData.previewUrl);
      
      if (previewData.previewUrl) {
        // Test 4: Check if preview URL is accessible
        console.log('\n4️⃣ Testing preview URL accessibility...');
        try {
          const previewTest = await fetch(previewData.previewUrl, { method: 'HEAD' });
          console.log('✅ Preview URL accessible:', previewTest.status, previewTest.statusText);
        } catch (error) {
          console.log('❌ Preview URL not accessible:', error.message);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testPreviewUrl();
