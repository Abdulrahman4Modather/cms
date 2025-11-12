
document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.getElementById('admins-table-body');
    const addAdminForm = document.getElementById('add-admin-form');
    const adminDepartmentSelect = document.getElementById('admin-department');
    const addAdminModalEl = document.getElementById('addAdminModal');

    if (!tableBody) return;

    // Admins are part of the employees list. We need the full list to add a new one.
    const [employees, departments] = await Promise.all([
        fetch('data/employees.json').then(res => res.json()),
        fetch('data/departments.json').then(res => res.json())
    ]);

    let admins = employees.filter(e => e.role.toLowerCase().includes('admin'));
    
    const addAdminModal = new bootstrap.Modal(addAdminModalEl);

    const renderTable = (data) => {
        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" class="text-center">No admins found.</td></tr>`;
            return;
        }
        tableBody.innerHTML = data.map(admin => `
            <tr>
                <td>${admin.id}</td>
                <td>${admin.name}</td>
                <td>${admin.email}</td>
                <td>${admin.role}</td>
                <td>
                    <button class="btn btn-sm btn-primary">Edit</button>
                    <button class="btn btn-sm btn-danger">Delete</button>
                </td>
            </tr>
        `).join('');
    };
    
    const populateDepartmentOptions = () => {
        adminDepartmentSelect.innerHTML = '<option value="">Select Department</option>';
        departments.forEach(dept => {
            adminDepartmentSelect.innerHTML += `<option value="${dept.id}">${dept.name}</option>`;
        });
    };

    renderTable(admins);
    populateDepartmentOptions();
    
    if (addAdminForm) {
        addAdminForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('admin-name').value;
            const email = document.getElementById('admin-email').value;
            const role = document.getElementById('admin-role').value;
            const departmentId = document.getElementById('admin-department').value;
            
            const newAdminId = `E${employees.length + 1}`;
            const newAdmin = {
                 id: newAdminId,
                name,
                email,
                role,
                departmentId: departmentId || null,
                avatar: `https://i.pravatar.cc/150?u=${newAdminId}`
            };

            // "Save" to the main employees array, then re-filter and re-render
            employees.push(newAdmin);
            admins = employees.filter(emp => emp.role.toLowerCase().includes('admin'));

            renderTable(admins);
            addAdminModal.hide();
            e.target.reset();
        });
    }
});