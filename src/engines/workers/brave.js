'use strict';

if (!window.worker_injected){

  window.worker_injected = true;

  // Execute only on the search page.
  if (location.href.startsWith('https://search.brave.com/search')){
  
    // Analyze page's state.
    const captcha = document.getElementById('pow-captcha-content');
    const no_results = document.getElementById('bad-results-content');
    let next_button;
    let next_btns = document.getElementById('pagination');
    if (next_btns){
      next_btns = next_btns.children;
      if (next_btns.length == 1){
        if (next_btns[0].disabled){
          // Btn is disabled. Leave it undefined.
        }
        else {
          next_button = next_btns[0];
        }
      }
      // Currently only 1 or 3 tags present.
      else if (next_btns.length == 3){
        if (next_btns[2].tagName == 'BUTTON'){ // The end was reached.
          next_button = null;
        }
        else if (next_btns[2].tagName == 'A'){ // There is more to fetch.
          next_button = next_btns[2];
        }
        else {
          alert('The btns were probably changed');
        }
      }
      else {
        alert('The pagination was probably changed');
      }
    }

    function extract_links(){
      let links = [];
      let link, classes, div_links, div_title, link_header = null;
      /*
      Loop over all div containers with results. */
      for (const div of document.getElementsByClassName('snippet svelte-me7t04')){
        classes = div.classList;
        if (classes.length == 2 && classes.contains('snippet') && classes.contains('svelte-me7t04')){
          div_links = div.getElementsByTagName('a');
          if (div_links.length){
            link = div_links[0];
            if (configs.extract_link_header){
              div_title = link.getElementsByClassName('title');
              if (div_title.length == 1){
                link_header = div_title[0].innerText.replaceAll('\n', ' ');
              }
              else {
                alert('Very unusual div title is found. Please check.');
              }
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
      }
      return links;
    }


    if (next_button){
      const links = extract_links();
      add_links_to_db(links);
      handle_button(next_button);
    }
    else if (no_results){
      const links = extract_links();
      finish_current_search(links);
    }
    // All results are already shown.
    else {
      if (captcha){
        const btn = document.getElementById('pow-captcha-top').getElementsByTagName('button')[0];
        if (btn){
          btn.click();
        }
      }
      else {
        const links = extract_links();
        finish_current_search(links);
      }
    }
  }
}
