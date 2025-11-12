document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.getElementById('admins-table-body');
    if (!tableBody) return;

    const isArabic = document.documentElement.lang === 'ar';
    const translations = {
        en: { 
            edit: "Edit", 
            delete: "Delete", 
            noResults: "No admins found.",
            "Admin Staff": "Admin Staff"
        },
        ar: { 
            edit: "تعديل", 
            delete: "حذف", 
            noResults: "لم يتم العثور على مسؤولين.",
            "Admin Staff": "مسؤول إداري"
        }
    };
    const t = translations[isArabic ? 'ar' : 'en'];

    // We'll filter from the main employees list for admins
    const employees = await fetch('data/employees.json').then(res => res.json());

    const admins = employees.filter(e => e.role.toLowerCase().includes('admin'));

    const renderTable = (data) => {
        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" class="text-center">${t.noResults}</td></tr>`;
            return;
        }
        tableBody.innerHTML = data.map(admin => `
            <tr>
                <td>${admin.id}</td>
                <td>${admin.name}</td>
                <td>${admin.email}</td>
                <td>${t[admin.role] || admin.role}</td>
                <td>
                    <button class="btn btn-sm btn-primary">${t.edit}</button>
                    <button class="btn btn-sm btn-danger">${t.delete}</button>
                </td>
            </tr>
        `).join('');
    };

    renderTable(admins);
});