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
                    <i class="service-icon ${escapeHtml(item.icon)}"></i>
                </span>
                ${renderItem(item)}
            </li>
        `).join('');
    };

    const makeJournalLabel = (journal) => {
        if (!journal) return '';
        return escapeHtml(journal.abbr || journal.name);
    };

    const renderReviewGroup = (group, journalById) => {
        const journals = (group.featured || [])
            .map((id) => journalById.get(id))
            .filter(Boolean);

        if (!journals.length) return '';

        const selectedJournals = journals.map(makeJournalLabel).join(' / ');

        return `
            <li class="review-group">
                <span class="fa-li">
                    <i class="service-icon ${escapeHtml(group.icon)}"></i>
                </span>
                <span class="review-group-title">${escapeHtml(group.label)}:</span>
                <span class="review-journal-tags">${selectedJournals} <span class="review-ellipsis">...</span></span>
            </li>
        `;
    };

    const renderJournalReviews = () => {
        const panel = document.getElementById('journal-review-panel');
        if (!panel) return;

        const reviews = window.siteReviews || { groups: [], journals: [] };
        const journals = reviews.journals || [];
        const journalById = new Map(journals.map((journal) => [journal.id, journal]));
        const groups = reviews.groups || [];
        const completeList = journals.map((journal) => `
            <li data-review-category="${escapeHtml(journal.category)}">
                ${makeJournalLabel(journal)}
            </li>
        `).join('');

        panel.innerHTML = `
            <p class="review-summary">${escapeHtml(reviews.summary || '')}</p>
            <ul class="fa-ul review-groups">
                ${groups.map((group) => renderReviewGroup(group, journalById)).join('')}
            </ul>
            <details class="review-more">
                <summary>more</summary>
                <ul class="review-complete-list">
                    ${completeList}
                </ul>
            </details>
        `;
    };

    const renderPublicationLinks = (links) => {
        if (!links || !links.length) return '';
        const renderedLinks = links
            .map((link) => `<span class="paper-link-item">[ ${makeLink(link.url, link.label)} ]</span>`)
            .join(' ');
        return `<span class="paper-links">${renderedLinks}</span>`;
    };

    const renderBadges = (badges) => {
        if (!badges || !badges.length) return '';
        return badges.map((badge) => `<span class="award-badge"><i class="${escapeHtml(badge.icon)}"></i> ${escapeHtml(badge.label)}</span>`).join(' ');
    };

    const renderNotes = (notes) => {
        const normalizedNotes = Array.isArray(notes) ? notes : (notes ? [notes] : []);
        if (!normalizedNotes.length) return '';
        return normalizedNotes
            .map((note) => `<span class="paper-note">${escapeHtml(note)}</span>`)
            .join(' ');
    };

    const ensureSentenceEnd = (value) => {
        const text = String(value || '').trim();
        if (!text) return '';
        return /[.!?)]$/.test(text) ? text : `${text}.`;
    };

    const cleanTitle = (title) => String(title || '').trim().replace(/[.,]\s*$/, '');

    const renderPatentVenue = (patent) => {
        if (!patent) return '';

        const formatPatentNumber = (number) => String(number || '').replace(/^US\s*/i, '');

        if (patent.grant && patent.application) {
            return `U.S. Patent ${formatPatentNumber(patent.grant.number)}, issued ${patent.grant.date} (application ${patent.application.number}; published as ${patent.application.publication} on ${patent.application.publicationDate}).`;
        }

        if (patent.grant) {
            return `U.S. Patent ${formatPatentNumber(patent.grant.number)}, issued ${patent.grant.date}.`;
        }

        if (patent.application) {
            const status = patent.application.status ? `; ${patent.application.status}` : '';
            return `U.S. Patent Application ${patent.application.publication}, published ${patent.application.publicationDate} (application ${patent.application.number}${status}).`;
        }

        return '';
    };

    const renderAuthors = (authors) => {
        if (!authors || !authors.length) return '';

        const renderedAuthors = authors.map((author) => {
            const safeAuthor = escapeHtml(author);
            return author === 'Runhua Xu' ? `<span class="paper-author-self">${safeAuthor}</span>` : safeAuthor;
        });

        if (renderedAuthors.length === 1) return `${renderedAuthors[0]}.`;
        if (renderedAuthors.length === 2) return `${renderedAuthors[0]} and ${renderedAuthors[1]}.`;
        return `${renderedAuthors.slice(0, -1).join(', ')}, and ${renderedAuthors[renderedAuthors.length - 1]}.`;
    };

    const renderPublicationTitle = (item) => {
        const title = cleanTitle(item.title);
        if (!title) return '';

        const titleSuffix = item.titleSuffix ? ` ${escapeHtml(item.titleSuffix.trim())}` : '';
        const sentenceEnd = /[!?]$/.test(title) ? '' : '.';
        return `<span class="paper-title">&ldquo;${escapeHtml(title)}&rdquo;${titleSuffix}${sentenceEnd}</span>`;
    };

    const renderPublicationVenue = (item) => {
        const venue = item.patent
            ? renderPatentVenue(item.patent)
            : `${item.venue || ''}${item.venueSuffix || ''}`;

        if (!String(venue || '').trim()) return '';
        return `<span class="paper-venue"><em>${escapeHtml(ensureSentenceEnd(venue))}</em></span>`;
    };

    const renderPublicationExtras = (item) => {
        const extras = [
            renderBadges(item.badges),
            renderPublicationLinks(item.links),
            renderNotes(item.notes || item.note)
        ].filter(Boolean);

        if (!extras.length) return '';
        return `<span class="paper-extras">${extras.join(' ')}</span>`;
    };

    const renderPublication = (item) => {
        const types = item.type || [];
        const authors = renderAuthors(item.authors);
        const title = renderPublicationTitle(item);
        const venue = renderPublicationVenue(item);
        const extras = renderPublicationExtras(item);

        return `
            <tr data-type="${escapeHtml(types.join(' '))}">
                <th scope="row">${escapeHtml(item.year)}</th>
                <td>
                    <p class="paper-reference">
                        <span class="paper-authors">${authors}</span>
                        ${title}
                        ${venue}
                        ${extras}
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
        renderJournalReviews();
        renderPublications();
    };
}());
