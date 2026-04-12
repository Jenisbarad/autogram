const axios = require('axios');

const API_URL = 'http://localhost:4000/api';
let adminCookie = '';

async function runTests() {
    try {
        console.log('--- 1. Testing Registration (Manual Approval) ---');
        try {
            const res = await axios.post(API_URL + '/auth/register', {
                email: 'testmanual@example.com',
                password: 'password123'
            });
            console.log('✅ Register manual:', res.data.message);
        } catch (e) {
            console.error('❌ Register manual failed:', e.response?.data || e.message);
        }

        console.log('\n--- 2. Testing Login (Should fail - pending) ---');
        try {
            await axios.post(API_URL + '/auth/login', {
                email: 'testmanual@example.com',
                password: 'password123'
            });
            console.error('❌ Login manual succeeded but should have failed!');
        } catch (e) {
            console.log('✅ Login manual failed as expected:', e.response?.data?.error);
        }

        console.log('\n--- 3. Admin Login & Authorization ---');
        try {
            const res = await axios.post(API_URL + '/auth/login', {
                email: 'admin@test.com',
                password: 'admin123'
            });
            adminCookie = res.headers['set-cookie'][0];
            console.log('✅ Admin login successful, role:', res.data.user.role);
        } catch (e) {
            console.error('❌ Admin login failed:', e.response?.data || e.message);
            return;
        }

        console.log('\n--- 4. Admin Approving User ---');
        try {
            const usersRes = await axios.get(API_URL + '/admin/users', {
                headers: { Cookie: adminCookie }
            });
            const manualUser = usersRes.data.users.find(u => u.email === 'testmanual@example.com');
            
            await axios.post(`${API_URL}/admin/users/${manualUser.id}/approve`, {}, {
                headers: { Cookie: adminCookie }
            });
            console.log('✅ User approved successfully');
        } catch (e) {
             console.error('❌ Admin approve failed:', e.response?.data || e.message);
        }

        console.log('\n--- 5. Admin Generating Invite Code ---');
        let inviteCode = '';
        try {
            const res = await axios.post(API_URL + '/admin/invites/generate', {}, {
                headers: { Cookie: adminCookie }
            });
            inviteCode = res.data.invite.code;
            console.log('✅ Invite code generated:', inviteCode);
        } catch (e) {
            console.error('❌ Invite generate failed:', e.response?.data || e.message);
        }

        console.log('\n--- 6. Testing Registration (With Invite Code) ---');
        try {
            const res = await axios.post(API_URL + '/auth/register', {
                email: 'testinvite@example.com',
                password: 'password123',
                invite_code: inviteCode
            });
            console.log('✅ Register with invite:', res.data.message);
        } catch (e) {
            console.error('❌ Register with invite failed:', e.response?.data || e.message);
        }

        console.log('\n--- 7. Testing Login (Should fail - invite users are pending by default) ---');
        try {
            await axios.post(API_URL + '/auth/login', {
                email: 'testinvite@example.com',
                password: 'password123'
            });
            console.error('❌ Login invite succeeded but should have failed!');
        } catch (e) {
            console.log('✅ Login invite failed as expected (needs admin approval first):', e.response?.data?.error);
        }

        console.log('\n✅ All tests completed!');
    } catch (e) {
        console.error('Critical error:', e);
    }
}

runTests();
