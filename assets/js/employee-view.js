
document.addEventListener('DOMContentLoaded', async () => {
    const isArabic = document.documentElement.lang === 'ar';
    const params = new URLSearchParams(window.location.search);
    const employeeId = params.get('id');

    if (!employeeId) {
        document.getElementById('profile-content').innerHTML = `<div class="alert alert-danger">${isArabic ? 'لم يتم العثور على معرف الموظف.' : 'Employee ID not found.'}</div>`;
        return;
    }

    const [employees, departments, complaints, students] = await Promise.all([
        fetch('../data/employees.json').then(res => res.json()),
        fetch('../data/departments.json').then(res => res.json()),
        fetch('../data/complaints.json').then(res => res.json()),
        fetch('../data/students.json').then(res => res.json())
    ]);
    
    const employee = employees.find(e => e.id === employeeId);
     if (!employee) {
        document.getElementById('profile-content').innerHTML = `<div class="alert alert-danger">${isArabic ? 'لم يتم العثور على الموظف.' : 'Employee not found.'}</div>`;
        return;
    }

    const department = departments.find(d => d.id === employee.departmentId);
    const assignedComplaints = complaints.filter(c => c.employeeId === employeeId);

    const translations = {
        en: {
            assignedComplaints: "Assigned Complaints",
            resolvedComplaints: "Resolved Complaints",
            avgResolutionTime: "Avg. Resolution Time",
            days: "Days",
            role: "Role",
            department: "Department",
            email: "Email",
            id: "ID",
            title: "Title",
            student: "Student",
            date: "Date",
            status: "Status"
        },
        ar: {
            assignedComplaints: "الشكاوى المعينة",
            resolvedComplaints: "الشكاوى التي تم حلها",
            avgResolutionTime: "متوسط وقت الحل",
            days: "أيام",
            role: "الدور",
            department: "القسم",
            email: "البريد الإلكتروني",
            id: "المعرف",
            title: "العنوان",
            student: "الطالب",
            date: "التاريخ",
            status: "الحالة"
        }
    };
    const t = translations[isArabic ? 'ar' : 'en'];

    // Render Header
     document.getElementById('profile-header-container').innerHTML = `
        <div class="profile-header mb-4">
            <div>
                <h2 class="mb-0">${employee.name}</h2>
                <p class="mb-0 fs-5">${t.role}: ${employee.role} | ${t.department}: ${department.name || 'N/A'}</p>
                <p class="text-white-50">${t.email}: ${employee.email}</p>
            </div>
        </div>
    `;

    // Render Stats
    document.getElementById('stats-container').innerHTML = `
        <div class="col-md-4"><div class="card text-center p-3"><h4 class="h1">${assignedComplaints.length}</h4><p class="text-muted mb-0">${t.assignedComplaints}</p></div></div>
        <div class="col-md-4"><div class="card text-center p-3"><h4 class="h1">${assignedComplaints.filter(c => c.status === 'Resolved').length}</h4><p class="text-muted mb-0">${t.resolvedComplaints}</p></div></div>
        <div class="col-md-4"><div class="card text-center p-3"><h4 class="h1">2.5</h4><p class="text-muted mb-0">${t.avgResolutionTime} (${t.days})</p></div></div>
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
    
    // Render Table
    const tableBody = document.getElementById('complaints-table-body');
    if (assignedComplaints.length > 0) {
        tableBody.innerHTML = assignedComplaints.map(c => {
            const student = students.find(s => s.id === c.studentId);
            return `
                <tr>
                    <td>${c.id}</td>
                    <td>${c.title}</td>
                    <td>${student ? student.name : 'N/A'}</td>
                    <td>${c.date}</td>
                    <td>${getStatusBadge(c.status)}</td>
                </tr>
            `;
        }).join('');
    } else {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center">${isArabic ? 'لا توجد شكاوى معينة.' : 'No assigned complaints.'}</td></tr>`;
    }
});