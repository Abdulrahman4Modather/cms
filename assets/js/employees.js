document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.getElementById('employees-table-body');
    const searchInput = document.getElementById('search-input');
    if (!tableBody || !searchInput) return;

    const [employees, departments, complaints] = await Promise.all([
        fetch('data/employees.json').then(res => res.json()),
        fetch('data/departments.json').then(res => res.json()),
        fetch('data/complaints.json').then(res => res.json())
    ]);

    const employeeData = employees.map(employee => {
        const department = departments.find(d => d.id === employee.departmentId);
        const activeComplaints = complaints.filter(c => c.employeeId === employee.id && c.status !== 'Resolved').length;
        return {
            ...employee,
            departmentName: department ? department.name : 'N/A',
            activeComplaints
        };
    });

    const renderTable = (data) => {
        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" class="text-center">No employees found.</td></tr>`;
            return;
        }
        tableBody.innerHTML = data.map(emp => `
            <tr>
                <td>${emp.id}</td>
                <td>${emp.name}</td>
                <td>${emp.role}</td>
                <td>${emp.departmentName}</td>
                <td>${emp.activeComplaints}</td>
                <td><a href="employee/view.html?id=${emp.id}" class="btn btn-sm btn-accent">View</a></td>
            </tr>
        `).join('');
    };

    renderTable(employeeData);

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = employeeData.filter(emp =>
            emp.name.toLowerCase().includes(term) ||
            emp.id.toLowerCase().includes(term) ||
            emp.role.toLowerCase().includes(term)
        );
        renderTable(filtered);
    });
});