const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3001/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, options);
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  if (!res.ok) {
    throw new Error(`[${res.status} ${res.statusText}] ${endpoint}: ${typeof json === 'object' ? JSON.stringify(json) : json}`);
  }
  return json;
}

async function runE2E() {
  console.log('--- STARTING PH.D. REGISTRATION PORTAL E2E VERIFICATION ---');

  // 1. Applicant Login
  console.log('\n1. Logging in as Scholar...');
  const scholarAuth = await request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'scholar.phd@sahyadri.edu.in',
      password: 'Sahyadri@2026',
    }),
  });
  console.log('✓ Scholar authenticated. Role:', scholarAuth.user.role);
  const scholarToken = scholarAuth.accessToken;

  // 2. Fetch or Create Draft Application
  console.log('\n2. Checking existing applications...');
  let apps = await request('/applications/mine', {
    headers: { Authorization: `Bearer ${scholarToken}` },
  });
  console.log(`✓ Retrieved ${apps.length} candidate application(s).`);

  let currentApp = apps.find(a => a.status === 'DRAFT');
  if (!currentApp) {
    console.log('Creating a new CSE draft application...');
    currentApp = await request('/applications', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${scholarToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ selectedProgramme: 'CSE' }),
    });
    console.log('✓ Created application ID:', currentApp.id);
  } else {
    console.log('✓ Using existing draft application ID:', currentApp.id);
  }

  // 3. Update Draft with Comprehensive Form Data
  console.log('\n3. Updating draft application with candidate details...');
  const updatedApp = await request(`/applications/${currentApp.id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${scholarToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      selectedProgramme: 'CSE',
      currentStep: 6,
      scholar: {
        name: 'Dr. (Cand.) Rohit Shenoy',
        email: 'scholar.phd@sahyadri.edu.in',
        contactNumber: '9845123456',
        whatsapp: '9845123456',
        profession: 'Assistant Professor',
        fatherGuardianSpouseName: 'Venkatesh Shenoy',
        alternateNumber: '9845199999',
        studyMode: 'Part Time',
        proposedResearchTopic: 'Quantum-Resilient Cryptographic Protocols for Edge Computing',
        addressForCommunication: 'Dept. of CSE, Sahyadri Campus, Adyar, Mangaluru - 575007',
      },
      supervisor: {
        name: 'Dr. Pushpalatha K',
        email: 'pushpalatha.cse@sahyadri.edu.in',
        contactNumber: '9448123456',
        whatsapp: '9448123456',
        profession: 'Professor & Head',
        addressOfInstitution: 'Sahyadri College of Engineering & Management, Adyar, Mangaluru',
        addressForCommunication: 'Adyar, Mangaluru - 575007',
      },
      coSupervisor: {
        hasCoSupervisor: true,
        name: 'Dr. Ananth Prabhu G',
        email: 'ananth.cyber@sahyadri.edu.in',
        contactNumber: '9880123456',
        whatsapp: '9880123456',
        profession: 'Professor & Cyber Law Consultant',
        addressOfInstitution: 'Sahyadri Research Centre, Mangaluru',
        addressForCommunication: 'Adyar, Mangaluru - 575007',
      },
      qualifications: [
        { degree: 'B.E. in Computer Science', university: 'Visvesvaraya Technological University', percentage: '82.50' },
        { degree: 'M.Tech in Cyber Security', university: 'VTU Belagavi', percentage: '88.00' },
      ],
      feePayments: [
        {
          academicYear: '2026-27',
          date: '2026-03-01',
          amount: '50000',
          modeOfPayment: 'NEFT / RTGS',
          details: 'UTR: SBIN20260301987654',
        },
      ],
      declaration: {
        agreed: true,
        date: '2026-03-15',
      },
    }),
  });
  console.log('✓ Draft successfully saved. Scholar name:', updatedApp.scholar.name);

  // 4. Test File Upload (Candidate Photograph)
  console.log('\n4. Uploading candidate photograph...');
  // 1x1 transparent PNG buffer
  const samplePng = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );

  const formData = new FormData();
  formData.append('file', new Blob([samplePng], { type: 'image/png' }), 'scholar-photo.png');

  const photoRes = await request(`/applications/${currentApp.id}/photo`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${scholarToken}` },
    body: formData,
  });
  console.log('✓ Photograph uploaded. Status:', photoRes.photographUrl);

  // 4b. Upload Signature
  console.log('\n4b. Uploading candidate digital signature...');
  const sigData = new FormData();
  sigData.append('file', new Blob([samplePng], { type: 'image/png' }), 'scholar-signature.png');
  sigData.append('type', 'DRAWN');
  const sigRes = await request(`/applications/${currentApp.id}/signature`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${scholarToken}` },
    body: sigData,
  });
  console.log('✓ Signature uploaded. Status:', sigRes.signatureUrl);

  // 4c. Upload Mandatory Documents
  console.log('\n4c. Uploading all mandatory registration documents...');
  const appDetails = await request(`/applications/${currentApp.id}`, {
    headers: { Authorization: `Bearer ${scholarToken}` },
  });
  for (const doc of appDetails.documents) {
    if (!doc.optional) {
      const docData = new FormData();
      docData.append('file', new Blob([samplePng], { type: 'application/pdf' }), `${doc.name || 'doc'}.pdf`);
      await request(`/applications/${currentApp.id}/documents/${doc.id}/file`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${scholarToken}` },
        body: docData,
      });
      console.log(`  ✓ Uploaded mandatory document: ${doc.name} (${doc.id})`);
    }
  }

  // 5. Submit Application
  console.log('\n5. Submitting application...');
  const submitted = await request(`/applications/${currentApp.id}/submit`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${scholarToken}` },
  });
  console.log('✓ Application Submitted!');
  console.log('  Status:', submitted.status);
  console.log('  Application Number:', submitted.applicationNumber);
  console.log('  Submitted At:', submitted.submittedAt);

  // 6. Admin Login
  console.log('\n6. Logging in as Admin/Reviewer...');
  const adminAuth = await request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@sahyadri.edu.in',
      password: 'SahyadriAdmin@2026!',
    }),
  });
  console.log('✓ Admin authenticated. Role:', adminAuth.user.role);
  const adminToken = adminAuth.accessToken;

  // 7. Admin Reviews Applications List
  console.log('\n7. Fetching review applications queue...');
  const reviewQueue = await request('/applications/review', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log(`✓ Review queue contains ${reviewQueue.length} application(s).`);
  const found = reviewQueue.find(a => a.id === currentApp.id);
  if (!found) {
    throw new Error('Submitted application not found in admin review queue!');
  }
  console.log(`✓ Found submitted application ${found.applicationNumber} in review queue.`);

  // 8. Admin Updates Status with Reviewer Remarks
  console.log('\n8. Admin updating status to UNDER_REVIEW with reviewer remarks...');
  const reviewUpdate = await request(`/applications/${currentApp.id}/status`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status: 'UNDER_REVIEW',
      note: 'Duly verified by CSE Doctoral Committee. Forwarded for Research Supervisor interview.',
    }),
  });
  console.log('✓ Application updated by Admin:');
  console.log('  New Status:', reviewUpdate.status);
  console.log('  Workflow Status:', reviewUpdate.workflowStatus);

  // 9. Scholar Re-fetches Application and sees update
  console.log('\n9. Candidate re-fetching application status...');
  const candidateRefetch = await request(`/applications/${currentApp.id}`, {
    headers: { Authorization: `Bearer ${scholarToken}` },
  });
  console.log('✓ Candidate sees status:', candidateRefetch.status);
  console.log('  Workflow Status:', candidateRefetch.workflowStatus);
  console.log('  Status History records:', candidateRefetch.statusHistory?.length);
  if (candidateRefetch.statusHistory && candidateRefetch.statusHistory.length > 0) {
    console.log('  Latest remarks:', candidateRefetch.statusHistory[0].note);
  }

  console.log('\n============================================================');
  console.log('🎉 FULL END-TO-END FLOW VERIFICATION COMPLETED SUCCESSFULLY!');
  console.log('============================================================');
}

runE2E().catch(err => {
  console.error('\n❌ E2E VERIFICATION FAILED:', err.message);
  process.exit(1);
});
