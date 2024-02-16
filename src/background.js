chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  /*
  Listen to messages coming from popup and content scripts.
  */
  const caller = message.caller;
  const engine = message.engine;
  
  if (caller == 'popup'){
    const open_url = message.engine_configs.open_url;
    
    chrome.storage.session.get([engine]).
    then(result => {
      if (engine in result && result[engine] == 'running'){
        // Do not do anything. Wait until it is closed/finished.
      }
      else {
        chrome.tabs.create({
          url: open_url,
          active: false, // Do not jump to opened tabs, so a user would see a failure/warning message if it occurrs.
        }).
        then(tab => {
          chrome.storage.session.set({
            [tab.id]: {
              engine: engine,
              initialized: false,
            }
          }).
          then(() => {
            chrome.storage.session.set({
              [engine]: 'running',
            }).
            catch(error => {
              console.error(`Failed to store tab's execution state for ${engine}: ${error}`);
            });
          }, error => {
            console.error(`Failed to store tab's settings for ${engine}: ${error}`);
          });
        }, error => {
          console.error(`Failed to create tab for ${engine}: ${error}`);
        });
      }
    }, error => {
      console.error(`Failed to get ${engine}'s settings: ${error}`);
    });
  }
  else if (caller == 'initializer'){
    const tabId = sender.tab.id;
    /*
    The initializer script has checked the opened URL for correctness. The 'initialized' state can be stored now.
    */
    chrome.storage.session.set({
      [tabId]: {
        engine: engine,
        initialized: true
      }
    }).
    then(() => {
      /* The state has been stored. There shall be no racing problem now. The initializer can proceed.
      */
      chrome.tabs.sendMessage(tabId, { event: 'successful_initializion' }).
      catch(error => {
        console.error(`Failed to confirm the successful initializion for ${engine}: ${error}`);
      });
    }, error => {
      console.error(`Failed to initialize the tab's state for ${engine}: ${error}`);
    });
  }
  else {
    // Add other content scripts if needed.
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {
  if ('status' in changeInfo && changeInfo.status == 'complete'){
    chrome.storage.session.get([String(tabId)]).
    then(result => {
      if (tabId in result){
        const engine = result[tabId].engine;
        if (result[tabId].initialized){
          chrome.scripting.executeScript({
            target: {tabId: tabId},
            files: [
              'configurations.js', // Injected because the file is small. Also simplifies the code: no storage handling.
              'src/engines/utils.js',
              'src/engines/workers/' + engine + '.js'
            ],
          }).
          catch(error => {
            console.error(`Failed to load utils/worker for ${engine}: ${error}`);
          });
        }
        else {
          chrome.scripting.executeScript({
            target: {tabId: tabId},
            files: [
              'dorks.js',
              'configurations.js',
              'src/engines/search_engines_configs.js',
              'src/engines/initializer.js'
            ],
          }).
          then(() => {
            chrome.tabs.sendMessage(tabId, {event: 'scripts_injection', engine: engine}).
            catch(error => {
              console.error(`Failed to send the first message to ${engine}'s initializer: ${error}`);
            });
          }, error => {
            console.error(`Failed to load configs/initializer for ${engine}: ${error}`);
          });
        }
      }
    }, error => {
      console.error(`Failed to get tab's settings: ${error}`);
    });
  }
});

chrome.tabs.onRemoved.addListener(tabId => {
  /*
  Change engine's execution state and remove
  tab's entry from the session storage afterwards.
  */
  chrome.storage.session.get([String(tabId)]).
  then(result => {
    if (tabId in result){
      const engine = result[tabId].engine;
      chrome.storage.session.set({
        [engine]: 'idle',
      }).
      then(() => {
        chrome.storage.session.remove([String(tabId)]).
        catch(error => {
          console.error(`Failed to remove tab: ${error}`);
        });
      }, error => {
        console.error(`Failed to set tab's execution state: ${error}`);
      });
    }
  }, error => {
    console.error(`Failed to get tab's settings: ${error}`);
  });
});
