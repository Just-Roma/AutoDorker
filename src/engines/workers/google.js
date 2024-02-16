'use strict';

if (!window.worker_injected){

  window.worker_injected = true;

  // Execute only on the search page. The captcha page shall be ignored.
  if (location.href.startsWith('https://www.google.com/search')){

    // Analyze page's state.
    const scroll_button = document.getElementsByClassName('GNJvt ipz2Oe')[0];
    const scroll_button_parent = document.getElementsByClassName('WZH4jc w7LJsc')[0];
    const repeat_the_search_btn = document.getElementById('ofr');

    function click_more_results_button(){
      /* Imitate clicking on the "More results" button.
      */
      if (scroll_button_parent){
        const available_height = screen.availHeight;
        let scroll_button_position = scroll_button_parent.getBoundingClientRect();
        /*
        Safety measure: It might happen that the button has coordinates
        beyond visible area at the time of click event. If that is the case,
        an error will be produced and the auto scrolling might get stopped.
        */
        while (scroll_button_position.bottom > available_height){
          scroll_button_position = scroll_button_parent.getBoundingClientRect();
        }
        let x = (scroll_button_position.left + scroll_button_position.width)/2;
        let y = (scroll_button_position.bottom + scroll_button_position.top)/2;
        /*
        The scroll_button_parent is used to detect whether it is the very bottom of a page,
        because it will be at the top of the tags-stack at x,y point there.
        */
        if (document.elementFromPoint(x, y) == scroll_button_parent){
          const links = extract_links();
          finish_current_search(links);
        }
        else {
          scroll_button.click();
        }
      }
      // If there are no/very few results, then there will be no scroll_button.
      else {
        const links = extract_links();
        finish_current_search(links);
      }
    }

    function extract_links(){
      let links = [];
      let h3, link_header = null;
      for (const link of document.getElementsByTagName('a')){
        if (link.hasAttribute('jsname') && link.getAttribute('jsname') == 'UWckNb'){
          if (configs.extract_link_header){
            h3 = link.getElementsByTagName('h3');
            if (h3.length){
              link_header = h3[0].innerText;
            }
            else {
              alert('Very unusual link is found. Please check.');
            }
          }
          links.push({
            'href': link.href,
            'header': link_header,
          });
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
            /*
            The "repeat the search with the omitted results included" button.*/
            const very_bottom_button = document.getElementById('ofr');
            let click_it = true;
            if (very_bottom_button){
              click_it = false;
              very_bottom_button.getElementsByTagName('a')[0].click();
            }
            if (click_it){
              click_more_results_button();
            }
          }
        }
      }
    };
    const observer = new MutationObserver(callback);
    observer.observe(document.getElementById('main'), { childList: true, subtree: true });

    // There are more links to fetch.
    if (scroll_button_parent){
      window.scrollTo(0, document.body.scrollHeight); // Trigger mutation observer.
    }
    // In case of the "repeat the search with the omitted results included" button.
    else if (repeat_the_search_btn){
      repeat_the_search_btn.getElementsByTagName('a')[0].click();
    }
    // All results are already shown.
    else {
      const links = extract_links();
      finish_current_search(links);
    }
  }
}
