
document.addEventListener('DOMContentLoaded', async () => {
    const isArabic = document.documentElement.lang === 'ar';
    const params = new URLSearchParams(window.location.search);
    const departmentId = params.get('id');

    if (!departmentId) { return; }

    const [departments, faculties, employees, students, complaints] = await Promise.all([
        fetch('../data/departments.json').then(res => res.json()),
        fetch('../data/faculties.json').then(res => res.json()),
        fetch('../data/employees.json').then(res => res.json()),
        fetch('../data/students.json').then(res => res.json()),
        fetch('../data/complaints.json').then(res => res.json())
    ]);

    const department = departments.find(d => d.id === departmentId);
    if (!department) { return; }

    const faculty = faculties.find(f => f.id === department.facultyId);
    const head = employees.find(e => e.id === department.headId);
    const departmentStudents = students.filter(s => s.departmentId === departmentId);
    const departmentComplaints = complaints.filter(c => c.departmentId === departmentId);

    const translations = {
        en: {
            faculty: "Faculty",
            head: "Head of Dept.",
            students: "Students",
            complaints: "Complaints",
        },
        ar: {
            faculty: "الكلية",
            head: "رئيس القسم",
            students: "الطلاب",
            complaints: "الشكاوى",
        }
    };
    const t = translations[isArabic ? 'ar' : 'en'];
    
    // Render Header
    document.getElementById('profile-header-container').innerHTML = `
        <h2 class="mb-3">${department.name}</h2>
        <div class="row">
            <div class="col-md-3"><strong>${t.faculty}:</strong> ${faculty.name}</div>
            <div class="col-md-3"><strong>${t.head}:</strong> ${head.name}</div>
            <div class="col-md-3"><strong>${t.students}:</strong> ${departmentStudents.length}</div>
            <div class="col-md-3"><strong>${t.complaints}:</strong> ${departmentComplaints.length}</div>
        </div>
    `;

    // Render Students Table
    const studentsTableBody = document.getElementById('students-table-body');
    studentsTableBody.innerHTML = departmentStudents.slice(0, 5).map(s => `
        <tr>
            <td>${s.id}</td>
            <td>${s.name}</td>
            <td>${s.email}</td>
        </tr>
    `).join('');

    // Render Chart
    const ctx = document.getElementById('complaintDistributionChart');
    if (ctx) {
        const statusCounts = departmentComplaints.reduce((acc, c) => {
            acc[c.status] = (acc[c.status] || 0) + 1;
            return acc;
        }, {});
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(statusCounts).map(status => {
                     const statusKey = status.toLowerCase().replace(' ', '');
                     const statusTranslations = {
                         en: { new: 'New', inprogress: 'In Progress', resolved: 'Resolved', escalated: 'Escalated' },
                         ar: { new: 'جديدة', inprogress: 'قيد المعالجة', resolved: 'تم حلها', escalated: 'تم تصعيدها' }
                     };
                     return statusTranslations[isArabic ? 'ar' : 'en'][statusKey] || status;
                }),
                datasets: [{
                    data: Object.values(statusCounts),
                    backgroundColor: ['#003366', '#D4A017', '#28a745', '#dc3545'],
                }]
            }
        });
    }
});
