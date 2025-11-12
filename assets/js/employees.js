
document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.getElementById('employees-table-body');
    const searchInput = document.getElementById('search-input');
    const addEmployeeForm = document.getElementById('add-employee-form');
    const employeeDepartmentSelect = document.getElementById('employee-department');
    const addEmployeeModalEl = document.getElementById('addEmployeeModal');

    if (!tableBody || !searchInput) return;
    
    const addEmployeeModal = new bootstrap.Modal(addEmployeeModalEl);

    const [employees, departments, complaints] = await Promise.all([
        fetch('data/employees.json').then(res => res.json()),
        fetch('data/departments.json').then(res => res.json()),
        fetch('data/complaints.json').then(res => res.json())
    ]);

    let employeeData = employees.map(employee => {
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
    
    const populateDepartmentOptions = () => {
        employeeDepartmentSelect.innerHTML = '<option value="">Select Department</option>';
        departments.forEach(dept => {
            employeeDepartmentSelect.innerHTML += `<option value="${dept.id}">${dept.name}</option>`;
        });
    };

    renderTable(employeeData);
    populateDepartmentOptions();

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = employeeData.filter(emp =>
            emp.name.toLowerCase().includes(term) ||
            emp.id.toLowerCase().includes(term) ||
            emp.role.toLowerCase().includes(term)
        );
        renderTable(filtered);
    });

    if (addEmployeeForm) {
        addEmployeeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('employee-name').value;
            const email = document.getElementById('employee-email').value;
            const role = document.getElementById('employee-role').value;
            const departmentId = document.getElementById('employee-department').value;
            const department = departments.find(d => d.id === departmentId);

            const newEmployeeId = `E${employees.length + 1}`;
            const newEmployee = {
                id: newEmployeeId,
                name,
                email,
                role,
                departmentId,
                avatar: `https://i.pravatar.cc/150?u=${newEmployeeId}`,
                departmentName: department ? department.name : 'N/A',
                activeComplaints: 0
            };

            employees.push(newEmployee);
            employeeData.push(newEmployee);
            renderTable(employeeData);

            addEmployeeModal.hide();
            e.target.reset();
        });
    }
});