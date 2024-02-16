'use strict';

const div_chosen_engines_without_dorks = document.getElementById('chosen_engines_without_dorks');
const main_container = document.getElementById('main_container');
const info_container = document.getElementById('info_container');
const search_engines_container = document.getElementById('search_engines_container');

// Append engines to html.
for (const [engine, engine_configs] of Object.entries(SEARCH_ENGINES)){
  /*
  Append only if user has chosen the engine. */
  if (engine_configs.active){
    /*
    Create all necessary tags. */
    let label = document.createElement('label');
    label.classList.add('lns-checkbox');
    
    let input = document.createElement('input');
    input.type = 'checkbox';
    input.id = engine;
    if (engine_configs.checked){
      input.checked = 'checked';
    }
    
    let span = document.createElement('span');
    span.innerText = engine[0].toUpperCase() + engine.slice(1);
    
    label.append(input, span);
    search_engines_container.appendChild(label);
  }
}

document.getElementById('start_button').addEventListener('click', () => {
  let failure_detected = false;
  let chosen_engines_without_dorks = [];
  div_chosen_engines_without_dorks.style.display = 'none'; // Hide if previously opened.

  for (const input of search_engines_container.getElementsByTagName('input')){
    if (input.checked){
      let engine = input.id;
      /*
      Check if engine is present and the associated list of dorks is not empty.*/
      if (engine in DORKS && DORKS[engine].length){
        chrome.runtime.sendMessage({ caller: 'popup', engine: engine, engine_configs: SEARCH_ENGINES[engine] }).
        catch(error => {
          failure_detected = true;
          console.error(`Failed to send a message to the background script: ${error}`);
        });
      }
      else {
        chosen_engines_without_dorks.push(engine);
      }
    }
  }
  if (chosen_engines_without_dorks.length){
    div_chosen_engines_without_dorks.innerHTML =
      'The following chosen engines were not started, because no dorks for them were provided:<br>' +
      chosen_engines_without_dorks.join(', ');
    div_chosen_engines_without_dorks.style.display = 'block';
  }
  if (failure_detected){
    main_container.style.display = 'none';
    document.getElementById('tab_error').style.display = 'block';
  }
});

document.getElementById('info_button').addEventListener('click', () => {
  main_container.style.display = 'none';
  info_container.style.display = 'block';
});

document.getElementById('return_button').addEventListener('click', () => {
  info_container.style.display = 'none';
  main_container.style.display = 'block';
});
