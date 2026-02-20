import { defineContentScript } from 'wxt/sandbox';

export default defineContentScript({
    matches: ['*://*.linkedin.com/in/*'],
    main() {
        console.log('JobFit Analyzer: LinkedIn Content Script Injected');

        function extractProfileData() {
            // Robust Locators using semantic HTML and common classes on LinkedIn

            // Full Name
            const nameEl = document.querySelector('h1.text-heading-xlarge') || document.querySelector('.text-heading-xlarge');
            const fullName = nameEl?.textContent?.trim() || 'Unknown';

            // Current Role / Headline
            const roleEl = document.querySelector('.text-body-medium.break-words');
            const currentRole = roleEl?.textContent?.trim() || 'No headline';

            // About Section
            const aboutEl = document.querySelector('#about')?.parentElement?.querySelector('.display-flex.ph5.pv3');
            const about = aboutEl?.textContent?.trim() || '';

            // Experience extraction 
            // Look for the experience section
            const experienceElements = document.querySelectorAll('#experience')?.length > 0
                ? Array.from(document.querySelectorAll('#experience')[0].parentElement?.querySelectorAll('.pvs-list__paged-list-item') || [])
                : [];

            const experience = experienceElements.map((el) => {
                // Find title, company, duration depending on LinkedIn's DOM structure
                const titleEl = el.querySelector('.t-bold span[aria-hidden="true"]');
                const companyEl = el.querySelector('.t-normal span[aria-hidden="true"]');
                const durationEl = el.querySelector('.t-black--light span[aria-hidden="true"]');

                return {
                    title: titleEl?.textContent?.trim() || '',
                    company: companyEl?.textContent?.trim() || '',
                    duration: durationEl?.textContent?.trim() || ''
                };
            }).filter(exp => exp.title);

            // Skills extraction
            const skillsElements = document.querySelectorAll('#skills')?.length > 0
                ? Array.from(document.querySelectorAll('#skills')[0].parentElement?.querySelectorAll('.pvs-list__paged-list-item') || [])
                : [];

            const skills = skillsElements.map(el => {
                const skillNameEl = el.querySelector('.t-bold span[aria-hidden="true"]');
                return skillNameEl?.textContent?.trim();
            }).filter(Boolean);

            // Multimodal: Detect featured media
            const featuredMedia = document.querySelectorAll('.pv-featured-media').length;

            const profileData = {
                fullName,
                currentRole,
                about,
                experience,
                skills,
                hasFeaturedMedia: featuredMedia > 0,
                url: window.location.href
            };

            console.log('Extracted Profile Data:', profileData);
            return profileData;
        }

        // Since LinkedIn is an SPA, we might need a MutationObserver to detect when profile data is loaded
        let hasExtracted = false;
        const observer = new MutationObserver(() => {
            const nameHeader = document.querySelector('h1.text-heading-xlarge');
            if (nameHeader && !hasExtracted) {
                hasExtracted = true;

                // Slight delay to ensure rest of the DOM sections load
                setTimeout(() => {
                    const data = extractProfileData();
                    // Store it in Chrome local storage to be accessed by popup & background script
                    chrome.storage.local.set({ linkedinProfile: data });
                }, 2000);
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        // Initial check
        setTimeout(() => {
            if (document.querySelector('h1.text-heading-xlarge')) {
                hasExtracted = true;
                const data = extractProfileData();
                chrome.storage.local.set({ linkedinProfile: data });
            }
        }, 3000);
    },
});
