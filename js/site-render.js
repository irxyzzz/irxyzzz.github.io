(function () {
    'use strict';

    const escapeHtml = (value) => String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    const makeLink = (href, label) =>
        `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;

    const makeYears = (years, note = '') => {
        if (!years || !years.length) return '';
        const yearLinks = years.map((item) => makeLink(item.href, item.label)).join(', ');
        const suffix = note ? `, ${escapeHtml(note)}` : '';
        return `<span class="service-years">(${yearLinks}${suffix})</span>`;
    };

    const renderRole = (role) => `<em>${escapeHtml(role)}</em>`;

    const renderRoleList = (roles) => {
        if (!roles || !roles.length) return '';
        return roles.map(renderRole).join(', ');
    };

    const renderJournalService = (item) => {
        if (item.specialIssue) {
            return `${renderRole(item.role)}, Special Issue on "${makeLink(item.specialIssue.href, item.specialIssue.label)}" in ${makeLink(item.journal.href, item.journal.label)}. (Welcome to submit your work by <strong>${escapeHtml(item.deadline)}</strong>)`;
        }

        return `${renderRole(item.role)}, ${makeLink(item.organization.href, item.organization.label)}. (${escapeHtml(item.dates)})`;
    };

    const renderConferenceService = (item) => {
        if (item.assignments) {
            return item.assignments.map((assignment, index) => {
                const organization = index === 0 ? `, ${escapeHtml(item.organization)}` : '';
                return `${renderRole(assignment.role)}${organization} ${makeYears(assignment.years)}`;
            }).join('; ');
        }

        const roles = item.roles ? renderRoleList(item.roles) : renderRole(item.role);
        const inlineLink = item.inlineLink ? ` (${makeLink(item.inlineLink.href, item.inlineLink.label)})` : '';
        const years = makeYears(item.years, item.note);
        return `${roles}, ${escapeHtml(item.organization)}${inlineLink} ${years}`;
    };

    const renderServiceList = (id, items, renderItem) => {
        const list = document.getElementById(id);
        if (!list) return;

        list.innerHTML = items.map((item) => `
            <li>
                <span class="fa-li">
                    <i class="${escapeHtml(item.icon)}" style="font-size: 0.85rem;"></i>
                </span>
                ${renderItem(item)}
            </li>
        `).join('');
    };

    const renderPublicationLinks = (links) => {
        if (!links || !links.length) return '';
        return links.map((link) => `[ ${makeLink(link.url, link.label)} ]`).join(' ');
    };

    const renderBadges = (badges) => {
        if (!badges || !badges.length) return '';
        return badges.map((badge) => `<span class="award-badge"><i class="${escapeHtml(badge.icon)}"></i> ${escapeHtml(badge.label)}</span>`).join(' ');
    };

    const renderPatentVenue = (patent) => {
        if (!patent) return '';

        const formatPatentNumber = (number) => String(number || '').replace(/^US\s*/i, '');

        if (patent.grant && patent.application) {
            return `U.S. Patent ${escapeHtml(formatPatentNumber(patent.grant.number))}, issued ${escapeHtml(patent.grant.date)} (application ${escapeHtml(patent.application.number)}; published as ${escapeHtml(patent.application.publication)} on ${escapeHtml(patent.application.publicationDate)}).`;
        }

        if (patent.grant) {
            return `U.S. Patent ${escapeHtml(formatPatentNumber(patent.grant.number))}, issued ${escapeHtml(patent.grant.date)}.`;
        }

        if (patent.application) {
            const status = patent.application.status ? `; ${escapeHtml(patent.application.status)}` : '';
            return `U.S. Patent Application ${escapeHtml(patent.application.publication)}, published ${escapeHtml(patent.application.publicationDate)} (application ${escapeHtml(patent.application.number)}${status}).`;
        }

        return '';
    };

    const renderAuthors = (authors) => {
        if (!authors || !authors.length) return '';

        const renderedAuthors = authors.map((author) => {
            const safeAuthor = escapeHtml(author);
            return author === 'Runhua Xu' ? `<span>${safeAuthor}</span>` : safeAuthor;
        });

        if (renderedAuthors.length === 1) return `${renderedAuthors[0]}.`;
        if (renderedAuthors.length === 2) return `${renderedAuthors[0]} and ${renderedAuthors[1]}.`;
        return `${renderedAuthors.join(', ')}.`;
    };

    const renderPublication = (item) => {
        const types = item.type || [];
        const titleSuffix = item.titleSuffix ? ` ${escapeHtml(item.titleSuffix)}` : '';
        const venue = item.patent ? renderPatentVenue(item.patent) : item.venue;
        const venueSuffix = item.patent ? '' : (item.venueSuffix ? escapeHtml(item.venueSuffix) : '');
        const badges = renderBadges(item.badges);
        const links = renderPublicationLinks(item.links);

        return `
            <tr data-type="${escapeHtml(types.join(' '))}">
                <th scope="row">${escapeHtml(item.year)}</th>
                <td>
                    <p class="paper-reference">
                        ${renderAuthors(item.authors)}
                        "${escapeHtml(item.title)}"${titleSuffix}
                        <em>${escapeHtml(venue)}</em>${venueSuffix}
                        ${badges}
                        ${links}
                    </p>
                </td>
                <td class="hidden">${escapeHtml(types.join(' '))}</td>
            </tr>
        `;
    };

    const renderPublications = () => {
        const tbody = document.getElementById('publication-list');
        if (!tbody) return;

        tbody.innerHTML = (window.sitePublications || []).map(renderPublication).join('');
    };

    window.renderSiteData = () => {
        const services = window.siteServices || { journal: [], conference: [] };
        renderServiceList('journal-services-list', services.journal || [], renderJournalService);
        renderServiceList('conference-services-list', services.conference || [], renderConferenceService);
        renderPublications();
    };
}());
