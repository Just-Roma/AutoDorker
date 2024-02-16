# AutoDorker
Configurable extension for Chromium browsers to improve the productivity of OSINT/Recon.  
Currently supported engines: Google, Yahoo, Bing, Yandex, Baidu, DuckDuckGo, Brave, Ecosia.  
All you have to do is to choose your favorite dorks, define configurations and solve some captcha.  
The extension will do the hard work for you.

# Install
1. Download ZIP.
2. Unzip the file in some folder.
3. Open Chrome/Firefox/Opera.
4. Depending on the browser enter one of the following in the address bar:
    - Chrome:  
      chrome://extensions
    - Opera:  
      opera://extensions
    - Firefox:  
      about:debugging#/runtime/this-firefox
5. If Firefox, then rename the manifest_fire.json to manifest.json and remove/rename the original manifest.json.
6. Click on "Load unpacked"/"Load Temporary Add-on" or on equivalent in your browser's language.  
   Choose the unzipped folder and click open or press enter.
7. Adjust the esxtension's settings:
    - Opera: choose the "Allow access to search page results":
      
      <img src="https://github.com/Just-Roma/AutoDorker/assets/64587275/b1e8557b-d4b2-4d7b-b9c4-b6df8acf2ec7" width="750" height="300">
    - Firefox: allow the "Access your data for all websites" in the about:addons "Extensions" tab:
      
      <img src="https://github.com/Just-Roma/AutoDorker/assets/64587275/1f1aec89-f665-4b51-b912-cfb184d77164" width="750" height="400">

# How to use:  
The extension can execute hundreds of dorks for a single engine while executing all engines simultaneously. It shall also be possible to execute several thousands dorks, but it depends on how much memory is available in the sessionStorage. If you want to use all engines at the same time, make sure that you have enough RAM, because simultaneous execution would consume ~ 1Gb memory.

Available configurations files:  
  - ./dorks.js is to add dorks for engine(s).  
  - ./configurations.js to adjust extension's settings.  
  - ./src/engines/search_engines_configs.js to activate/deactivate and check/uncheck single engines.

Some quirks were observed while testing/using:  
  - Google can simetimes get stuck when scrolling down the page. The reason for it is, presumably, some unknown conflict between trying to load more results and captcha. 
    If you notice that something similar happens, then just reload the page. The captcha shall appear. After solving it, the execution will proceed.  
  - Yahoo seems to not be able to go beyond 143 page. So it can get stuck there. If that happens then you can do the following:  
    Stop the page loading by clicking the "X" button, it shall be stopped before results were loaded, so the extension would think that there are no results and will execute the next dork. 
    The same trick also works if you just dont want Yahoo to go through many pages with possibly uninteresting results.

Notes:  
  - It is advised to handle the pop-ups (eg consent windows) before execution. Though there shall be no issues if it is not handled, but there is no guarantee.
  - Yandex uses very aggressive captcha quite often, so it is better to use only a small set of dorks for it. But you can also just try it with many dorks, if you are lucky, then the bot detector will be relaxed and will not bother you. Happens rarely though.

# Disclaimer:
This extension is designed to assist researchers in gathering publicly available data. The author is not responsible for users actions.

# Licence
MIT :copyright:
