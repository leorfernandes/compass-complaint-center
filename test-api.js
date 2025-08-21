const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('🧪 Testing Compass Complaint Center API...\n');
    
    // Test 1: Check stats endpoint
    console.log('1. Testing stats endpoint...');
    const statsResponse = await fetch('http://localhost:3000/api/complaints/stats');
    const statsData = await statsResponse.json();
    console.log(`   Status: ${statsResponse.status}`);
    console.log(`   Data:`, statsData);
    
    // Test 2: Check complaints endpoint
    console.log('\n2. Testing complaints endpoint...');
    const complaintsResponse = await fetch('http://localhost:3000/api/complaints?sortBy=dateSubmitted&sortOrder=desc');
    const complaintsData = await complaintsResponse.json();
    console.log(`   Status: ${complaintsResponse.status}`);
    console.log(`   Data structure:`, {
      success: complaintsData.success,
      hasData: !!complaintsData.data,
      complaintsCount: complaintsData.data?.complaints?.length || 0,
      message: complaintsData.message
    });
    
    // Test 3: Create a test complaint
    console.log('\n3. Testing complaint creation...');
    const createResponse = await fetch('http://localhost:3000/api/complaints', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'API Test Complaint',
        description: 'This is a test complaint created by the API test script',
        category: 'Product',
        priority: 'Medium'
      })
    });
    const createData = await createResponse.json();
    console.log(`   Status: ${createResponse.status}`);
    console.log(`   Data:`, {
      success: createData.success,
      hasComplaint: !!createData.data,
      complaintId: createData.data?._id,
      error: createData.error
    });
    
    console.log('\n✅ API Test completed successfully!');
    
  } catch (error) {
    console.error('❌ API Test failed:', error.message);
  }
}

testAPI();
