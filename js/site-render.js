(function () {
    'use strict';

    const { t, date, term, isChinese } = window.siteI18n;

    const escapeHtml = (value) => String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    const makeLink = (href, label) => href
        ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t(label))}</a>`
        : escapeHtml(t(label));

    const makeYears = (years, note = '') => {
        if (!years || !years.length) return '';
        const yearLinks = years.map((item) => makeLink(item.href, item.label)).join(', ');
        const suffix = note ? `, ${escapeHtml(t(note))}` : '';
        return `<span class="service-years">(${yearLinks}${suffix})</span>`;
    };

    const renderRole = (role) => `<em>${escapeHtml(t(role))}</em>`;

    const renderRoleList = (roles) => {
        if (!roles || !roles.length) return '';
        return roles.map(renderRole).join(', ');
    };

    const renderJournalService = (item) => {
        if (item.specialIssue) {
            if (isChinese()) {
                const status = item.deadline
                    ? `（欢迎投稿，截止日期：<strong>${escapeHtml(date(item.deadline))}</strong>）`
                    : (item.dates ? `（${escapeHtml(item.dates)}）` : '');
                return `${renderRole(item.role)}，${makeLink(item.journal.href, item.journal.label)} 专刊“${makeLink(item.specialIssue.href, item.specialIssue.label)}”。${status}`;
            }
            const status = item.deadline
                ? ` (Welcome to submit your work by <strong>${escapeHtml(item.deadline)}</strong>)`
                : (item.dates ? ` (${escapeHtml(item.dates)})` : '');
            return `${renderRole(item.role)}, Special Issue on "${makeLink(item.specialIssue.href, item.specialIssue.label)}" in ${makeLink(item.journal.href, item.journal.label)}.${status}`;
        }

        if (isChinese()) {
            return `${renderRole(item.role)}，${makeLink(item.organization.href, item.organization.label)}（${escapeHtml(term(item.dates))}）`;
        }
        return `${renderRole(item.role)}, ${makeLink(item.organization.href, item.organization.label)}. (${escapeHtml(term(item.dates))})`;
    };

    const renderConferenceService = (item) => {
        if (item.assignments) {
            return item.assignments.map((assignment, index) => {
                const organization = index === 0 ? `, ${escapeHtml(t(item.organization))}` : '';
                const roles = assignment.roles ? renderRoleList(assignment.roles) : renderRole(assignment.role);
                return `${roles}${organization} ${makeYears(assignment.years, assignment.note)}`;
            }).join('; ');
        }

        const roles = item.roles ? renderRoleList(item.roles) : renderRole(item.role);
        const inlineLink = item.inlineLink ? ` (${makeLink(item.inlineLink.href, item.inlineLink.label)})` : '';
        const years = makeYears(item.years, item.note);
        return `${roles}, ${escapeHtml(t(item.organization))}${inlineLink} ${years}`;
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
                <span class="review-group-title">${escapeHtml(t(group.label))}:</span>
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
            <p class="review-summary">${escapeHtml(t(reviews.summary || ''))}</p>
            <ul class="fa-ul review-groups">
                ${groups.map((group) => renderReviewGroup(group, journalById)).join('')}
            </ul>
            <details class="review-more">
                <summary>${escapeHtml(t('more'))}</summary>
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
        return badges.map((badge) => `<span class="award-badge"><i class="${escapeHtml(badge.icon)}"></i> ${escapeHtml(t(badge.label))}</span>`).join(' ');
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
        return /[.!?)。！？]$/.test(text) ? text : `${text}.`;
    };

    const cleanTitle = (title) => String(title || '').trim().replace(/[.,]\s*$/, '');

    const renderPatentVenue = (patent) => {
        if (!patent) return '';

        const formatPatentNumber = (number) => String(number || '').replace(/^US\s*/i, '');
        const country = patent.country === 'CN' ? '中国' : '美国';
        const patentLabel = patent.country === 'CN' ? 'Chinese Patent' : 'U.S. Patent';
        const examinationDate = patent.application && patent.application.examination
            ? patent.application.examination.date : '';

        if (isChinese()) {
            const grant = patent.grant;
            const application = patent.application;
            const granted = grant ? `${country}专利 ${grant.number}，授权日期：${date(grant.date)}` : '';
            const applied = application
                ? `申请号：${application.number}；公开号：${application.publication}；公开日期：${date(application.publicationDate)}` : '';
            if (grant && application) return `${granted}（${applied}）。`;
            if (grant) return `${granted}。`;
            const examination = examinationDate ? `；实质审查请求生效：${date(examinationDate)}` : '';
            if (application) return `${country}专利申请，${applied}${application.status ? `；${t(application.status)}` : ''}${examination}。`;
            return '';
        }

        if (patent.grant && patent.application) {
            return `${patentLabel} ${formatPatentNumber(patent.grant.number)}, issued ${patent.grant.date} (application ${patent.application.number}; published as ${patent.application.publication} on ${patent.application.publicationDate}).`;
        }

        if (patent.grant) {
            return `${patentLabel} ${formatPatentNumber(patent.grant.number)}, issued ${patent.grant.date}.`;
        }

        if (patent.application) {
            const status = patent.application.status ? `; ${patent.application.status}` : '';
            const examination = examinationDate ? `; substantive examination request effective ${examinationDate}` : '';
            return `${patentLabel} Application ${patent.application.publication}, published ${patent.application.publicationDate} (application ${patent.application.number}${status}${examination}).`;
        }

        return '';
    };

    const renderAuthors = (authors, language) => {
        if (!authors || !authors.length) return '';

        const renderedAuthors = authors.map((author) => {
            const safeAuthor = escapeHtml(author);
            return ['Runhua Xu', '许润华'].includes(author) ? `<span class="paper-author-self">${safeAuthor}</span>` : safeAuthor;
        });

        if (language === 'zh') return `${renderedAuthors.join('、')}。`;
        if (renderedAuthors.length === 1) return `${renderedAuthors[0]}.`;
        if (renderedAuthors.length === 2) return `${renderedAuthors[0]} and ${renderedAuthors[1]}.`;
        return `${renderedAuthors.slice(0, -1).join(', ')}, and ${renderedAuthors[renderedAuthors.length - 1]}.`;
    };

    const renderPublicationTitle = (item) => {
        const title = cleanTitle(item.title);
        if (!title) return '';

        const titleSuffix = item.titleSuffix ? ` ${escapeHtml(item.titleSuffix.trim())}` : '';
        const sentenceEnd = /[!?。！？]$/.test(title) ? '' : (item.language === 'zh' ? '。' : '.');
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
        const authors = renderAuthors(item.authors, item.language);
        const title = renderPublicationTitle(item);
        const venue = renderPublicationVenue(item);
        const extras = renderPublicationExtras(item);

        return `
            <tr data-type="${escapeHtml(types.join(' '))}" data-only-in="${escapeHtml(item.onlyIn || '')}">
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

        const publications = [...(window.sitePublications || []), ...(window.siteChinesePatents || [])]
            .sort((a, b) => Number(b.year) - Number(a.year));
        tbody.innerHTML = publications.map(renderPublication).join('');
    };

    window.renderSiteData = () => {
        const services = window.siteServices || { journal: [], conference: [] };
        renderServiceList('journal-services-list', services.journal || [], renderJournalService);
        renderServiceList('conference-services-list', services.conference || [], renderConferenceService);
        renderJournalReviews();
        renderPublications();
    };
}());
