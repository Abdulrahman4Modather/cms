
document.addEventListener('DOMContentLoaded', async () => {
    const isArabic = document.documentElement.lang === 'ar';
    const params = new URLSearchParams(window.location.search);
    const studentId = params.get('id');

    if (!studentId) {
        document.getElementById('profile-content').innerHTML = `<div class="alert alert-danger">${isArabic ? 'لم يتم العثور على معرف الطالب.' : 'Student ID not found.'}</div>`;
        return;
    }

    const [students, departments, faculties, complaints] = await Promise.all([
        fetch('../data/students.json').then(res => res.json()),
        fetch('../data/departments.json').then(res => res.json()),
        fetch('../data/faculties.json').then(res => res.json()),
        fetch('../data/complaints.json').then(res => res.json())
    ]);
    
    const student = students.find(s => s.id === studentId);
    if (!student) {
        document.getElementById('profile-content').innerHTML = `<div class="alert alert-danger">${isArabic ? 'لم يتم العثور على الطالب.' : 'Student not found.'}</div>`;
        return;
    }
    
    const department = departments.find(d => d.id === student.departmentId);
    const faculty = faculties.find(f => f.id === student.facultyId);
    const studentComplaints = complaints.filter(c => c.studentId === studentId);
    
    const translations = {
        en: {
            totalComplaints: "Total Complaints",
            inProgress: "In Progress",
            resolved: "Resolved",
            department: "Department",
            faculty: "Faculty",
            email: "Email",
            complaintHistory: "Complaint History",
            id: "ID",
            title: "Title",
            date: "Date",
            status: "Status",
        },
        ar: {
            totalComplaints: "إجمالي الشكاوى",
            inProgress: "قيد المعالجة",
            resolved: "تم حلها",
            department: "القسم",
            faculty: "الكلية",
            email: "البريد الإلكتروني",
            complaintHistory: "سجل الشكاوى",
            id: "المعرف",
            title: "العنوان",
            date: "التاريخ",
            status: "الحالة",
        }
    };
    const t = translations[isArabic ? 'ar' : 'en'];

    // Render Profile Header
    document.getElementById('profile-header-container').innerHTML = `
        <div class="profile-header mb-4">
            <div>
                <h2 class="mb-0">${student.name}</h2>
                <p class="mb-0 fs-5">${t.department}: ${department.name || 'N/A'} | ${t.faculty}: ${faculty.name || 'N/A'}</p>
                <p class="text-white-50">${t.email}: ${student.email}</p>
            </div>
        </div>
    `;

    // Render Stats
    document.getElementById('stats-container').innerHTML = `
        <div class="col-md-4"><div class="card text-center p-3"><h4 class="h1">${studentComplaints.length}</h4><p class="text-muted mb-0">${t.totalComplaints}</p></div></div>
        <div class="col-md-4"><div class="card text-center p-3"><h4 class="h1">${studentComplaints.filter(c => c.status === 'In Progress').length}</h4><p class="text-muted mb-0">${t.inProgress}</p></div></div>
        <div class="col-md-4"><div class="card text-center p-3"><h4 class="h1">${studentComplaints.filter(c => c.status === 'Resolved').length}</h4><p class="text-muted mb-0">${t.resolved}</p></div></div>
    `;
    
     const getStatusBadge = (status) => {
        const statusKey = status.toLowerCase().replace(' ', '');
        const statusTranslations = {
            en: { new: 'New', inprogress: 'In Progress', resolved: 'Resolved', escalated: 'Escalated' },
            ar: { new: 'جديدة', inprogress: 'قيد المعالجة', resolved: 'تم حلها', escalated: 'تم تصعيدها' }
        };
        const statusText = statusTranslations[isArabic ? 'ar' : 'en'][statusKey] || status;
        
        const badgeClasses = {
            'New': 'bg-primary',
            'In Progress': 'bg-warning text-dark',
            'Resolved': 'bg-success',
            'Escalated': 'bg-danger',
        };
        return `<span class="badge ${badgeClasses[status]}">${statusText}</span>`;
    };

    // Render Complaints Table
    const complaintsTableBody = document.getElementById('complaints-table-body');
    if (studentComplaints.length > 0) {
        complaintsTableBody.innerHTML = studentComplaints.map(c => `
            <tr>
                <td>${c.id}</td>
                <td>${c.title}</td>
                <td>${c.date}</td>
                <td>${getStatusBadge(c.status)}</td>
            </tr>
        `).join('');
    } else {
        complaintsTableBody.innerHTML = `<tr><td colspan="4" class="text-center">${isArabic ? 'لا يوجد شكاوى لهذا الطالب.' : 'No complaints found for this student.'}</td></tr>`;
    }
});