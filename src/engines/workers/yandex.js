'use strict';

if (!window.worker_injected){

  window.worker_injected = true;

  // Execute only on the search page. The captcha page shall be ignored.
  if (location.href.startsWith('https://yandex.com/search')){

    // Analyze page's state.
    const next_button = document.getElementsByClassName('VanillaReact Pager-Item Pager-Item_type_next')[0];
    const unrelated_results = document.getElementsByClassName('RequestMeta-Level RequestMeta-Level_type_reask')[0];
    const no_results = document.getElementsByClassName('RequestMeta-Level RequestMeta-Level_type_error')[0];

    function extract_links(){
      let links = [];
      let link, li_links, link_header = null;
      /*
      Loop over all li containers with results. */
      for (const li of document.getElementsByClassName('nsPnNLkWolah3 nsPnNLkWolah3_card ')){
        // Side windows have 'data-fast-name' attribute.
        if (!li.hasAttribute('data-fast-name')){
          li_links = li.getElementsByTagName('a');
          if (li_links.length){
            link = li_links[0];
            if (configs.extract_link_header){
              link_header = link.innerText.replaceAll('\n', ' ');
            }
            links.push({
              'href': link.href,
              'header': link_header,
            });
          }
          else {
            alert('Very unusual li is found. Please check.');
          }
        }
      }
      return links;
    }

    if (no_results || unrelated_results){
      finish_current_search();
    }
    // There are more links to fetch.
    else if (next_button){
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
  // Captcha.
  else {
    const not_robot_btn = document.getElementById('js-button');
    if (not_robot_btn){
      not_robot_btn.click();
    }
  }
}
