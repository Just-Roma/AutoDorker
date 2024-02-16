'use strict';

if (!window.utils_injected){

  window.utils_injected = true;
  /*
  Extract user-defined configurations and store them in a global Object.*/
  window.configs = {
    engine:             sessionStorage.getItem('AD_engine'),
    start_url:          sessionStorage.getItem('AD_start_url'),
    dorks_length:       Number(sessionStorage.getItem('AD_dorks_length')),
    current_dork_index: Number(sessionStorage.getItem('AD_current_dork_index')),
  };
  // This script can be injected into captcha page. Check if objects exist to avoid errors.
  if (COMMON_CONFIGURATIONS){
    for (const [key, val] of Object.entries(COMMON_CONFIGURATIONS)){
      configs[key] = val;
    }
  }
  if (OWN_CONFIGURATIONS && configs.engine){
    for (const [key, val] of Object.entries(OWN_CONFIGURATIONS[configs.engine])){
      configs[key] = val;
    }
  }

  /* Not needed for now.
  function click(x, y){
    const ev = new MouseEvent('click', {
      'view': window,
      'bubbles': true,
      'cancelable': true,
      'screenX': x,
      'screenY': y
    });
    document.elementFromPoint(x, y).dispatchEvent(ev);
  }
  window.click = click;
  */

  function dork_it(){
    /* Update the storage's state and search the next dork.
    */
    const next_dork_index = configs.current_dork_index + 1;
    sessionStorage.setItem('AD_current_dork_index', next_dork_index);
    const next_dork = sessionStorage.getItem('AD_' + next_dork_index);

    function call_next_dork(){
      // Try to mimic user behavior (eg press btns).
      if (configs.start_url == 'null'){ // null is str because it is stored in sessionStorage.
        if (configs.engine == 'baidu'){
          document.getElementById('kw').value = next_dork;
          document.getElementById('form').submit();
        }
        else if (configs.engine == 'duckduckgo'){
          document.getElementById('search_form_input').value = next_dork;
          document.getElementById('search_button').click();
        }
        else if (configs.engine == 'brave'){
          document.getElementById('searchbox').value = next_dork;
          document.getElementById('searchform').submit();
        }
        else if (configs.engine == 'ecosia'){
          document.querySelector('[data-test-id=search-form-input]').value = next_dork;
          document.querySelector('[data-test-id=main-header-search-form]').submit();
        }
      }
      else {
        location.href = configs.start_url + encodeURIComponent(next_dork);
      }
    }

    if (configs.delay !== null){
      let current_delay = configs.delay;
      if (Array.isArray(current_delay)){
        current_delay = current_delay[0] + Math.random() * (current_delay[1] - current_delay[0]);
      }
      setTimeout(() => { call_next_dork(); }, current_delay);
    }
    else {
      call_next_dork();
    }
  }
  window.dork_it = dork_it;

  function download_collected_data(data){
    /*
    Transform the given data and download it.
    The data must be in form: {link: {key: val}}
    */
    if (Object.keys(data).length){ // Ignore empty objects.
      const download_anchor = document.createElement('a');
      document.body.appendChild(download_anchor); // Required for Firefox.
      if (configs.download_json){
        const encoded_data = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data));
        download_anchor.setAttribute('href', encoded_data);
        download_anchor.setAttribute('download', configs.file_name + '.json');
        download_anchor.click();
      }
      if (configs.download_csv){
        // Issue: sequence of keys may not be the same.
        let transformed_data = [['URL']], flattened_link_data;
        for (const [link, link_data] of Object.entries(data)){
          flattened_link_data = [link];
          for (const [key, val] of Object.entries(link_data)){
            if (!transformed_data[0].includes(key)){
              transformed_data[0].push(key);
            }
            // Replace all commas, because they are special in CSV.
            if (typeof(val) == 'string'){
              flattened_link_data.push(val.replaceAll(',', ' '));
            }
            else {
              flattened_link_data.push(val);
            }
          }
          transformed_data.push(flattened_link_data);
        }
        transformed_data = transformed_data.join('\n');
        const blob = new Blob([transformed_data], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        download_anchor.setAttribute('href', url);
        download_anchor.setAttribute('download', configs.file_name + '.csv');
        download_anchor.click();
      }
    }
  }
  window.download_collected_data = download_collected_data;

  function add_links_to_db(links){
    /*
    "links" is an array with link-objects, which will be added to DB.
    */
    const open_request = indexedDB.open(configs.engine, 1); // "engine" is a DB name.
    open_request.onerror = (event) => {
      alert(
        'Failed to open connection to indexedDB. Reloading the page might help. ' +
        'If it does not, then there is smth wrong with indexedDB\'s API.'
      );
    };
    open_request.onblocked = (event) => {
      alert(
        'The connection to the indexedDB was blocked for an unknown reason. Reloading ' +
        'the page might help. If it does not, then there is smth wrong with indexedDB\'s API.'
      );
    };
    open_request.onsuccess = (event) => {
      const db = open_request.result;
      const transaction = db.transaction('links', 'readwrite');

      transaction.onerror = (event) => {
        alert('Failed to start transaction. Results can not be stored.');
      };
      transaction.oncomplete = (event) => {
        db.close();
      };

      const store_request = transaction.objectStore('links');
      for (const link of links){
        const request = store_request.put(link);
        request.onerror = (event) => {
          alert(`Failed to add link (${link.href}) to DB.`);
        };
      }
    };
  }
  window.add_links_to_db = add_links_to_db;

  function extract_from_db_and_download(links){
    /*
    "links" is an Array, which will be transformed into Object and then updated with links from DB.
    */
    let links_obj = {}, _tmp;
    for (const link of links){
      _tmp = {};
      for (const attr in link){
        if (attr != 'href'){ _tmp[attr] = link[attr]; }
      }
      links_obj[link.href] = _tmp;
    }

    const open_request = indexedDB.open(configs.engine, 1); // "engine" is a DB name.
    open_request.onerror = (event) => {
      alert('Failed to open connection to indexedDB. Results can not be downloaded.');
    };
    open_request.onblocked = (event) => {
      alert('The connection to the indexedDB was blocked. Results can not be downloaded.');
    };
    open_request.onsuccess = (event) => {
      const db = open_request.result;
      const transaction = db.transaction('links', 'readwrite');

      transaction.onerror = (event) => {
        alert('Failed to start transaction. Results can not be downloaded.');
      };
      transaction.oncomplete = (event) => {
        db.close();
        download_collected_data(links_obj);
      };

      const get_links_request = transaction.objectStore('links').getAll();

      get_links_request.onerror = (event) => {
        alert('Failed to get links from DB. Results can not be downloaded.');
      };
      get_links_request.onsuccess = (event) => {
        for (const link of get_links_request.result){
          const {href, ...tmp_obj} = link;
          links_obj[href] = tmp_obj;
        }
        const object_store = transaction.objectStore('links');
        const clear_request = object_store.clear();
        clear_request.onerror = (event) => {
          alert('Failed to execute IDB clear request.');
        };
      };
    };
  }
  window.extract_from_db_and_download = extract_from_db_and_download;

  function create_finish_current_search(){

    // Special protection against multiple executions.
    let already_executed = false;

    function finish_current_search(links=[]){
      /* This func decides what to do after all links for the current dork have been fetched.
      */
      if (already_executed){ return; }
      already_executed = true;

      // Finish: There are no more dorks.
      if (configs.current_dork_index == configs.dorks_length - 1){
        extract_from_db_and_download(links);
      }
      // Store the collected stuff in DB. Then handle the next dork.
      else {
        if (links.length){ add_links_to_db(links); }
        dork_it();
      }
    }
    return finish_current_search;
  }
  window.finish_current_search = create_finish_current_search();
  
  function handle_button(btn){
    /* Just a wrapper for a button clicking with delay functionality.
    */
    if (configs.delay !== null){
      let current_delay = configs.delay;
      if (Array.isArray(current_delay)){
        current_delay = current_delay[0] + Math.random() * (current_delay[1] - current_delay[0]);
      }
      setTimeout(() => { btn.click(); }, current_delay);
    }
    else {
      btn.click();
    }
  }
  window.handle_button = handle_button;
}
