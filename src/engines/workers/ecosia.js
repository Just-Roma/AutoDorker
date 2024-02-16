'use strict';

if (!window.worker_injected){

  window.worker_injected = true;

  // Execute only on the search page.
  if (location.href.startsWith('https://www.ecosia.org/search')){

    // Analyze page's state.
    // const captcha = document.getElementById('captcha-iframe');
    // const no_results = document.querySelector('[data-test-id=web-no-results]');
    let next_button = document.querySelector('[data-test-id=next-button]');

    function extract_links(){
      let links = [], link_header = null;
      /*
      Loop over all div containers with results. */
      for (const div of document.getElementsByClassName('mainline__result-wrapper')){
        /*
        Relevant results have special attr value. */
        if (div.getAttribute('data-test-id') == 'mainline-result-web'){
          /*
          Seems like the first 2 anchors are the same. */
          let div_links = div.getElementsByTagName('a');
          if (div_links.length >= 2 && div_links[0].href == div_links[1].href){
            let link = div_links[1];
            if (configs.extract_link_header){
              /*
              The title is a text within h2 tag. */
              let h2 = link.querySelector('[data-test-id=result-title]');
              if (h2){
                link_header = h2.innerText.replaceAll('\n', ' ');
              }
              else {
                alert('The title (h2 tag) is absent. Please check.');
              }
            }
            links.push({
              'href': link.href,
              'header': link_header,
            });
          }
          // If link is null.
          else {
            alert('Very unusual div with no link is found. Please check.');
          }
        }
      }
      return links;
    }

    // Captcha is on the same host.
    // if (captcha){
      ////just skip.
    // }
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
