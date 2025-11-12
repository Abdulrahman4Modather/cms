document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.getElementById('admins-table-body');
    if (!tableBody) return;

    // We'll filter from the main employees list for admins
    const employees = await fetch('data/employees.json').then(res => res.json());

    const admins = employees.filter(e => e.role.toLowerCase().includes('admin'));

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

    renderTable(admins);
});