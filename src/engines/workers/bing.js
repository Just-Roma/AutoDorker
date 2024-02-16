'use strict';

if (!window.worker_injected){

  window.worker_injected = true;

  // Execute only on the search page. The captcha page shall be ignored.
  if (location.href.startsWith('https://www.bing.com/search')){

    // Analyze page's state.
    let next_button = document.getElementsByClassName('sb_pagN sb_pagN_bp b_widePag sb_bp')[0];
    // Check if href is present. It does not on the last page but the tag still exists.
    if (next_button && !next_button.href){
      next_button = undefined;
    }

    function extract_links(){
      let links = [];
      let link, h2, link_href, link_header = null;
      /*
      Loop over all div containers with results. */
      for (const div of document.getElementsByClassName('b_algo')){
        h2 = div.getElementsByTagName('h2');
        if (h2.length){
          link = h2[0].getElementsByTagName('a');
          if (link.length == 1){
            link = link[0];
            link_href = link.href;
            if (configs.extract_link_header){
              link_header = link.innerText.replaceAll('\n', ' ');
            }
            links.push({
              'href': link_href,
              'header': link_header,
            });
          }
          else {
            alert('Very unusual link is found. Please check.');
          }
        }
        else {
          alert('Very unusual h2 is found. Please check.');
        }
      }
      return links;
    }

    // There are more links to fetch.
    if (next_button){
      const links = extract_links();
      add_links_to_db(links);
      handle_button(next_button);
    }
    // All results are already shown.
    else {
      const links = extract_links();
      finish_current_search(links);
    }
  }
}
