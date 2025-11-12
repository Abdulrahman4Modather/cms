document.addEventListener('DOMContentLoaded', async () => {
    const pathPrefix = (window.location.pathname.includes('/student/') || window.location.pathname.includes('/employee/')) ? '../' : '';

    const [complaints, students, employees, faculties, departments] = await Promise.all([
        fetch(`${pathPrefix}data/complaints.json`).then(res => res.json()),
        fetch(`${pathPrefix}data/students.json`).then(res => res.json()),
        fetch(`${pathPrefix}data/employees.json`).then(res => res.json()),
        fetch(`${pathPrefix}data/faculties.json`).then(res => res.json()),
        fetch(`${pathPrefix}data/departments.json`).then(res => res.json()),
    ]);

    const getStatusBadge = (status) => {
        const badgeClasses = {
            'New': 'bg-danger',
            'In Progress': 'bg-info',
            'Resolved': 'bg-success',
            'Escalated': 'bg-warning',
        };
        return `<span class="badge ${badgeClasses[status]}">${status}</span>`;
    };

    // KPIs
    const kpiContainer = document.getElementById('kpi-cards-container');
    if (kpiContainer) {
        const kpis = {
            pending: complaints.filter(c => c.status === 'New' || c.status === 'Escalated').length,
            inProgress: complaints.filter(c => c.status === 'In Progress').length,
            resolved: complaints.filter(c => c.status === 'Resolved').length
        };
        
        document.getElementById('total-complaints-label').innerText = `Total: ${complaints.length}`;
        
        kpiContainer.innerHTML = `
            <div class="col-md-4 mb-3">
                <div class="card card-pending">
                    <div class="card-body text-white">
                        <div class="d-flex justify-content-between align-items-center">
                            <p class="mb-0 h5">Pending</p>
                            <p class="h3 mb-0">${kpis.pending}</p>
                        </div>
                    </div>
                </div>
            </div>
             <div class="col-md-4 mb-3">
                <div class="card card-in_progress">
                    <div class="card-body text-white">
                        <div class="d-flex justify-content-between align-items-center">
                            <p class="mb-0 h5">In Progress</p>
                            <p class="h3 mb-0">${kpis.inProgress}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-3">
                <div class="card card-resolved">
                    <div class="card-body text-white">
                        <div class="d-flex justify-content-between align-items-center">
                            <p class="mb-0 h5">Resolved</p>
                            <p class="h3 mb-0">${kpis.resolved}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Recent Complaints Table
    const recentComplaintsBody = document.getElementById('recent-complaints-body');
    if (recentComplaintsBody) {
        const recentComplaints = complaints.slice(0, 5).map(c => {
            const student = students.find(s => s.id === c.studentId);
            return {
                ...c,
                studentName: student ? student.name : 'N/A'
            };
        });
        recentComplaintsBody.innerHTML = recentComplaints.map(c => `
            <tr>
                <td>${c.id}</td>
                <td>${c.title}</td>
                <td>${c.studentName}</td>
                <td>${c.date}</td>
                <td>${getStatusBadge(c.status)}</td>
                <td><a href="student/view.html?id=${c.studentId}" class="btn btn-sm btn-accent">View</a></td>
            </tr>
        `).join('');
    }

    // Charts
    // Pie chart: Complaints per Faculty
    const facultyChartCtx = document.getElementById('complaintsByFacultyChart');
    if (facultyChartCtx) {
        const complaintsWithFaculty = complaints.map(c => {
            const dept = departments.find(d => d.id === c.departmentId);
            return {
                ...c,
                facultyId: dept ? dept.facultyId : null
            };
        });

        const facultyCounts = complaintsWithFaculty.reduce((acc, c) => {
            if (c.facultyId) {
                acc[c.facultyId] = (acc[c.facultyId] || 0) + 1;
            }
            return acc;
        }, {});

        const facultyLabels = Object.keys(facultyCounts).map(fid => {
            const faculty = faculties.find(f => f.id === fid);
            return faculty ? faculty.name : 'Unknown';
        });

        new Chart(facultyChartCtx, {
            type: 'pie',
            data: {
                labels: facultyLabels,
                datasets: [{
                    data: Object.values(facultyCounts),
                    backgroundColor: ['#064566', '#F8BA39', '#0FA958', '#E01C46', '#1fb6d3'],
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
            }
        });
    }
});