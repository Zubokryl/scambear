// Универсальная функция для всех статических статей
window.initDisqus = function(articleSlug) {
    // Set Disqus configuration - use current page URL for local/production compatibility
    window.disqus_config = function () {
        // Use the current page URL instead of hardcoded production URL
        this.page.url = window.location.href;
        this.page.identifier = articleSlug;
        this.language = "ru";
    };
    
    // Check if page is already loaded, if not wait for it
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            loadDisqusScript();
        });
    } else {
        // Page is already loaded, load Disqus now
        loadDisqusScript();
    }
    
    function loadDisqusScript() {
        var d = document, s = d.createElement('script');
        s.src = 'https://scambear-01bearscommunity.disqus.com/embed.js';
        s.setAttribute('data-timestamp', new Date().getTime());
        s.async = true;
        
        (d.head || d.body).appendChild(s);
    }
};