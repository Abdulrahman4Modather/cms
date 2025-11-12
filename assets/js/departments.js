document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.getElementById('departments-table-body');
    if (!tableBody) return;

    const isArabic = document.documentElement.lang === 'ar';
    const translations = {
        en: { 
            view: "View", 
            noResults: "No departments found.",
            "Faculty of Engineering": "Faculty of Engineering",
            "Faculty of Science": "Faculty of Science"
        },
        ar: { 
            view: "عرض", 
            noResults: "لم يتم العثور على أقسام.",
            "Faculty of Engineering": "كلية الهندسة",
            "Faculty of Science": "كلية العلوم"
        }
    };
    const t = translations[isArabic ? 'ar' : 'en'];

    const [departments, faculties, employees, complaints] = await Promise.all([
        fetch('data/departments.json').then(res => res.json()),
        fetch('data/faculties.json').then(res => res.json()),
        fetch('data/employees.json').then(res => res.json()),
        fetch('data/complaints.json').then(res => res.json())
    ]);

    const data = departments.map(dept => {
        const faculty = faculties.find(f => f.id === dept.facultyId);
        const head = employees.find(e => e.id === dept.headId);
        const complaintCount = complaints.filter(c => c.departmentId === dept.id).length;
        return {
            ...dept,
            facultyName: faculty ? (t[faculty.name] || faculty.name) : 'N/A',
            headName: head ? head.name : 'N/A',
            complaintCount
        };
    });

    if (data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center">${t.noResults}</td></tr>`;
        return;
    }

    tableBody.innerHTML = data.map(dept => `
        <tr>
            <td>${dept.id}</td>
            <td>${dept.name}</td>
            <td>${dept.facultyName}</td>
            <td>${dept.headName}</td>
            <td>${dept.complaintCount}</td>
            <td><a href="department/view${isArabic ? '-ar' : ''}.html?id=${dept.id}" class="btn btn-sm btn-accent">${t.view}</a></td>
        </tr>
    `).join('');
});