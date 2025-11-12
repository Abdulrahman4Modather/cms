
document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const studentId = params.get('id');

    if (!studentId) {
        document.getElementById('profile-content').innerHTML = `<div class="alert alert-danger">Student ID not found.</div>`;
        return;
    }

    const [students, departments, faculties, complaints] = await Promise.all([
        fetch('../data/students.json').then(res => res.json()),
        fetch('../data/departments.json').then(res => res.json()),
        fetch('../data/faculties.json').then(res => res.json()),
        fetch('../data/complaints.json').then(res => res.json())
    ]);
    
    const student = students.find(s => s.id === studentId);
    if (!student) {
        document.getElementById('profile-content').innerHTML = `<div class="alert alert-danger">Student not found.</div>`;
        return;
    }
    
    const department = departments.find(d => d.id === student.departmentId);
    const faculty = faculties.find(f => f.id === student.facultyId);
    const studentComplaints = complaints.filter(c => c.studentId === studentId);
    
    // Render Profile Header
    document.getElementById('profile-header-container').innerHTML = `
        <div class="profile-header mb-4">
            <div>
                <h2 class="mb-0">${student.name}</h2>
                <p class="mb-0 fs-5">Department: ${department.name || 'N/A'} | Faculty: ${faculty.name || 'N/A'}</p>
                <p class="text-white-50">Email: ${student.email}</p>
            </div>
        </div>
    `;

    // Render Stats
    document.getElementById('stats-container').innerHTML = `
        <div class="col-md-4"><div class="card text-center p-3"><h4 class="h1">${studentComplaints.length}</h4><p class="text-muted mb-0">Total Complaints</p></div></div>
        <div class="col-md-4"><div class="card text-center p-3"><h4 class="h1">${studentComplaints.filter(c => c.status === 'In Progress').length}</h4><p class="text-muted mb-0">In Progress</p></div></div>
        <div class="col-md-4"><div class="card text-center p-3"><h4 class="h1">${studentComplaints.filter(c => c.status === 'Resolved').length}</h4><p class="text-muted mb-0">Resolved</p></div></div>
    `;
    
     const getStatusBadge = (status) => {
        const badgeClasses = {
            'New': 'bg-primary',
            'In Progress': 'bg-warning text-dark',
            'Resolved': 'bg-success',
            'Escalated': 'bg-danger',
        };
        return `<span class="badge ${badgeClasses[status]}">${status}</span>`;
    };

    // Render Complaints Table
    const complaintsTableBody = document.getElementById('complaints-table-body');
    if (studentComplaints.length > 0) {
        complaintsTableBody.innerHTML = studentComplaints.map(c => `
            <tr>
                <td>${c.id}</td>
                <td>${c.title}</td>
                <td>${c.date}</td>
                <td>${getStatusBadge(c.status)}</td>
            </tr>
        `).join('');
    } else {
        complaintsTableBody.innerHTML = `<tr><td colspan="4" class="text-center">No complaints found for this student.</td></tr>`;
    }
});