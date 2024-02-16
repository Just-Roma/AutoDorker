/*
This file contains search engines, which will be used for gathering links.

Otherwise indexedDB won't work properly.

The following values are supported:

- open_url:
  URL, which will be used for tab's creation.

- start_url:
  URL, which will be used for executing the first dork through href.
  If null then user's behavior will be mimicked (eg clicking btns), which might reduce captcha.
  URL is handled automatically. null must be supported in initializer.js and utils.js
  Make sure that the origin of open_url and start_url, if the latter is not null, are the same.

- active:
  Set true if you want to use engine. If false, then it will not be shown in popup.

- checked:
  Set true to choose engine by default.
*/
const SEARCH_ENGINES = {
  google: {
    open_url: 'https://www.google.com',
    start_url: 'https://www.google.com/search?q=',
    active: true,
    checked: true,
  },
  duckduckgo: {
    open_url: 'https://duckduckgo.com',
    start_url: null,//'https://duckduckgo.com/?q=',
    active: true,
    checked: false,
  },
  brave: {
    open_url: 'https://search.brave.com',
    start_url: null,//'https://search.brave.com/search?q=',
    active: true,
    checked: false,
  },
  ecosia: {
    open_url: 'https://www.ecosia.org',
    start_url: null,//'https://www.ecosia.org/search?method=index&q=',
    active: true,
    checked: false,
  },
  baidu: {
    open_url: 'https://www.baidu.com',
    start_url: null,//'https://www.baidu.com/s?wd=',
    active: true,
    checked: false,
  },
  yahoo: {
    open_url: 'https://search.yahoo.com',
    start_url: 'https://search.yahoo.com/search?p=',
    active: true,
    checked: false,
  },
  yandex: {
    open_url: 'https://yandex.com',
    start_url: 'https://yandex.com/search/?text=',
    active: true,
    checked: false,
  },
  bing: {
    open_url: 'https://www.bing.com',
    start_url: 'https://www.bing.com/search?q=',
    active: true,
    checked: false,
  },
};
