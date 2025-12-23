const fetch = require('node-fetch');

async function testApproval() {
    const draftId = 'cmjhifpn3000l1370x94bgswv'; // One of the DRAFT status drafts
    const url = `http://localhost:3000/api/admin/drafts/${draftId}`;

    console.log(`Testing approval for draft ${draftId}...`);

    try {
        // Note: This test will likely fail due to lack of session/cookie in node-fetch
        // But it might show if there's a 500 or 401/403
        const res = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                // In a real browser this would have the next-auth session cookie
            },
            body: JSON.stringify({ action: 'approve' }),
        });

        console.log('Status:', res.status);
        const text = await res.text();
        console.log('Response:', text);
    } catch (e) {
        console.error('Error:', e.message);
    }
}

testApproval();
