'use strict';

if (!window.worker_injected){

  window.worker_injected = true;

  // Execute only on the search page. The captcha page shall be ignored.
  if (location.href.startsWith('https://duckduckgo.com/')){

    // Analyze page's state.
    const captcha = document.getElementsByClassName('anomaly-modal__mask')[0];
    const more_results_button = document.getElementById('more-results');
    const no_results = document.getElementsByClassName('LN5tjiK61EiLHnh3XMt_')[0];

    function extract_links(){
      let links = [];
      let span, li_links, link_header = null;
      for (const li of document.getElementsByClassName('wLL07_0Xnd1QZpzpfR4W')){
        li_links = li.getElementsByTagName('a');
        // The first link is logo with search href, the second and third seem to be always equal.
        if (li_links.length > 2 && li_links[1].href == li_links[2].href){
          if (configs.extract_link_header){
            span = li.getElementsByClassName('EKtkFWMYpwzMKOYr0GYm LQVY1Jpkk8nyJ6HBWKAk')[0];
            if (span){
              link_header = span.innerText;
            }
            else {
              alert('Very unusual span is found. Please check.');
            }
          }
          links.push({
            'href': li_links[1].href,
            'header': link_header,
          });
        }
        else {
          alert('Very unusual li is found. Please check.');
        }
      }
      return links;
    }

    // Mutation observer is used to automatically scroll to the bottom of the page.
    const callback = (mutationList, observer) => {
      /*
      The not_clicked is used to reduce the amount of "click_more_results_button" calls,
      because mutationList can contain several entries. It does not restrict the amount of
      simaltenious callbacks though. But it seems to work fine anyway. Probably because
      several clicks perform the same action almost instantly.
      */
      let not_clicked = true;
      for (const mutation of mutationList){
        if (mutation.type === "childList"){
          if (not_clicked){
            not_clicked = false;
            window.scrollTo(0, document.body.scrollHeight);
            const more_results_button = document.getElementById('more-results');
            if (more_results_button){
              handle_button(more_results_button);
            }
            else {
              const links = extract_links();
              finish_current_search(links);
            }
          }
        }
      }
    };
    const observer = new MutationObserver(callback);
    observer.observe(document.getElementsByClassName('site-wrapper  js-site-wrapper')[0], { childList: true, subtree: true });

    // Captcha is on the same host.
    if (captcha){
      // just skip.
    }
    // No match, but unrelated results shown:
    else if (no_results){
      finish_current_search();
    }
    // There are more links to fetch.
    else if (more_results_button){
      // Trigger mutation observer.
      handle_button(more_results_button);
    }
    // All results are already shown.
    else {
      const links = extract_links();
      finish_current_search(links);
    }
  }
}
