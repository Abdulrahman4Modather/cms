
document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const employeeId = params.get('id');

    if (!employeeId) {
        document.getElementById('profile-content').innerHTML = `<div class="alert alert-danger">Employee ID not found.</div>`;
        return;
    }

    const [employees, departments, complaints, students] = await Promise.all([
        fetch('../data/employees.json').then(res => res.json()),
        fetch('../data/departments.json').then(res => res.json()),
        fetch('../data/complaints.json').then(res => res.json()),
        fetch('../data/students.json').then(res => res.json())
    ]);
    
    const employee = employees.find(e => e.id === employeeId);
     if (!employee) {
        document.getElementById('profile-content').innerHTML = `<div class="alert alert-danger">Employee not found.</div>`;
        return;
    }

    const department = departments.find(d => d.id === employee.departmentId);
    const assignedComplaints = complaints.filter(c => c.employeeId === employeeId);
    
    // Render Header
     document.getElementById('profile-header-container').innerHTML = `
        <div class="profile-header mb-4">
            <div>
                <h2 class="mb-0">${employee.name}</h2>
                <p class="mb-0 fs-5">Role: ${employee.role} | Department: ${department.name || 'N/A'}</p>
                <p class="text-white-50">Email: ${employee.email}</p>
            </div>
        </div>
    `;

    // Render Stats
    document.getElementById('stats-container').innerHTML = `
        <div class="col-md-4"><div class="card text-center p-3"><h4 class="h1">${assignedComplaints.length}</h4><p class="text-muted mb-0">Assigned Complaints</p></div></div>
        <div class="col-md-4"><div class="card text-center p-3"><h4 class="h1">${assignedComplaints.filter(c => c.status === 'Resolved').length}</h4><p class="text-muted mb-0">Resolved Complaints</p></div></div>
        <div class="col-md-4"><div class="card text-center p-3"><h4 class="h1">2.5</h4><p class="text-muted mb-0">Avg. Resolution Time (Days)</p></div></div>
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
    
    // Render Table
    const tableBody = document.getElementById('complaints-table-body');
    if (assignedComplaints.length > 0) {
        tableBody.innerHTML = assignedComplaints.map(c => {
            const student = students.find(s => s.id === c.studentId);
            return `
                <tr>
                    <td>${c.id}</td>
                    <td>${c.title}</td>
                    <td>${student ? student.name : 'N/A'}</td>
                    <td>${c.date}</td>
                    <td>${getStatusBadge(c.status)}</td>
                </tr>
            `;
        }).join('');
    } else {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center">No assigned complaints.</td></tr>`;
    }
});