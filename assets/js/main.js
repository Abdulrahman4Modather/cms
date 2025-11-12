
document.addEventListener('DOMContentLoaded', () => {
    const pagePath = window.location.pathname.split('/').pop();
    const isArabic = document.documentElement.lang === 'ar';

    // Load Header and Sidebar
    const headerPath = isArabic ? 'includes/header-ar.html' : 'includes/header.html';
    const sidebarPath = isArabic ? 'includes/sidebar-ar.html' : 'includes/sidebar.html';
    
    // Adjust path for nested pages
    const pathPrefix = (window.location.pathname.includes('/student/') || window.location.pathname.includes('/employee/') || window.location.pathname.includes('/department/') || window.location.pathname.includes('/faculty/')) ? '../' : '';

    const headerContainer = document.getElementById('header-container');
    const sidebarContainer = document.getElementById('sidebar-container');
    
    if (headerContainer) {
        fetch(`${pathPrefix}${headerPath}`)
            .then(response => response.text())
            .then(data => {
                headerContainer.innerHTML = data;
                setupLanguageSwitcher(pagePath, isArabic);
            });
    }

    if (sidebarContainer) {
        fetch(`${pathPrefix}${sidebarPath}`)
            .then(response => response.text())
            .then(data => {
                sidebarContainer.innerHTML = data;
                setActiveSidebarLink(pagePath);
            });
    }

    function setActiveSidebarLink(currentPage) {
        const navLinks = document.querySelectorAll('.sidebar .nav-link');
        navLinks.forEach(link => {
            const linkPage = link.getAttribute('href').split('/').pop();
            if (linkPage === currentPage) {
                link.classList.add('active');
            }
        });
    }
    
    function setupLanguageSwitcher(currentPage, isArabic) {
        const switcherLink = document.getElementById('lang-switcher-link');
        if (switcherLink) {
            let targetPage = '';
            const baseName = currentPage.replace('-ar.html', '').replace('.html', '');

            if (isArabic) {
                // From Arabic to English
                targetPage = `${baseName}.html`;
            } else {
                // From English to Arabic
                targetPage = `${baseName}-ar.html`;
            }

            // Handle special cases for view pages
             if (window.location.search) {
                targetPage += window.location.search;
            }
            
            switcherLink.href = targetPage;
        }
    }
});
