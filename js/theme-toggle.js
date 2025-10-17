/**
 * 主题切换功能
 * 支持深色/浅色模式切换，并保存用户偏好到 localStorage
 */

(function() {
    'use strict';

    // 获取保存的主题偏好
    const getStoredTheme = () => localStorage.getItem('theme');
    const setStoredTheme = (theme) => localStorage.setItem('theme', theme);
    
    // 根据当前时间判断是白天还是夜晚
    const getTimeBasedTheme = () => {
        const hour = new Date().getHours();
        // 6:00-18:00 为白天，使用浅色模式
        // 18:00-6:00 为夜晚，使用深色模式
        return (hour >= 6 && hour < 18) ? 'light' : 'dark';
    };
    
    // 获取系统主题偏好
    const getSystemTheme = () => {
        return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    };
    
    // 获取推荐的主题
    const getPreferredTheme = () => {
        const storedTheme = getStoredTheme();
        if (storedTheme) {
            // 用户已手动设置过，优先使用用户设置
            return storedTheme;
        }
        // 否则根据时间自动判断
        return getTimeBasedTheme();
    };
    
    // 设置主题
    const setTheme = (theme) => {
        const body = document.body;
        const themeIcon = document.getElementById('themeIcon');
        
        if (theme === 'light') {
            body.classList.add('light-mode');
            if (themeIcon) {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
            }
        } else {
            body.classList.remove('light-mode');
            if (themeIcon) {
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
            }
        }
        
        setStoredTheme(theme);
        
        // 触发自定义事件，便于其他脚本监听主题变化
        window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
    };
    
    // 切换主题
    const toggleTheme = () => {
        const currentTheme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    };
    
    // 初始化主题
    const initTheme = () => {
        // 页面加载时立即设置主题（避免闪烁）
        const preferredTheme = getPreferredTheme();
        setTheme(preferredTheme);
        
        console.log('Theme initialized:', preferredTheme);
        console.log('Current hour:', new Date().getHours());
        
        // 绑定切换按钮事件
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                toggleTheme();
                console.log('Theme toggled by user');
            });
            
            // 添加键盘支持
            themeToggle.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleTheme();
                }
            });
        }
        
        // 监听系统主题变化（仅供参考，不自动切换）
        const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
        mediaQuery.addEventListener('change', (e) => {
            console.log('System theme changed to:', e.matches ? 'light' : 'dark');
            // 只在用户没有手动设置偏好时跟随系统
            if (!getStoredTheme()) {
                const newTheme = getTimeBasedTheme();
                setTheme(newTheme);
                console.log('Auto-switched theme to:', newTheme);
            }
        });
    };
    
    // DOM 加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTheme);
    } else {
        initTheme();
    }
    
    // 暴露给全局（可选）
    window.themeToggle = {
        setTheme,
        toggleTheme,
        getCurrentTheme: () => document.body.classList.contains('light-mode') ? 'light' : 'dark'
    };
})();
