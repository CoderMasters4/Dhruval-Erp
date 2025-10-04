const axios = require('axios');

const testData = {
  companyCode: "COMP005",
  companyName: "Testing",
  legalName: "",
  status: "active",
  registrationDetails: {
    gstin: "",
    pan: "",
    cin: "",
    udyogAadhar: "",
    iecCode: "",
    registrationDate: ""
  },
  addresses: {
    registeredOffice: {
      street: "",
      area: "",
      city: "",
      state: "",
      pincode: "",
      country: "India"
    },
    factoryAddress: {
      street: "",
      area: "",
      city: "",
      state: "",
      pincode: "",
      country: "India"
    },
    warehouseAddresses: []
  },
  contactInfo: {
    phones: [{type: "", label: "Primary"}],
    emails: [{type: "", label: "Primary"}],
    website: "",
    socialMedia: {
      linkedin: ""
    }
  },
  businessConfig: {
    currency: "INR",
    timezone: "Asia/Kolkata",
    fiscalYearStart: "April",
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    workingHours: {
      start: "09:00",
      end: "18:00",
      breakStart: "13:00",
      breakEnd: "14:00"
    },
    gstRates: {
      defaultRate: 18,
      rawMaterialRate: 12,
      finishedGoodsRate: 18
    }
  }
};

const authToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGFlZDM5MDQ0ZjI5NTUxNjJmNDczZWIiLCJ1c2VybmFtZSI6InN1cGVyYWRtaW4iLCJlbWFpbCI6InN1cGVyYWRtaW5AdGVzdGNvbXBhbnkuY29tIiwiaXNTdXBlckFkbWluIjp0cnVlLCJjb21wYW55SWQiOiI2OGFlZDMwYzhkMWNlNjg1MmZkYzVlMDciLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJpYXQiOjE3NTg3MTY5NTMsImV4cCI6MTc2MDAxMjk1MywiYXVkIjoiZmFjdG9yeS1lcnAtdXNlcnMiLCJpc3MiOiJmYWN0b3J5LWVycCJ9.P21zZaRFHGiIYkWr6RME7vNd7WM6Ps42D5j1mqCgDxE';

async function testCompanyCreation() {
  try {
    console.log('Testing company creation...');
    console.log('Request data:', JSON.stringify(testData, null, 2));
    
    const response = await axios.post('http://localhost:4000/api/v1/companies', testData, {
      headers: {
        'Authorization': authToken,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Success! Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error occurred:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
}

testCompanyCreation();

