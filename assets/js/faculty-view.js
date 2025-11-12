
document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const facultyId = params.get('id');
    if (!facultyId) { return; }

    const [faculties, departments, employees, students, complaints] = await Promise.all([
        fetch('../data/faculties.json').then(res => res.json()),
        fetch('../data/departments.json').then(res => res.json()),
        fetch('../data/employees.json').then(res => res.json()),
        fetch('../data/students.json').then(res => res.json()),
        fetch('../data/complaints.json').then(res => res.json())
    ]);

    const faculty = faculties.find(f => f.id === facultyId);
    if (!faculty) { return; }

    const dean = employees.find(e => e.id === faculty.deanId);
    const facultyDepartments = departments.filter(d => d.facultyId === facultyId);
    const facultyStudents = students.filter(s => s.facultyId === facultyId);
    
    // Header
    document.getElementById('profile-header-container').innerHTML = `
        <h2 class="mb-3">${faculty.name}</h2>
        <div class="row">
            <div class="col-md-4"><strong>Dean:</strong> ${dean.name}</div>
            <div class="col-md-4"><strong>Departments:</strong> ${facultyDepartments.length}</div>
            <div class="col-md-4"><strong>Students:</strong> ${facultyStudents.length}</div>
        </div>
    `;

    // Chart
    const ctx = document.getElementById('departmentPerformanceChart');
    if (ctx) {
        const chartData = facultyDepartments.map(dept => {
            return {
                name: dept.name,
                complaintCount: complaints.filter(c => c.departmentId === dept.id).length
            };
        });

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartData.map(d => d.name),
                datasets: [{
                    label: 'Total Complaints',
                    data: chartData.map(d => d.complaintCount),
                    backgroundColor: '#003366',
                }]
            },
            options: {
                indexAxis: 'y',
                scales: {
                    x: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
});