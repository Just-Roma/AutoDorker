'use strict';

if (!window.configs_injected){

  window.configs_injected = true;

  /********************************************
  Common configurations for all search engines.
  These have lower precedence than those in OWN_CONFIGURATIONS.

  The following configs are supported by the extension:

  - extract_link_header:
    Try to extract the header-text associated with link. 
    
  - download_json:
    Download collected results in JSON.

  - download_csv:
    Download collected results in CSV.

  - delay:
    Delay between single requests. 
    Must be either null or a number. Measured in ms. 
    Use array with 2 numbers for random uniform: [n1, n2] with n2 >= n1.
    Random interval might have a positive effect on bot detection.
  */
  window.COMMON_CONFIGURATIONS = {
    extract_link_header: true,
    download_json: true,
    download_csv: false,
    delay: null,
  };


  /******************************
  Engine-specific configurations.

  Rules:
  - Configs defined in COMMON_CONFIGURATIONS can be overwritten.

  Supported configs:

  - file_name:
    The file name used to download the results.
  */
  window.OWN_CONFIGURATIONS = {
    google: {
      file_name: 'google_dorking_results',
      delay: null, // Does not really work properly.
    },
    yahoo: {
      file_name: 'yahoo_dorking_results',
      delay: [1000, 2000],
    },
    baidu: {
      file_name: 'baidu_dorking_results',
      delay: null,
    },
    yandex: {
      file_name: 'yandex_dorking_results',
    },
    duckduckgo: {
      file_name: 'duckduckgo_dorking_results',
      delay: [1000, 2000], 
    },
    bing: {
      file_name: 'bing_dorking_results',
      delay: null,
    },
    brave: {
      file_name: 'brave_dorking_results',
      delay: [1000, 2000],
    },
    ecosia: {
      file_name: 'ecosia_dorking_results',
      delay: [1000, 2000],
    },
  }
}
