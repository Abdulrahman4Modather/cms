document.addEventListener('DOMContentLoaded', async () => {
    const facultiesTableBody = document.getElementById('faculties-table-body');
    const departmentsTableBody = document.getElementById('departments-table-body');
    if (!facultiesTableBody || !departmentsTableBody) return;

    const [faculties, departments, employees, students, complaints] = await Promise.all([
        fetch('data/faculties.json').then(res => res.json()),
        fetch('data/departments.json').then(res => res.json()),
        fetch('data/employees.json').then(res => res.json()),
        fetch('data/students.json').then(res => res.json()),
        fetch('data/complaints.json').then(res => res.json())
    ]);

    const facultyData = faculties.map(faculty => {
        const dean = employees.find(e => e.id === faculty.deanId);
        const departmentCount = departments.filter(d => d.facultyId === faculty.id).length;
        const studentCount = students.filter(s => s.facultyId === faculty.id).length;
        return {
            ...faculty,
            deanName: dean ? dean.name : 'N/A',
            departmentCount,
            studentCount
        };
    });

    facultiesTableBody.innerHTML = facultyData.map(f => `
        <tr>
            <td>${f.id}</td>
            <td>${f.name}</td>
            <td>${f.deanName}</td>
            <td>${f.departmentCount}</td>
            <td>${f.studentCount}</td>
            <td><a href="faculty/view.html?id=${f.id}" class="btn btn-sm btn-accent">View</a></td>
        </tr>
    `).join('');
    
    const departmentData = departments.map(dept => {
        const faculty = faculties.find(f => f.id === dept.facultyId);
        const head = employees.find(e => e.id === dept.headId);
        const complaintCount = complaints.filter(c => c.departmentId === dept.id).length;
        return {
            ...dept,
            facultyName: faculty ? faculty.name : 'N/A',
            headName: head ? head.name : 'N/A',
            complaintCount
        };
    });

    departmentsTableBody.innerHTML = departmentData.map(dept => `
        <tr>
            <td>${dept.id}</td>
            <td>${dept.name}</td>
            <td>${dept.facultyName}</td>
            <td>${dept.headName}</td>
            <td>${dept.complaintCount}</td>
            <td><a href="department/view.html?id=${dept.id}" class="btn btn-sm btn-accent">View</a></td>
        </tr>
    `).join('');
});