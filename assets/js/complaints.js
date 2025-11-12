document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.getElementById('complaints-table-body');
    const searchInput = document.getElementById('search-input');
    const statusFilter = document.getElementById('status-filter');
    const facultyFilter = document.getElementById('faculty-filter');
    const departmentFilter = document.getElementById('department-filter');

    if (!tableBody) return;
    
    const [complaints, students, employees, departments, faculties] = await Promise.all([
        fetch('data/complaints.json').then(res => res.json()),
        fetch('data/students.json').then(res => res.json()),
        fetch('data/employees.json').then(res => res.json()),
        fetch('data/departments.json').then(res => res.json()),
        fetch('data/faculties.json').then(res => res.json())
    ]);

    // Populate filters
    faculties.forEach(f => {
        facultyFilter.innerHTML += `<option value="${f.id}">${f.name}</option>`;
    });
    departments.forEach(d => {
        departmentFilter.innerHTML += `<option value="${d.id}">${d.name}</option>`;
    });


    const getStatusBadge = (status) => {
        const badgeClasses = {
            'New': 'bg-primary',
            'In Progress': 'bg-warning text-dark',
            'Resolved': 'bg-success',
            'Escalated': 'bg-danger',
        };
        return `<span class="badge ${badgeClasses[status]}">${status}</span>`;
    };

    const complaintData = complaints.map(complaint => {
        const student = students.find(s => s.id === complaint.studentId);
        const employee = employees.find(e => e.id === complaint.employeeId);
        const department = departments.find(d => d.id === complaint.departmentId);
        const faculty = department ? faculties.find(f => f.id === department.facultyId) : null;
        return {
            ...complaint,
            studentName: student ? student.name : 'N/A',
            employeeName: employee ? employee.name : 'N/A',
            facultyId: faculty ? faculty.id : null,
        };
    });

    const renderTable = (data) => {
        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" class="text-center">No complaints found.</td></tr>`;
            return;
        }
        tableBody.innerHTML = data.map(c => `
            <tr>
                <td>${c.id}</td>
                <td>${c.title}</td>
                <td><a href="student/view.html?id=${c.studentId}">${c.studentName}</a></td>
                <td><a href="employee/view.html?id=${c.employeeId}">${c.employeeName}</a></td>
                <td>${c.date}</td>
                <td>${getStatusBadge(c.status)}</td>
                <td><a href="#" class="btn btn-sm btn-accent">View Details</a></td>
            </tr>
        `).join('');
    };
    
    const filterData = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const status = statusFilter.value;
        const faculty = facultyFilter.value;
        const department = departmentFilter.value;

        let filtered = complaintData.filter(c => 
            c.id.toLowerCase().includes(searchTerm) ||
            c.title.toLowerCase().includes(searchTerm) ||
            c.studentName.toLowerCase().includes(searchTerm)
        );

        if (status) {
            filtered = filtered.filter(c => c.status === status);
        }
        if (faculty) {
            filtered = filtered.filter(c => c.facultyId === faculty);
        }
        if (department) {
             filtered = filtered.filter(c => c.departmentId === department);
        }

        renderTable(filtered);
    };

    renderTable(complaintData);
    
    [searchInput, statusFilter, facultyFilter, departmentFilter].forEach(el => {
        el.addEventListener('input', filterData);
        el.addEventListener('change', filterData);
    });

});