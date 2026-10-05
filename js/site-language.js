(function () {
    'use strict';

    // Only presentation text lives here; publication and service records remain shared.
    const chinese = {
        'Curriculum Vitae': '个人简历',
        'Research Areas': '研究方向',
        'Academic Services': '学术服务',
        'Publications': '研究成果',
        'Short Bio': '个人简介',
        'Journal Services': '期刊服务',
        'Conference Services': '会议服务',
        'Journal Review': '期刊审稿',
        'All': '全部',
        'Selected': '代表作',
        'Manuscript': '预印本',
        'Conference': '会议论文',
        'Workshop': '研讨会论文',
        'Journal': '期刊论文',
        'Book Chapter': '专著与章节',
        'Patent': '专利',
        'Application': '申请公开',
        'researchPrivacy': '隐私增强技术与安全联邦学习',
        'researchAI': '人工智能隐私、安全与可信性',
        'researchCrypto': '应用密码学、区块链与访问控制',
        'researchSystems': '面向边缘与云计算的可信计算基础设施',
        'Associate Editor': '编委',
        'Youth Editorial Board Member': '青年编委',
        'Guest Editor': '客座编辑',
        'SSC Member': 'SSC 委员',
        'TPC Member': '程序委员会委员',
        'Publicity Chair': '宣传主席',
        'Publication Chair': '出版主席',
        'Workshop/Tutorial Chair': '研讨会与教程主席',
        'Workshop Chair': '研讨会主席',
        'Organization Chair': '组织主席',
        'Technical Program Committee Co-chair': '程序委员会联合主席',
        'inaugural edition': '首届',
        'IEEE Transactions on Dependable and Secure Computing (IEEE TDSC)': 'IEEE Transactions on Dependable and Secure Computing（IEEE TDSC）',
        'Chinese Journal of Electronics (CJE)': '《电子学报（英文版）》（CJE）',
        'The Network and Distributed System Security Symposium (NDSS)': '网络与分布式系统安全研讨会（NDSS）',
        'ACM Conference on Data and Application Security and Privacy (CODASPY)': 'ACM 数据与应用安全和隐私会议（CODASPY）',
        'ACM Symposium on Access Control Models and Technologies (SACMAT)': 'ACM 访问控制模型与技术研讨会（SACMAT）',
        'The AAAI Conference on Artificial Intelligence (AAAI)': 'AAAI 人工智能会议（AAAI）',
        'IEEE International Conference on Data Mining (ICDM)': 'IEEE 国际数据挖掘会议（ICDM）',
        'European Symposium on Research in Computer Security (ESORICS)': '欧洲计算机安全研究研讨会（ESORICS）',
        'IEEE International Conference on Big Data (BigData)': 'IEEE 国际大数据会议（BigData）',
        'IEEE International Conference on Collaboration and Internet Computing (CIC)': 'IEEE 国际协作与互联网计算会议（CIC）',
        'IEEE International Conference on Trust, Privacy and Security in Intelligent Systems, and Applications (TPS)': 'IEEE 智能系统与应用中的信任、隐私与安全国际会议（TPS）',
        'IEEE International Conference on Cognitive Machine Intelligence (CogMI)': 'IEEE 国际认知机器智能会议（CogMI）',
        'IEEE Conference on Resilience and Integrated Security for Space and Critical Systems (RISC)': 'IEEE 空间与关键系统韧性及综合安全会议（RISC）',
        'IEEE Workshop on Trustworthy and Privacy-Preserving Human-AI Collaboration': 'IEEE 可信与隐私保护人机协作研讨会',
        'The 2023 International Workshop on Privacy-Preserving Machine Learning': '2023 年隐私保护机器学习国际研讨会',
        'The 2024 1st Workshop on Large Language Models and Cybersecurity': '2024 年首届大语言模型与网络安全研讨会',
        'Security & Privacy': '安全与隐私',
        'AI & Data': '人工智能与数据',
        'Systems & Computing': '系统与计算',
        'Networking & Communications': '网络与通信',
        'Reviewed for leading journals across security, privacy, AI, data, networking, distributed systems, and emerging computing.': '为安全与隐私、人工智能、数据、网络、分布式系统及新兴计算等领域的期刊担任审稿人。',
        'more': '更多',
        'Distinguished Paper Award': '杰出论文奖',
        'Best Paper Award': '最佳论文奖',
        'slides': '报告幻灯片',
        'appendix': '附录',
        'pending': '审查中'
    };

    const chineseHtml = {
        intro: `<div class="intro-heading">
                <h1 class="intro-name">许润华<span lang="en">Runhua Xu</span></h1>
                <p><a href="https://ev.buaa.edu.cn/" target="_blank" rel="noopener noreferrer">北京航空航天大学</a>
                <a href="https://scse.buaa.edu.cn/English/Home.htm" target="_blank" rel="noopener noreferrer">计算机学院</a>教授</p>
            </div>
            <p>曾任 <a href="https://www.research.ibm.com/labs/almaden/" target="_blank" rel="noopener noreferrer">IBM Research</a> 研究员，隶属 AI S&amp;P Solutions 团队。</p>
            <p>博士毕业于<a href="http://www.pitt.edu/" target="_blank" rel="noopener noreferrer">美国匹兹堡大学</a><a href="http://www.sci.pitt.edu/" target="_blank" rel="noopener noreferrer">计算与信息学院</a>，获信息安全博士学位，师从 IEEE Fellow <a href="http://www.sis.pitt.edu/~jjoshi/" target="_blank" rel="noopener noreferrer">James Joshi 教授</a>。</p>
            <p><a href="https://ev.buaa.edu.cn/" target="_blank" rel="noopener noreferrer">北航</a>硕士（导师：Bo Lang 教授），<a href="https://en.nwpu.edu.cn/" target="_blank" rel="noopener noreferrer">西北工业大学</a>学士。</p>`,
        bio: '许润华，博士，北京航空航天大学计算机学院教授。主要研究方向包括隐私增强技术与安全联邦学习、人工智能隐私安全与可信性、应用密码学、区块链与访问控制，以及面向边缘与云计算的可信计算基础设施。相关成果发表于 ACM CCS、USENIX Security、NeurIPS、AAAI、IEEE TDSC、IEEE TIFS 等会议和期刊，获得 ACM CCS 2023 杰出论文奖、2023 年度中国区块链优秀论文奖及 IEEE CLOUD 2022 唯一最佳论文奖。担任 IEEE PES 电力系统通信与网络安全技术委员会电力人工智能分委会副主席、CCF 区块链专委会执行委员、CCF 网络与系统安全专委会执行委员、中国电子学会高级会员及网络空间安全专委会委员，现任 IEEE TDSC 编委、ELSP Blockchain 青年编委，曾任 Chinese Journal of Electronics（CJE）青年编委。'
    };

    let language = 'en';
    const originals = new WeakMap();
    const isChinese = () => language === 'zh';
    const t = (text) => isChinese() && Object.hasOwn(chinese, text) ? chinese[text] : text;
    const date = (value) => {
        if (!isChinese() || !value) return value;
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? value : new Intl.DateTimeFormat('zh-CN', {
            year: 'numeric', month: 'long', day: 'numeric'
        }).format(parsed);
    };
    const term = (value) => isChinese() ? value.replace(/Present/g, '至今') : value;

    const applyLanguage = () => {
        document.documentElement.lang = isChinese() ? 'zh-CN' : 'en';
        document.querySelectorAll('[data-i18n]').forEach((element) => {
            if (!originals.has(element)) originals.set(element, element.textContent);
            element.textContent = isChinese()
                ? (chinese[element.dataset.i18n] || originals.get(element))
                : originals.get(element);
        });
        document.querySelectorAll('[data-i18n-html]').forEach((element) => {
            if (!originals.has(element)) originals.set(element, element.innerHTML);
            element.innerHTML = isChinese() ? chineseHtml[element.dataset.i18nHtml] : originals.get(element);
        });
        document.title = isChinese() ? '许润华 | 北京航空航天大学' : 'Runhua Xu @ Beihang University';
        document.querySelector('meta[property="og:title"]').content = document.title;
        const description = document.querySelector('meta[name="description"]');
        const socialDescription = document.querySelector('meta[property="og:description"]');
        [description, socialDescription].forEach((element) => {
            if (!originals.has(element)) originals.set(element, element.content);
            element.content = isChinese()
                ? '许润华，北京航空航天大学计算机学院教授，研究方向包括隐私增强技术、安全联邦学习、人工智能隐私安全、应用密码学与可信计算基础设施。'
                : originals.get(element);
        });
        const toggle = document.getElementById('languageToggle');
        const label = document.getElementById('languageLabel');
        toggle.title = isChinese() ? 'Switch to English' : '切换到中文';
        toggle.setAttribute('aria-label', toggle.title);
        label.textContent = isChinese() ? 'EN' : '中';
        label.lang = isChinese() ? 'en' : 'zh-CN';
        const theme = document.getElementById('themeToggle');
        theme.title = isChinese() ? '切换明暗主题' : 'Toggle dark/light mode';
        theme.setAttribute('aria-label', theme.title);
        document.querySelector('.photos img').alt = isChinese()
            ? '许润华，北京航空航天大学教授' : 'Runhua Xu - Professor at Beihang University';
    };

    window.siteI18n = {
        t, date, term, isChinese,
        init() {
            // Each visit starts in English; Chinese is an explicit, page-local choice.
            language = 'en';
            applyLanguage();
            document.getElementById('languageToggle').addEventListener('click', () => {
                language = isChinese() ? 'en' : 'zh';
                applyLanguage();
                window.dispatchEvent(new Event('site-language-change'));
            });
        }
    };
}());
