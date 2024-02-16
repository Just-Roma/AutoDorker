'use strict';

if (!window.worker_injected){

  window.worker_injected = true;

  // Execute only on the search page. The captcha page shall be ignored.
  if (location.href.startsWith('https://search.yahoo.com/search')){

    // Analyze page's state.
    let next_button = null;
    for (const tag of document.getElementsByClassName('next')){
      if (tag.tagName == 'A'){
        next_button = tag;
      }
    }

    function extract_links(){
      let links = [];
      let link, div_links, link_header = null;
      /*
      Loop over all div containers with results. */
      for (const div of document.getElementsByClassName('compTitle options-toggle')){
        div_links = div.getElementsByTagName('a');
        if (div_links.length){
          link = div_links[0];
          if (configs.extract_link_header){
            link_header = link.innerText.replaceAll('\n', ' ');
          }
          links.push({
            'href': link.href,
            'header': link_header,
          });
        }
        else {
          alert('Very unusual div is found. Please check.');
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
