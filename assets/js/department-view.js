
document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const departmentId = params.get('id');

    if (!departmentId) { return; }

    const [departments, faculties, employees, students, complaints] = await Promise.all([
        fetch('../data/departments.json').then(res => res.json()),
        fetch('../data/faculties.json').then(res => res.json()),
        fetch('../data/employees.json').then(res => res.json()),
        fetch('../data/students.json').then(res => res.json()),
        fetch('../data/complaints.json').then(res => res.json())
    ]);

    const department = departments.find(d => d.id === departmentId);
    if (!department) { return; }

    const faculty = faculties.find(f => f.id === department.facultyId);
    const head = employees.find(e => e.id === department.headId);
    const departmentStudents = students.filter(s => s.departmentId === departmentId);
    const departmentComplaints = complaints.filter(c => c.departmentId === departmentId);

    // Render Header
    document.getElementById('profile-header-container').innerHTML = `
        <h2 class="mb-3">${department.name}</h2>
        <div class="row">
            <div class="col-md-3"><strong>Faculty:</strong> ${faculty.name}</div>
            <div class="col-md-3"><strong>Head of Dept.:</strong> ${head.name}</div>
            <div class="col-md-3"><strong>Students:</strong> ${departmentStudents.length}</div>
            <div class="col-md-3"><strong>Complaints:</strong> ${departmentComplaints.length}</div>
        </div>
    `;

    // Render Students Table
    const studentsTableBody = document.getElementById('students-table-body');
    studentsTableBody.innerHTML = departmentStudents.slice(0, 5).map(s => `
        <tr>
            <td>${s.id}</td>
            <td>${s.name}</td>
            <td>${s.email}</td>
        </tr>
    `).join('');

    // Render Chart
    const ctx = document.getElementById('complaintDistributionChart');
    if (ctx) {
        const statusCounts = departmentComplaints.reduce((acc, c) => {
            acc[c.status] = (acc[c.status] || 0) + 1;
            return acc;
        }, {});
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(statusCounts),
                datasets: [{
                    data: Object.values(statusCounts),
                    backgroundColor: ['#003366', '#D4A017', '#28a745', '#dc3545'],
                }]
            }
        });
    }
});