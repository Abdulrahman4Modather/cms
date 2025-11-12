document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.getElementById('students-table-body');
    const searchInput = document.getElementById('search-input');
    if (!tableBody || !searchInput) return;

    const [students, departments, complaints] = await Promise.all([
        fetch('data/students.json').then(res => res.json()),
        fetch('data/departments.json').then(res => res.json()),
        fetch('data/complaints.json').then(res => res.json())
    ]);

    const studentData = students.map(student => {
        const department = departments.find(d => d.id === student.departmentId);
        const complaintCount = complaints.filter(c => c.studentId === student.id).length;
        return {
            ...student,
            departmentName: department ? department.name : 'N/A',
            complaintCount
        };
    });

    const renderTable = (data) => {
        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" class="text-center">No students found.</td></tr>`;
            return;
        }
        tableBody.innerHTML = data.map(student => `
            <tr>
                <td>${student.id}</td>
                <td>${student.name}</td>
                <td>${student.departmentName}</td>
                <td>${student.complaintCount}</td>
                <td><a href="student/view.html?id=${student.id}" class="btn btn-sm btn-accent">View</a></td>
            </tr>
        `).join('');
    };

    renderTable(studentData);

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = studentData.filter(s => 
            s.name.toLowerCase().includes(term) || 
            s.id.toLowerCase().includes(term) ||
            s.departmentName.toLowerCase().includes(term)
        );
        renderTable(filtered);
    });
});