'use strict';

if (!window.worker_injected){

  window.worker_injected = true;

  // Execute only on the search page. The captcha page shall be ignored.
  if (location.href.startsWith('https://www.baidu.com/')){

    function extract_links(){
      let links = [], link_header = null, inner_links, link_href;
      /*
      All results have special class-combo.*/
      for (const div of document.getElementsByClassName('result c-container xpath-log new-pmd')){
        /*
        The actual links are stored in 'mu' attribute.*/
        if (div.hasAttribute('mu')){
          link_href = div.getAttribute('mu');
          /*
          Rarely some links are just null.*/
          if (link_href == 'null'){
            continue;
          }
          if (configs.extract_link_header){
            link_header = null;
            inner_links = div.getElementsByTagName('a');
            if (inner_links.length){
              link_header = inner_links[0].innerText.replaceAll('\n', ' ');
            }
            else {
              alert('Very unusual links are found. Check it.');
            }
          }
          links.push({
            'href': link_href,
            'header': link_header,
          });
        }
      }
      return links;
    }
    window.extract_links = extract_links;

    function get_state(){
      let no_results = document.getElementsByClassName('content_none')[0];
      let next_button = undefined;
      let search_btns_container = document.getElementsByClassName('page-inner_2jZi2')[0];

      if (search_btns_container){
        let search_btns = search_btns_container.getElementsByTagName('a');
        const btns_len = search_btns.length;
        if (btns_len){
          if (search_btns[btns_len - 1].className == 'n'){
            next_button = search_btns[btns_len - 1];
          }
          else {
            // The last page was reached. There is no "next" btn at the end of the array with anchors.
            next_button = 'null';
          }
        }
        // The page has several results. There are no btns but container still exists.
        else {
          next_button = 'null';
        }
      }
      return [no_results, next_button];
    }
    window.get_state = get_state;

    /*
    The decision was made to simply call setTimeout recursevely until the necessary tags exist.
    The MutationObserver API was tried but i could not make it work correctly. */
    function recursive_checker(){
      setTimeout(
        () => {
          const [no_results, next_button] = get_state();
          if (no_results || next_button){
            const links = extract_links();
            // The end was reached.
            if (no_results || next_button == 'null'){
              finish_current_search(links);
            }
            // There are more links to fetch.
            else if (next_button){
              add_links_to_db(links);
              handle_button(next_button);
            }
          }
          else {
            recursive_checker();
          }
        },
        100
      );
    }
    window.recursive_checker = recursive_checker;
    recursive_checker();
  }
}
// Baidu sometimes loads asynchronously without reloading the page.
else {
  recursive_checker();
}