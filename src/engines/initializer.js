'use strict';

let engine; // Define as global, because the background sends it only in the first message.

function initialize_storage_and_start_engine(){
  /*
  Stores configurations and dorks in the sessionStorage.
  Also executes the first dork from the provided list.
  */
  const start_url = SEARCH_ENGINES[engine].start_url;

  sessionStorage.setItem('AD_engine', engine);
  sessionStorage.setItem('AD_start_url', start_url);
  sessionStorage.setItem('AD_dorks_length', DORKS[engine].length);
  sessionStorage.setItem('AD_current_dork_index', 0);

  for (const [i, dork] of DORKS[engine].entries()){
    // No need to store the first dork.
    if (i != 0){
      sessionStorage.setItem('AD_' + i, dork);
    }
  }
  /******************************************
  Each engine might require special handling.
  */
  const first_dork = DORKS[engine][0];

  if (start_url === null){
    if (engine == 'baidu'){
      document.getElementById('kw').value = first_dork; // The input tag of the "search" btn.
      document.getElementById('su').click(); // The "search" btn.
    }
    else if (engine == 'duckduckgo'){
      document.getElementById('searchbox_input').value = first_dork;
      document.getElementById('searchbox_homepage').submit();
    }
    else if (engine == 'brave'){
      document.getElementById('searchbox').value = first_dork;
      document.getElementById('searchform').submit();
    }
    else if (engine == 'ecosia'){
      document.querySelector('[data-test-id=search-form-input]').value = first_dork;
      document.querySelector('[data-test-id=main-header-search-form]').submit();
    }
  }
  else {
    location.href = start_url + encodeURIComponent(first_dork);
  }
}

function initialize_database(){
  /*
  The db_already_exists is used to reinitialize DB,
  because it is possible that it was already created but not cleaned.
  Eg tab was closed before the searching process was finished.
  */
  let db_already_exists = true;
  const open_request = indexedDB.open(engine, 1);

  open_request.onerror = (event) => {
    alert(
      'A connection to indexedDB could not be opened. The indexedDB is probably not enabled. ' +
      `Further execution of the AutoDorker for ${engine} was stopped.`
    );
  };
  open_request.onblocked = (event) => {
    alert(
      'A connection to indexedDB at the time of initialization was blocked for an unknown reason. ' +
      `Further execution of the AutoDorker for ${engine} was stopped.`
    );
  };
  open_request.onsuccess = (event) => {
    const db = open_request.result;
    if (db_already_exists){
      const transaction = db.transaction(['links'], 'readwrite');
      transaction.oncomplete = (event) => {
        db.close();
        initialize_storage_and_start_engine();
      };
      transaction.onerror = (event) => {
        alert(
          'Failed to clear the database. Please close the tab.' +
          'Further execution might have unwanted side effects.'
        );
      };
      const object_store = transaction.objectStore('links');
      const clear_request = object_store.clear();
      clear_request.onerror = (event) => {
        alert('Failed to execute IDB clear request.');
      };
    }
    else {
      db.close();
      initialize_storage_and_start_engine();
    }
  };
  open_request.onupgradeneeded = (event) => {
    // After db creation onupgradeneeded event is always fired before onsuccess.
    db_already_exists = false;
    const db = event.target.result;
    db.createObjectStore('links', { keyPath: 'href' });
  };
}

chrome.runtime.onMessage.addListener((message, sender) => {
  /*
  Listen to the messages coming from the background script.
  */
  const event = message.event;
  if (engine === undefined){
    engine = message.engine;
  }

  if (event == 'scripts_injection'){
    const open_url = SEARCH_ENGINES[engine].open_url;
    /*
    Check if the proper URL was opened. It might happen that a page (eg captha) with some other domain was opened.
    If that is the case, then an error will be thrown when trying to access indexedDB, because it was created for
    that domain and not for the domain defined in the open_url.
    */
    if (open_url && location.href.includes(open_url)){
      chrome.runtime.sendMessage({ caller: 'initializer', engine: engine });
    }
    else {
      // No message is sent. The background will not set the "initialized" state and will inject this script again later.
    }
  }
  else if (event == 'successful_initializion'){
    initialize_database();
  }
});
